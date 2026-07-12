// endpoints.ts — mirrors the server's PRICES table (single source of truth on the server;
// this copy is used ONLY for the local spend guard and action metadata).
// The authoritative price is always the live 402 quote — if the server raises a price
// above AGENTFEED_MAX_SPEND_PER_CALL, the call is refused client-side.

export interface EndpointDef {
  /** Path template. `:mint` / `:wallet` are filled from the message. */
  path: string;
  /** Expected price in USD (informational; guard uses live quote). */
  usd: number;
  /** elizaOS action name (SCREAMING_SNAKE). */
  action: string;
  /** Alternative trigger phrases. */
  similes: string[];
  /** Action description shown to the LLM. */
  description: string;
  /** Natural-language examples that should trigger this action. */
  triggers: string[];
  /** Which param the path needs, if any. */
  param?: 'mint' | 'wallet';
}

export const ENDPOINTS: EndpointDef[] = [
  {
    path: '/api/cascade-scan',
    usd: 0.05,
    action: 'AGENTFEED_GET_CASCADE_SCAN',
    similes: ['CASCADE_SCAN', 'FULL_CASCADE_SCAN', 'SCAN_ALL_LIQUIDATIONS', 'WHAT_IS_CASCADING'],
    description:
      'Scan for liquidation cascades across the FULL universe of ~600 USDT perps on Bybit, OKX and Binance simultaneously ($0.05) — not just the majors. Returns each active cascade: symbol, side liquidated, USD total, print count, duration, severity (minor/major/extreme). Bybit is the only complete unthrottled liquidation tape in crypto and no exchange publishes history of it, so this coverage is not available anywhere else. Use when the agent needs to know what is blowing up across the whole market, including alts it is not already watching.',
    triggers: [
      'is anything cascading right now',
      'scan the whole market for liquidation cascades',
      'what alts are getting liquidated hard',
      'any cascades outside the majors',
    ],
  },
  {
    path: '/api/liquidation-leaders',
    usd: 0.02,
    action: 'AGENTFEED_GET_LIQUIDATION_LEADERS',
    similes: ['LIQUIDATION_LEADERS', 'WHATS_GETTING_REKT', 'TOP_LIQUIDATIONS'],
    description:
      'Rank the top symbols by liquidation USD right now across ~600 USDT perps on Bybit, OKX and Binance ($0.02). Per symbol: total liquidated, long vs short split, biggest single print, venue count, dominant side. The fastest read on where leverage is being flushed.',
    triggers: [
      'what is getting rekt right now',
      'which coins have the most liquidations today',
      'where is leverage being flushed',
    ],
  },
  {
    path: '/api/cascade',
    usd: 0.01,
    action: 'AGENTFEED_GET_CASCADE_ALERT',
    similes: ['CASCADE_ALERT', 'IS_THERE_A_CASCADE'],
    description:
      'Liquidation cascade detector for the 5 majors — SOL, BTC, ETH, XRP, DOGE — across Bybit, OKX and Binance ($0.01). Returns cascades active NOW: clustered same-side liquidations with symbol, side, USD total, prints, duration, severity. Empty array = no cascade in the window. For all ~600 perps use AGENTFEED_GET_CASCADE_SCAN instead.',
    triggers: [
      'is SOL cascading',
      'is there a liquidation cascade on BTC right now',
      'check for a cascade before I enter',
    ],
  },
  {
    path: '/api/trade-context',
    usd: 0.01,
    action: 'AGENTFEED_GET_TRADE_CONTEXT',
    similes: ['GET_TRADE_CONTEXT', 'MARKET_CONTEXT', 'FULL_MARKET_STATE'],
    description:
      'Fetch the full crypto market state in one paid call ($0.01): SOL+BTC prices, funding rates, fear/greed index, long/short positioning, open interest, and recent liquidation summary. Use when the agent needs a complete trading picture before making or explaining a decision.',
    triggers: [
      "what's the current trade context",
      'give me the full market state',
      'should I be long or short SOL right now, check the data',
      'pull the trading context before we decide',
    ],
  },
  {
    path: '/api/liquidations',
    usd: 0.003,
    action: 'AGENTFEED_GET_LIQUIDATIONS',
    similes: ['GET_RECENT_LIQUIDATIONS', 'RECENT_LIQUIDATIONS', 'LIQUIDATION_FEED'],
    description:
      'Fetch recent perp liquidation prints ($0.003) across ~600 USDT perps on Bybit (complete unthrottled tape), OKX and Binance: side, size, price, exchange, timestamp. Filterable by symbol — any USDT perp, not just majors. Use for questions about recent liquidations or big prints.',
    triggers: [
      'any big liquidations in the last hour',
      'show me recent SOL liquidations',
      'was there a liquidation cascade',
    ],
  },
  {
    path: '/api/liquidation-stats',
    usd: 0.004,
    action: 'AGENTFEED_GET_LIQUIDATION_STATS',
    similes: ['GET_LIQUIDATION_STATS', 'LIQUIDATION_TOTALS'],
    description:
      'Fetch aggregated liquidation stats ($0.004): 1h/24h totals, long vs short split, biggest single print. Use for "how much got liquidated" style questions.',
    triggers: [
      'how much got liquidated today',
      'longs or shorts getting rekt more',
      'liquidation totals last 24h',
    ],
  },
  {
    path: '/api/positioning',
    usd: 0.004,
    action: 'AGENTFEED_GET_POSITIONING',
    similes: ['GET_POSITIONING', 'LONG_SHORT_RATIO', 'OPEN_INTEREST'],
    description:
      'Fetch SOL+BTC long/short account ratio and open interest with 1h/24h OI deltas ($0.004). Use for positioning, crowding, or OI questions.',
    triggers: [
      "what's the long/short ratio on SOL",
      'is open interest rising or falling',
      'how crowded is the long side',
    ],
  },
  {
    path: '/api/funding-rate',
    usd: 0.002,
    action: 'AGENTFEED_GET_FUNDING_RATE',
    similes: ['GET_FUNDING_RATE', 'FUNDING_RATES', 'PERP_FUNDING'],
    description:
      'Fetch current SOL and BTC perp funding rates ($0.002). Use for funding questions or carry-cost checks.',
    triggers: [
      "what's SOL funding right now",
      'are funding rates positive or negative',
    ],
  },
  {
    path: '/api/market-snapshot',
    usd: 0.003,
    action: 'AGENTFEED_GET_MARKET_SNAPSHOT',
    similes: ['GET_MARKET_SNAPSHOT', 'MARKET_SNAPSHOT'],
    description:
      'Fetch a compact market snapshot ($0.003): SOL+BTC prices plus key market gauges in one call. Cheaper than trade-context; use for quick price/market checks that need more than a single price.',
    triggers: [
      'quick market snapshot',
      "how's the market looking",
    ],
  },
  {
    path: '/api/sol-price',
    usd: 0.001,
    action: 'AGENTFEED_GET_SOL_PRICE',
    similes: ['GET_SOL_PRICE', 'SOL_PRICE'],
    description:
      'Fetch live SOL spot price via Pyth ($0.001). Use for a plain SOL price check.',
    triggers: ["what's SOL trading at", 'SOL price'],
  },
  {
    path: '/api/btc-price',
    usd: 0.001,
    action: 'AGENTFEED_GET_BTC_PRICE',
    similes: ['GET_BTC_PRICE', 'BTC_PRICE'],
    description:
      'Fetch live BTC spot price via Pyth ($0.001). Use for a plain BTC price check.',
    triggers: ["what's bitcoin at", 'BTC price'],
  },
  {
    path: '/api/token-risk/:mint',
    usd: 0.01,
    action: 'AGENTFEED_GET_TOKEN_RISK',
    similes: ['GET_TOKEN_RISK', 'RUG_CHECK', 'TOKEN_SAFETY'],
    description:
      'Rug-risk scan for an SPL token mint ($0.01): mint/freeze authority status, top-holder concentration, risk flags. The message must contain a Solana mint address. Use before an agent buys or recommends any token.',
    triggers: [
      'is this token a rug: <mint>',
      'run a risk check on <mint>',
      'check mint and freeze authority for <mint>',
    ],
    param: 'mint',
  },
  {
    path: '/api/token-metadata/:mint',
    usd: 0.005,
    action: 'AGENTFEED_GET_TOKEN_METADATA',
    similes: ['GET_TOKEN_METADATA', 'TOKEN_INFO'],
    description:
      'Fetch SPL token metadata via Helius DAS ($0.005): name, symbol, supply, decimals. The message must contain a Solana mint address.',
    triggers: ["what token is <mint>", 'token info for <mint>'],
    param: 'mint',
  },
  {
    path: '/api/wallet-holdings/:wallet',
    usd: 0.008,
    action: 'AGENTFEED_GET_WALLET_HOLDINGS',
    similes: ['GET_WALLET_HOLDINGS', 'WALLET_PORTFOLIO'],
    description:
      'Fetch a Solana wallet\'s token holdings via Helius DAS ($0.008). The message must contain a Solana wallet address.',
    triggers: ['what does this wallet hold: <address>', 'portfolio of <address>'],
    param: 'wallet',
  },
];

/** Base58 Solana address matcher (32–44 chars, no 0OIl). */
export const BASE58_RE = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/;
