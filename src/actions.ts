// actions.ts — one elizaOS Action per AgentFeed endpoint, generated from ENDPOINTS.
// Handler: resolve path params from the message, call the paid API through
// AgentFeedService, hand the raw JSON to the agent via callback.

import type {
  Action,
  ActionExample,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
} from '@elizaos/core';
import { AgentFeedService } from './service.js';
import {
  ENDPOINTS, BASE58_RE, SYMBOL_RE, EVM_RE, PERP_RE,
  matchTicker, matchCoin, matchChain, matchUrl, matchSecTicker, matchForm, matchWindow, matchTradfiSymbol, matchFxBase,
  matchSwaps, resolveInput,
  type EndpointDef,
} from './endpoints.js';

/** Inputs travel in the URL of a GET. A request line past this many characters is answered 431/414 before any payment is asked for. */
const MAX_PATH_CHARS = 8000;

function buildExamples(def: EndpointDef): ActionExample[][] {
  return def.triggers.slice(0, 2).map((t) => [
    {
      name: '{{user1}}',
      content: { text: t.replace('<mint>', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v').replace('<address>', '4a8o45skRPcyjAdyR8yES215Swvh8uTpZD6KLarhxCJ7').replace('<symbol>', 'CRCLx') },
    },
    {
      name: '{{agent}}',
      content: {
        text: 'Pulling live data from AgentFeed…',
        actions: [def.action],
      },
    },
  ]);
}

function makeAction(def: EndpointDef): Action {
  return {
    name: def.action,
    similes: def.similes,
    description: def.description,

    validate: async (_runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
      const text = message?.content?.text ?? '';
      if (def.input) return !('refusal' in resolveInput(def.input, text));
      if (def.param === 'symbol') return SYMBOL_RE.test(text);
      if (def.param === 'ticker') return matchTicker(text) !== null;
      if (def.param === 'address') return EVM_RE.test(text);
      if (def.param === 'url') return matchUrl(text) !== null;
      if (def.param === 'secTicker') return matchSecTicker(text) !== null;
      if (def.param) return BASE58_RE.test(text);
      return true;
    },

    handler: async (
      runtime: IAgentRuntime,
      message: Memory,
      _state?: State,
      _options?: Record<string, unknown>,
      callback?: HandlerCallback,
    ): Promise<boolean> => {
      const svc = runtime.getService<AgentFeedService>(AgentFeedService.serviceType);
      if (!svc) {
        await callback?.({
          text: 'AgentFeed service is not available — check that AGENTFEED_PRIVATE_KEY is configured.',
        });
        return false;
      }

      let path = def.path;
      const text = message?.content?.text ?? '';
      if (def.input) {
        // Required input missing: refuse in words and pay nothing.
        const r = resolveInput(def.input, text);
        if ('refusal' in r) {
          await callback?.({ text: r.refusal });
          return false;
        }
        for (const [k, v] of Object.entries(r.values)) path = path.replace(`:${k}`, encodeURIComponent(v));
        for (const [k, v] of r.extra) path += `${path.includes('?') ? '&' : '?'}${k}=${encodeURIComponent(v)}`;
      } else if (def.param === 'url' || def.param === 'secTicker') {
        const v = def.param === 'url' ? matchUrl(text) : matchSecTicker(text);
        if (!v) {
          await callback?.({
            text:
              def.param === 'url'
                ? `I need ${def.path.includes('pdf') ? 'a PDF' : 'a web page'} URL starting with http:// or https:// in the message to run this lookup.`
                : 'I need a US stock ticker, written like $AAPL or "ticker AAPL", in the message to run this lookup.',
          });
          return false;
        }
        path = path.replace(`:${def.param}`, encodeURIComponent(v));
      } else if (def.param === 'ticker') {
        const t = matchTicker(text);
        if (!t) {
          await callback?.({ text: 'I need a US stock or index ticker like TSLA or NVDA in the message to run this lookup.' });
          return false;
        }
        path = path.replace(':ticker', t);
      } else if (def.param) {
        const re =
          def.param === 'symbol' ? SYMBOL_RE : def.param === 'address' ? EVM_RE : BASE58_RE;
        const m = text.match(re);
        if (!m) {
          await callback?.({
            text:
              def.param === 'symbol'
                ? 'I need a tokenized equity symbol like CRCLx or MSTRx in the message to run this lookup.'
                : def.param === 'address'
                  ? 'I need an Ethereum/Base address (0x followed by 40 hex characters) in the message to run this lookup.'
                  : `I need a Solana ${def.param} address in the message to run this lookup.`,
          });
          return false;
        }
        path = path.replace(`:${def.param}`, m[0]);
      }
      if (def.optional === 'coin' && def.coinParam && def.coins) {
        const c = matchCoin(text, def.coins);
        if (c) path += `${path.includes('?') ? '&' : '?'}${def.coinParam}=${c}`;
      }
      if (def.optional === 'chain') {
        const c = matchChain(text);
        if (c) path += `${path.includes('?') ? '&' : '?'}chain=${c}`;
      }
      const opt = (k: string, v: string | number | null) => {
        if (v !== null) path += `${path.includes('?') ? '&' : '?'}${k}=${encodeURIComponent(String(v)).replace('%3A', ':')}`;
      };
      if (def.optional === 'form') opt('form', matchForm(text));
      if (def.optional === 'days') opt('days', matchWindow(text, 'days'));
      if (def.optional === 'hours') opt('hours', matchWindow(text, 'hours'));
      if (def.optional === 'tradfi') opt('symbol', matchTradfiSymbol(text));
      if (def.optional === 'base') opt('base', matchFxBase(text));
      if (def.optional === 'swaps') opt('swaps', matchSwaps(text));
      if (def.optional === 'perp') {
        const m = text.match(PERP_RE);
        if (m) path += `${path.includes('?') ? '&' : '?'}symbol=${m[1]}USDT`;
      }

      if (path.length > MAX_PATH_CHARS) {
        await callback?.({
          text: `The request would be ${path.length} characters long once encoded, more than the ${MAX_PATH_CHARS} that fit in a URL. Shorten the text (a non-Latin character takes up to 9 characters when encoded).`,
        });
        return false;
      }

      const result = await svc.paidGet(path);

      // 451: the service does not offer this route where the caller is (the fixed-purpose language
      // tasks, by region). It answers before any payment is asked for, so nothing was paid; this is an
      // answer, not a failure, and the call is not retried.
      if (result.status === 451) {
        const where = (result.data as { country?: string } | null)?.country;
        await callback?.({
          text: `AgentFeed does not offer ${def.path.replace(/[?].*$/, '')} from this location${where ? ` (country ${where})` : ''}: the service answered HTTP 451 before asking for payment. Nothing was paid and the call will not be retried.`,
          data: { agentfeed: { path: def.path, unavailable: true, status: 451, paidUsd: 0 } },
        });
        return true;
      }

      if (!result.ok) {
        await callback?.({
          text: `AgentFeed call failed: ${result.error ?? `HTTP ${result.status}`}`,
        });
        return false;
      }

      const paidNote = result.paidUsd
        ? ` (paid $${result.paidUsd} via x402)`
        : '';
      await callback?.({
        text: `AgentFeed ${def.path} result${paidNote}:\n\`\`\`json\n${JSON.stringify(result.data, null, 2).slice(0, 3500)}\n\`\`\``,
        data: { agentfeed: { path: def.path, result: result.data, paidUsd: result.paidUsd ?? 0 } },
      });
      return true;
    },

    examples: buildExamples(def),
  };
}

export const agentfeedActions: Action[] = ENDPOINTS.map(makeAction);
