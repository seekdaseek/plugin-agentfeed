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
  // ---- expansion v0.1.3 (18->44): 26 tools. Query tools default server-side (SOLUSDT etc).
  {
    path: '/api/squeeze-score',
    usd: 0.1,
    action: 'AGENTFEED_GET_SQUEEZE_SCORE',
    similes: ['SQUEEZE_SCORE', 'GET_SQUEEZE_SCORE'],
    description:
      'FLAGSHIP: short-squeeze / long-flush score 0-100 for any USDT perp. Composite of funding, long/short crowding, 24h OI build, and liq-skew from our exclusive tape. One number that answers "is this trade crowded and about to hurt someone".',
    triggers: ['is SOL a crowded long right now', 'squeeze score for SOL', 'are shorts about to get squeezed on BTC'],
  },
  {
    path: '/api/liq-history',
    usd: 0.05,
    action: 'AGENTFEED_GET_LIQ_HISTORY',
    similes: ['LIQ_HISTORY', 'GET_LIQ_HISTORY'],
    description:
      'HISTORICAL liquidation tape, time-bucketed: total/long/short USD, prints, biggest print per bucket. Any USDT perp or the whole ~600-perp universe, up to 7 days back. Bybit is the only complete liq tape in crypto and no exchange publishes history of it — this data exists nowhere else.',
    triggers: ['liquidation history for SOL over the last day', 'how much got liquidated per hour today'],
  },
  {
    path: '/api/liq-heatmap',
    usd: 0.05,
    action: 'AGENTFEED_GET_LIQ_HEATMAP',
    similes: ['LIQ_HEATMAP', 'GET_LIQ_HEATMAP'],
    description:
      'Liquidation heatmap by PRICE LEVEL from our own tape: where leverage actually got flushed in the last N hours — USD, prints, long/short split per price zone, hottest zone flagged. Real prints, not entry-price estimates.',
    triggers: ['where did SOL leverage get flushed', 'liquidation heatmap for BTC by price'],
  },
  {
    path: '/api/cascade-history',
    usd: 0.03,
    action: 'AGENTFEED_GET_CASCADE_HISTORY',
    similes: ['CASCADE_HISTORY', 'GET_CASCADE_HISTORY'],
    description:
      'PAST liquidation cascades reconstructed from our tape: clustered same-side flush events with start/end, prints, USD total, peak print. get_cascade_alert tells you NOW; this tells you what already happened, up to 72h back.',
    triggers: ['were there any liquidation cascades today', 'past SOL cascade events'],
  },
  {
    path: '/api/venue-liq-share',
    usd: 0.02,
    action: 'AGENTFEED_GET_VENUE_LIQ_SHARE',
    similes: ['VENUE_LIQ_SHARE', 'GET_VENUE_LIQ_SHARE'],
    description:
      'Which venue is flushing whom: per-exchange liquidation share (Bybit/OKX/Binance) with long/short split and biggest print, any symbol or whole universe.',
    triggers: ['which exchange is liquidating the most', 'venue breakdown of liquidations'],
  },
  {
    path: '/api/funding-cross',
    usd: 0.01,
    action: 'AGENTFEED_GET_FUNDING_CROSS',
    similes: ['FUNDING_CROSS', 'GET_FUNDING_CROSS'],
    description:
      'Funding for ANY USDT perp across Bybit + OKX + Hyperliquid in one call, with cross-venue spread and crowding read. (get_funding_rate covers SOL+BTC only.)',
    triggers: ['funding for SOL across exchanges', 'cross-venue funding on WIF'],
  },
  {
    path: '/api/funding-extremes',
    usd: 0.02,
    action: 'AGENTFEED_GET_FUNDING_EXTREMES',
    similes: ['FUNDING_EXTREMES', 'GET_FUNDING_EXTREMES'],
    description:
      'Most crowded trades across ~600 USDT perps: top most-positive and most-negative funding with annualized %, 24h price move and OI. Crowded shorts = squeeze candidates.',
    triggers: ['most crowded funding trades right now', 'which perps have extreme funding'],
  },
  {
    path: '/api/open-interest',
    usd: 0.01,
    action: 'AGENTFEED_GET_OPEN_INTEREST',
    similes: ['OPEN_INTEREST', 'GET_OPEN_INTEREST'],
    description:
      'Open interest for ANY USDT perp: Bybit OI in base + USD with 1h/24h change, plus OKX OI. (get_positioning covers SOL+BTC only.)',
    triggers: ['open interest on SOL', 'OI change for BTC'],
  },
  {
    path: '/api/oi-spike-scan',
    usd: 0.02,
    action: 'AGENTFEED_GET_OI_SPIKE_SCAN',
    similes: ['OI_SPIKE_SCAN', 'GET_OI_SPIKE_SCAN'],
    description:
      'Abnormal open-interest jumps across ~600 USDT perps vs a 30min+ baseline — where new leverage is piling in, with funding and price context. Squeeze/flush precursor screener.',
    triggers: ['where is open interest spiking', 'any OI spikes across perps'],
  },
  {
    path: '/api/long-short',
    usd: 0.01,
    action: 'AGENTFEED_GET_LONG_SHORT',
    similes: ['LONG_SHORT', 'GET_LONG_SHORT'],
    description:
      'Long/short account ratio for ANY USDT perp with 1h and 24h trend (retail crowding gauge).',
    triggers: ['long short ratio for SOL', 'are traders long or short WIF'],
  },
  {
    path: '/api/basis',
    usd: 0.01,
    action: 'AGENTFEED_GET_BASIS',
    similes: ['BASIS', 'GET_BASIS'],
    description:
      'Perp-vs-spot basis for any USDT pair: premium/discount %, contango/backwardation read, funding context.',
    triggers: ['perp basis for SOL', 'is BTC in contango'],
  },
  {
    path: '/api/volatility',
    usd: 0.01,
    action: 'AGENTFEED_GET_VOLATILITY',
    similes: ['VOLATILITY', 'GET_VOLATILITY'],
    description:
      'Realized volatility for any USDT perp: 7d and 30d annualized from daily closes, plus today\'s range. Position-sizing input.',
    triggers: ['realized vol for SOL', 'how volatile is BTC'],
  },
  {
    path: '/api/funding-history',
    usd: 0.005,
    action: 'AGENTFEED_GET_FUNDING_HISTORY',
    similes: ['FUNDING_HISTORY', 'GET_FUNDING_HISTORY'],
    description:
      'Funding-rate history for any USDT perp (up to 200 intervals): average, annualized, share of positive intervals — what the carry has actually been.',
    triggers: ['funding history for SOL', 'average carry on BTC perp'],
  },
  {
    path: '/api/top-movers',
    usd: 0.01,
    action: 'AGENTFEED_GET_TOP_MOVERS',
    similes: ['TOP_MOVERS', 'GET_TOP_MOVERS'],
    description:
      '24h top gainers and losers across ~600 USDT perps with a liquidity floor, funding attached. The "what moved" screener.',
    triggers: ['top gainers and losers today', 'what perps are moving most'],
  },
  {
    path: '/api/orderbook-imbalance',
    usd: 0.01,
    action: 'AGENTFEED_GET_ORDERBOOK_IMBALANCE',
    similes: ['ORDERBOOK_IMBALANCE', 'GET_ORDERBOOK_IMBALANCE'],
    description:
      'Bid/ask resting-liquidity imbalance within ±N bps of mid for any USDT perp: USD each side, ratio, skew read.',
    triggers: ['order book imbalance for SOL', 'is the SOL book bid or ask heavy'],
  },
  {
    path: '/api/orderbook-walls',
    usd: 0.01,
    action: 'AGENTFEED_GET_ORDERBOOK_WALLS',
    similes: ['ORDERBOOK_WALLS', 'GET_ORDERBOOK_WALLS'],
    description:
      'Largest resting orders each side of the book for any USDT perp, with USD size and distance from mid.',
    triggers: ['order book walls on SOL', 'biggest resting orders for BTC'],
  },
  {
    path: '/api/whale-trades',
    usd: 0.02,
    action: 'AGENTFEED_GET_WHALE_TRADES',
    similes: ['WHALE_TRADES', 'GET_WHALE_TRADES'],
    description:
      'Large prints from the live trade tape for any USDT perp: trades over a USD threshold, buy/sell totals, net flow, dominant side.',
    triggers: ['any whale trades on SOL', 'large prints for BTC'],
  },
  {
    path: '/api/spread-arb',
    usd: 0.02,
    action: 'AGENTFEED_GET_SPREAD_ARB',
    similes: ['SPREAD_ARB', 'GET_SPREAD_ARB'],
    description:
      'Best bid/ask for a USDT perp across Bybit, OKX and Hyperliquid, with the best cross-venue edge in bps (pre-fee).',
    triggers: ['spread across venues for SOL', 'cross-exchange arb on WIF'],
  },
  {
    path: '/api/token-holders/:mint',
    usd: 0.02,
    action: 'AGENTFEED_GET_TOKEN_HOLDERS',
    similes: ['TOKEN_HOLDERS', 'GET_TOKEN_HOLDERS'],
    description:
      'Top holders of any SPL token with per-account share and top1/top5/top10 concentration. Deeper cut than get_token_risk\'s summary.',
    triggers: ['top holders of <mint>', 'holder concentration for <mint>'],
    param: 'mint',
  },
  {
    path: '/api/wallet-activity/:wallet',
    usd: 0.02,
    action: 'AGENTFEED_GET_WALLET_ACTIVITY',
    similes: ['WALLET_ACTIVITY', 'GET_WALLET_ACTIVITY'],
    description:
      'Recent transactions of any Solana wallet, parsed human-readable: type, protocol, description, fee, failures (Helius enhanced).',
    triggers: ['recent activity for <address>', 'what has <address> been doing'],
    param: 'wallet',
  },
  {
    path: '/api/priority-fees',
    usd: 0.005,
    action: 'AGENTFEED_GET_PRIORITY_FEES',
    similes: ['PRIORITY_FEES', 'GET_PRIORITY_FEES'],
    description:
      'Solana priority-fee estimate right now, all levels (min to unsafeMax) in micro-lamports/CU, with a recommended tip. For bots that need txs to land.',
    triggers: ['solana priority fee right now', 'what should I tip to land a tx'],
  },
  {
    path: '/api/jito-tips',
    usd: 0.005,
    action: 'AGENTFEED_GET_JITO_TIPS',
    similes: ['JITO_TIPS', 'GET_JITO_TIPS'],
    description:
      'Jito bundle tip floor percentiles (p25-p99, SOL) — what landed bundles are actually paying, with a landing recommendation.',
    triggers: ['jito tip floor', 'what are bundles paying'],
  },
  {
    path: '/api/sol-network',
    usd: 0.005,
    action: 'AGENTFEED_GET_SOL_NETWORK',
    similes: ['SOL_NETWORK', 'GET_SOL_NETWORK'],
    description:
      'Solana network health: recent average TPS, current slot, epoch and epoch progress.',
    triggers: ['solana network health', 'current TPS on solana'],
  },
  {
    path: '/api/tvl',
    usd: 0.005,
    action: 'AGENTFEED_GET_TVL',
    similes: ['TVL', 'GET_TVL'],
    description:
      'TVL for any DeFi protocol (with 1d/7d change) or top-15 chains ranking. DefiLlama-backed.',
    triggers: ['TVL of jito', 'top chains by TVL'],
  },
  {
    path: '/api/stablecoin-flows',
    usd: 0.01,
    action: 'AGENTFEED_GET_STABLECOIN_FLOWS',
    similes: ['STABLECOIN_FLOWS', 'GET_STABLECOIN_FLOWS'],
    description:
      'Total stablecoin supply with 7d/30d deltas and top stables — the macro risk-on/risk-off dial for crypto.',
    triggers: ['stablecoin supply trend', 'is stablecoin supply growing'],
  },
  {
    path: '/api/dex-quote',
    usd: 0.005,
    action: 'AGENTFEED_GET_DEX_QUOTE',
    similes: ['DEX_QUOTE', 'GET_DEX_QUOTE'],
    description:
      'Live Jupiter swap quote for any SPL pair: output amount, price impact, route. The real executable price on Solana, not an index price.',
    triggers: ['jupiter quote for <mint>', 'swap price on solana'],
  },
];

/** Base58 Solana address matcher (32–44 chars, no 0OIl). */
export const BASE58_RE = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/;
