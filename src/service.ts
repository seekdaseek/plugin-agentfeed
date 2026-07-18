// service.ts — AgentFeedService: holds the Solana payer signer and the x402-wrapped fetch.
// Payment flow is a direct port of AgentFeed's verified reference client
// (@solana/kit signer -> toClientSvmSigner -> wrapFetchWithPaymentFromConfig + ExactSvmScheme).
//
// Spend guard: before ever paying a path, we do one plain (unpaid) request, read the 402
// quote, and refuse if it exceeds AGENTFEED_MAX_SPEND_PER_CALL. Approved paths are cached
// for QUOTE_TTL_MS so subsequent calls pay immediately with a single request.

import { Service, type IAgentRuntime, logger } from '@elizaos/core';
import { createKeyPairSignerFromBytes } from '@solana/kit';
import { toClientSvmSigner } from '@x402/svm';
import { ExactSvmScheme } from '@x402/svm/exact/client';
import { wrapFetchWithPaymentFromConfig, decodePaymentResponseHeader } from '@x402/fetch';
import bs58 from 'bs58';

const DEFAULT_BASE_URL = 'https://x402.ochinimus.app';
// 0.05 = the price of our most expensive tool (get_cascade_scan). At the old default of
// 0.02 the plugin REFUSED to pay for it — silently, as a declined quote, not an error.
const DEFAULT_MAX_SPEND_USD = 0.50;
const QUOTE_TTL_MS = 10 * 60 * 1000; // re-verify price every 10 min

/** USDC has 6 decimals on Solana. */
const USDC_DECIMALS = 6;

interface PaidResult {
  ok: boolean;
  status: number;
  data: unknown;
  paidUsd?: number;
  settlement?: unknown;
  error?: string;
}

export class AgentFeedService extends Service {
  static serviceType = 'agentfeed';
  capabilityDescription =
    'Pays for and fetches live crypto market data (liquidations, positioning, funding, prices, token risk) from the AgentFeed x402 API on Solana.';

  private payFetch!: (url: string, init?: RequestInit) => Promise<Response>;
  private baseUrl: string = DEFAULT_BASE_URL;
  private maxSpendUsd: number = DEFAULT_MAX_SPEND_USD;
  private payerAddress = '';
  /** path -> { usd, checkedAt } of last approved quote */
  private approvedQuotes = new Map<string, { usd: number; checkedAt: number }>();
  /** requirements that survived the spend policy on the most recent payment */
  private lastSurvivingReqs: any[] = [];
  /** lifetime spend counter for this process (informational) */
  private totalSpentUsd = 0;

  constructor(protected runtime: IAgentRuntime) {
    super(runtime);
  }

  static async start(runtime: IAgentRuntime): Promise<AgentFeedService> {
    const svc = new AgentFeedService(runtime);
    await svc.init();
    return svc;
  }

  async stop(): Promise<void> {
    /* no persistent connections */
  }

  private getSettingStr(key: string): string | undefined {
    const v = this.runtime.getSetting(key);
    return typeof v === 'string' && v.length > 0 ? v : undefined;
  }

  private async init(): Promise<void> {
    this.baseUrl = (this.getSettingStr('AGENTFEED_BASE_URL') || DEFAULT_BASE_URL).replace(/\/+$/, '');
    const cap = Number(this.getSettingStr('AGENTFEED_MAX_SPEND_PER_CALL'));
    this.maxSpendUsd = Number.isFinite(cap) && cap > 0 ? cap : DEFAULT_MAX_SPEND_USD;

    const rawKey = this.getSettingStr('AGENTFEED_PRIVATE_KEY');
    if (!rawKey) {
      throw new Error(
        'plugin-agentfeed: AGENTFEED_PRIVATE_KEY is not set. Provide a base58 private key or a solana-keygen JSON byte array for a wallet holding USDC on Solana mainnet.',
      );
    }

    const bytes = parseKey(rawKey);
    const keypair = await createKeyPairSignerFromBytes(bytes);
    this.payerAddress = keypair.address;
    const signer = toClientSvmSigner(keypair);

    // Send-time spend bound: filters payment requirements INSIDE the wrapper,
    // immediately before payment creation. A server quoting higher at pay time
    // than at preflight gets its requirement dropped; if nothing remains under
    // the cap, the wrapper fails the payment instead of overpaying.
    const capBaseUnits = Math.round(this.maxSpendUsd * 10 ** USDC_DECIMALS);
    const maxSpendPolicy = (_v: number, reqs: any[]) => {
      const surviving = reqs.filter((r) => {
        const raw = Number(r?.maxAmountRequired ?? r?.amount ?? r?.maxAmount);
        return Number.isFinite(raw) && raw > 0 && raw <= capBaseUnits;
      });
      // The signer consumes from this filtered set (default selector: first
      // entry for a registered scheme). Record it so accounting reflects the
      // requirement actually signed, not the preflight quote.
      this.lastSurvivingReqs = surviving;
      return surviving;
    };

    this.payFetch = wrapFetchWithPaymentFromConfig(fetch, {
      schemes: [{ network: 'solana:*', client: new ExactSvmScheme(signer) }],
      policies: [maxSpendPolicy],
    }) as typeof this.payFetch;

    logger.info(
      `[agentfeed] ready — payer ${this.payerAddress.slice(0, 4)}…${this.payerAddress.slice(-4)}, base ${this.baseUrl}, cap $${this.maxSpendUsd}/call`,
    );
  }

  /** Extract the max USD price from a 402 response body (x402 "accepts" array). */
  private quoteFromBody(body: any): number | null {
    const accepts = body?.accepts;
    if (!Array.isArray(accepts) || accepts.length === 0) return null;
    let maxUsd = 0;
    for (const a of accepts) {
      const raw = a?.maxAmountRequired ?? a?.amount ?? a?.maxAmount;
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) {
        // amounts are in USDC base units (6 decimals)
        maxUsd = Math.max(maxUsd, n / 10 ** USDC_DECIMALS);
      }
    }
    return maxUsd > 0 ? maxUsd : null;
  }

  /**
   * Spend guard. Returns the approved quote in USD, or throws if over cap /
   * unquotable. Cached per path for QUOTE_TTL_MS.
   */
  private async preflight(path: string): Promise<number> {
    const cached = this.approvedQuotes.get(path);
    if (cached && Date.now() - cached.checkedAt < QUOTE_TTL_MS) return cached.usd;

    const res = await fetch(this.baseUrl + path, { method: 'GET' });
    if (res.status !== 402) {
      // free mode or no payment required — nothing to guard
      this.approvedQuotes.set(path, { usd: 0, checkedAt: Date.now() });
      return 0;
    }
    let quoted: number | null = null;
    // x402 v2: quote lives in the base64 `payment-required` header
    const prHeader = res.headers.get('payment-required') || res.headers.get('x-payment-required');
    if (prHeader) {
      try {
        quoted = this.quoteFromBody(JSON.parse(atob(prHeader)));
      } catch {
        /* fall through to body */
      }
    }
    if (quoted === null) {
      try {
        quoted = this.quoteFromBody(await res.json());
      } catch {
        /* fall through */
      }
    }
    if (quoted === null) {
      throw new Error(`AgentFeed returned 402 for ${path} but the quote could not be parsed; refusing to pay blind.`);
    }
    if (quoted > this.maxSpendUsd) {
      throw new Error(
        `AgentFeed quoted $${quoted} for ${path}, above the configured cap of $${this.maxSpendUsd} (AGENTFEED_MAX_SPEND_PER_CALL). Call refused.`,
      );
    }
    this.approvedQuotes.set(path, { usd: quoted, checkedAt: Date.now() });
    return quoted;
  }

  /** Paid GET against AgentFeed. Guard first, then x402 pay-and-retry fetch. */
  async paidGet(path: string): Promise<PaidResult> {
    try {
      const quotedUsd = await this.preflight(path);
      const res = await this.payFetch(this.baseUrl + path, { method: 'GET' });

      let settlement: unknown;
      const settleHeader = res.headers.get('payment-response') || res.headers.get('x-payment-response');
      if (settleHeader) {
        try {
          settlement = decodePaymentResponseHeader(settleHeader);
        } catch {
          settlement = settleHeader.slice(0, 120);
        }
      }

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        return { ok: false, status: res.status, data, error: `AgentFeed HTTP ${res.status}` };
      }
      let paidUsd = 0;
      if (settlement) {
        const s: any = settlement;
        // Prefer: amount in the settlement itself; else the requirement the
        // signer consumed (matching the settled network); else preflight quote.
        let raw = Number(s?.amount ?? s?.paidAmount);
        if (!Number.isFinite(raw) || raw <= 0) {
          const net = String(s?.network ?? '');
          const req = this.lastSurvivingReqs.find((r) => String(r?.network ?? '') === net) ?? this.lastSurvivingReqs[0];
          raw = Number(req?.maxAmountRequired ?? req?.amount ?? req?.maxAmount);
        }
        paidUsd = Number.isFinite(raw) && raw > 0 ? raw / 10 ** USDC_DECIMALS : quotedUsd;
        this.totalSpentUsd += paidUsd;
      }
      return { ok: true, status: res.status, data, paidUsd, settlement };
    } catch (e: any) {
      return { ok: false, status: 0, data: null, error: e?.message || String(e) };
    }
  }

  get spentUsd(): number {
    return this.totalSpentUsd;
  }
  get payer(): string {
    return this.payerAddress;
  }
}

/** Accepts a base58 secret key string or a solana-keygen JSON byte array. */
function parseKey(raw: string): Uint8Array {
  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) {
    const arr = JSON.parse(trimmed);
    if (!Array.isArray(arr)) throw new Error('AGENTFEED_PRIVATE_KEY JSON must be a byte array');
    return Uint8Array.from(arr);
  }
  return bs58.decode(trimmed);
}
