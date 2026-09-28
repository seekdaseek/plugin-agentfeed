# @seekdaseek/plugin-agentfeed

Live crypto market data for [elizaOS](https://github.com/elizaOS/eliza) trading agents, paid per-call in USDC over the [x402 protocol](https://x402.org) on Solana.

No API keys. No subscriptions. No signup. Your agent holds a wallet, and pays $0.001–$0.10 per call only when it actually needs data.

Backed by [AgentFeed](https://x402.ochinimus.app) — multi-exchange liquidation collection (Bybit, OKX and Binance WebSocket), Bybit v5 positioning, spot prices (multi-source: Coinbase, Kraken, Pyth Hermes fallback), and Helius DAS on-chain data.

## What your agent can ask for

| Action | Data | Price |
|---|---|---|
| `AGENTFEED_GET_CASCADE_SCAN` | Scan for liquidation cascades across the FULL universe of every USDT perp we record on Bybit, OKX and Binance simultaneously — not just the majors. | $0.05 |
| `AGENTFEED_GET_LIQUIDATION_LEADERS` | Rank the top symbols by liquidation USD right now across every USDT perp we record on Bybit, OKX and Binance. | $0.02 |
| `AGENTFEED_GET_CASCADE_ALERT` | Liquidation cascade detector for the 5 majors — SOL, BTC, ETH, XRP, DOGE — across Bybit, OKX and Binance. | $0.01 |
| `AGENTFEED_GET_TRADE_CONTEXT` | Fetch the full crypto market state in one paid call: SOL+BTC prices, funding rates, fear/greed index, long/short positioning, open interest, and recent liquidation summary. | $0.01 |
| `AGENTFEED_GET_LIQUIDATIONS` | Fetch recent perp liquidation prints across every USDT perp we record on Bybit (complete unthrottled tape), OKX and Binance: side, size, price, exchange, timestamp. | $0.003 |
| `AGENTFEED_GET_LIQUIDATION_STATS` | Fetch aggregated liquidation stats: 1h/24h totals, long vs short split, biggest single print. | $0.004 |
| `AGENTFEED_GET_POSITIONING` | Fetch SOL+BTC long/short account ratio and open interest with 1h/24h OI deltas. | $0.004 |
| `AGENTFEED_GET_FUNDING_RATE` | Fetch current SOL and BTC perp funding rates. | $0.002 |
| `AGENTFEED_GET_MARKET_SNAPSHOT` | Fetch a compact market snapshot: SOL+BTC prices plus key market gauges in one call. | $0.003 |
| `AGENTFEED_GET_SOL_PRICE` | Fetch live SOL spot price. | $0.001 |
| `AGENTFEED_GET_BTC_PRICE` | Fetch live BTC spot price. | $0.001 |
| `AGENTFEED_GET_TOKEN_RISK` | Rug-risk scan for an SPL token mint: mint/freeze authority status, top-holder concentration, risk flags. | $0.01 |
| `AGENTFEED_GET_TOKEN_METADATA` | Fetch SPL token metadata via Helius DAS: name, symbol, supply, decimals. | $0.005 |
| `AGENTFEED_GET_WALLET_HOLDINGS` | Fetch a Solana wallet's token holdings via Helius DAS. | $0.008 |
| `AGENTFEED_GET_SQUEEZE_SCORE` | FLAGSHIP: short-squeeze / long-flush score 0-100 for any USDT perp. | $0.10 |
| `AGENTFEED_GET_LIQ_HISTORY` | HISTORICAL liquidation tape, time-bucketed: total/long/short USD, prints, biggest print per bucket. | $0.05 |
| `AGENTFEED_GET_LIQ_HEATMAP` | Liquidation heatmap by PRICE LEVEL from our own tape: where leverage actually got flushed in the last N hours — USD, prints, long/short split per price zone, hottest zone flagged. | $0.05 |
| `AGENTFEED_GET_CASCADE_HISTORY` | PAST liquidation cascades reconstructed from our tape: clustered same-side flush events with start/end, prints, USD total, peak print. | $0.03 |
| `AGENTFEED_GET_VENUE_LIQ_SHARE` | Which venue is flushing whom: per-exchange liquidation share (Bybit/OKX/Binance) with long/short split and biggest print, any symbol or whole universe. | $0.02 |
| `AGENTFEED_GET_FUNDING_CROSS` | Funding for ANY USDT perp across Bybit + OKX + Hyperliquid in one call, with cross-venue spread and crowding read. | $0.01 |
| `AGENTFEED_GET_FUNDING_EXTREMES` | Most crowded trades across every Bybit USDT perp: top most-positive and most-negative funding with annualized %, 24h price move and OI. | $0.02 |
| `AGENTFEED_GET_OPEN_INTEREST` | Open interest for ANY USDT perp: Bybit OI in base + USD with 1h/24h change, plus OKX OI. | $0.01 |
| `AGENTFEED_GET_OI_SPIKE_SCAN` | Abnormal open-interest jumps across every Bybit USDT perp vs a 30min+ baseline — where new leverage is piling in, with funding and price context. | $0.02 |
| `AGENTFEED_GET_LONG_SHORT` | Long/short account ratio for ANY USDT perp with 1h and 24h trend (retail crowding gauge). | $0.01 |
| `AGENTFEED_GET_BASIS` | Perp-vs-spot basis for any USDT pair: premium/discount %, contango/backwardation read, funding context. | $0.01 |
| `AGENTFEED_GET_VOLATILITY` | Realized volatility for any USDT perp: 7d and 30d annualized from daily closes, plus today's range. | $0.01 |
| `AGENTFEED_GET_FUNDING_HISTORY` | Funding-rate history for any USDT perp (up to 200 intervals): average, annualized, share of positive intervals — what the carry has actually been. | $0.005 |
| `AGENTFEED_GET_TOP_MOVERS` | 24h top gainers and losers across every Bybit USDT perp with a liquidity floor, funding attached. | $0.01 |
| `AGENTFEED_GET_ORDERBOOK_IMBALANCE` | Bid/ask resting-liquidity imbalance within ±N bps of mid for any USDT perp: USD each side, ratio, skew read. | $0.01 |
| `AGENTFEED_GET_ORDERBOOK_WALLS` | Largest resting orders each side of the book for any USDT perp, with USD size and distance from mid. | $0.01 |
| `AGENTFEED_GET_WHALE_TRADES` | Large prints from the live trade tape for any USDT perp: trades over a USD threshold, buy/sell totals, net flow, dominant side. | $0.02 |
| `AGENTFEED_GET_SPREAD_ARB` | Best bid/ask for a USDT perp across Bybit, OKX and Hyperliquid, with the best cross-venue edge in bps (pre-fee). | $0.02 |
| `AGENTFEED_GET_TOKEN_HOLDERS` | Top holders of any SPL token with per-account share and top1/top5/top10 concentration. | $0.02 |
| `AGENTFEED_GET_WALLET_ACTIVITY` | Recent transactions of any Solana wallet, parsed human-readable: type, protocol, description, fee, failures (Helius enhanced). | $0.02 |
| `AGENTFEED_GET_PRIORITY_FEES` | Solana priority-fee estimate right now, all levels (min to unsafeMax) in micro-lamports/CU, with a recommended tip. | $0.005 |
| `AGENTFEED_GET_JITO_TIPS` | Jito bundle tip floor percentiles (p25-p99, SOL) — what landed bundles are actually paying, with a landing recommendation. | $0.005 |
| `AGENTFEED_GET_SOL_NETWORK` | Solana network health: recent average TPS, current slot, epoch and epoch progress. | $0.005 |
| `AGENTFEED_GET_TVL` | TVL for any DeFi protocol (with 1d/7d change) or top-15 chains ranking. | $0.005 |
| `AGENTFEED_GET_STABLECOIN_FLOWS` | Total stablecoin supply with 7d/30d deltas and top stables — the macro risk-on/risk-off dial for crypto. | $0.01 |
| `AGENTFEED_GET_DEX_QUOTE` | Live Jupiter swap quote for any SPL pair: output amount, price impact, route. | $0.005 |
| `AGENTFEED_GET_PEG_UNIVERSE` | Rank every tokenized US equity we track by off-hours peg risk: p95 and max deviation in bps, market-open deviation as a control, and median pool liquidity. | $0.05 |
| `AGENTFEED_GET_PEG_DEVIATION` | Current peg deviation for one tokenized US equity on Solana: on-chain DEX price vs the underlying last real trade in bps, direction, pool liquidity, plus window stats split into market-open and off-hours. | $0.02 |
| `AGENTFEED_GET_PEG_SESSIONS` | Peg deviation for one tokenized equity broken out by trading session — open, premarket, afterhours, overnight, weekend — with mean, p95, max bps and median liquidity per session, and the worst off-hours window flagged. | $0.03 |
| `AGENTFEED_GET_EXIT_QUOTE` | What a lending reserve would actually realise if it had to be seized and sold: the protocol oracle mark, the realisable value measured by live routing at real clip sizes, the haircut in bps, and whether the liquidation bonus covers the cost of selling. | $0.02 |
| `AGENTFEED_GET_EXIT_METHOD` | FREE: exactly how the collateral exit measurements are produced, so the numbers can be checked rather than trusted. | free |
| `AGENTFEED_GET_ETH_PRICE` | ETH spot price in USD, aggregated across seven independent venues (CoinGecko, Coinbase, Kraken, Binance, OKX, Gemini, DefiLlama). | $0.001 |
| `AGENTFEED_GET_BASE_GAS` | Current gas price on Base, chain 8453, in BOTH gwei and wei, with base fee, priority fee and block number when the node supplies them. | $0.001 |
| `AGENTFEED_GET_BASE_BALANCE` | Native ETH or any ERC20 balance for an address on Base or Ethereum mainnet. | $0.002 |
| `AGENTFEED_GET_CASCADE_FORECAST` | FORWARD-LOOKING liquidation forecast, not a description of what already happened: the probability that a symbol liquidates more in the NEXT 15 minutes than its own 90th-percentile window. | $0.02 |
| `AGENTFEED_GET_PERP` | Use when an agent needs one perp market in a single call. | $0.001 |
| `AGENTFEED_GET_LIQ_PULSE` | Use when an agent needs to know what is being liquidated right now. | $0.001 |
| `AGENTFEED_GET_FUNDING_PULSE` | Use when an agent needs the most extreme funding rates right now. | $0.001 |
| `AGENTFEED_GET_SPOT` | Use when an agent needs a spot price without choosing a venue. | $0.001 |

## Quickstart

```bash
npm install @seekdaseek/plugin-agentfeed
```

Character config:

```json
{
  "name": "TraderAgent",
  "plugins": ["@seekdaseek/plugin-agentfeed"],
  "settings": {
    "secrets": {
      "AGENTFEED_PRIVATE_KEY": "<base58 private key OR solana-keygen JSON array>"
    }
  }
}
```

Fund the wallet with USDC on Solana mainnet. **$1 of USDC ≈ 100–1000 calls.** A tiny amount of SOL is not required — x402 exact-SVM settlement is handled by the facilitator.

Then just talk to your agent:

> "How much got liquidated in the last 24 hours?"
> "What's the long/short ratio on SOL?"
> "Is this token a rug: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
> "Give me the full trade context before we size this position."

## Built-in spend guard

Agents with funded wallets and buggy loops are a drained-wallet incident waiting to happen. This plugin refuses to pay blind:

- Before paying any endpoint, the plugin reads the live 402 quote and **refuses any price above `AGENTFEED_MAX_SPEND_PER_CALL`** (default `$0.50`, above the most expensive action, `get_squeeze_score` at $0.10).
- Approved quotes are cached for 10 minutes, so steady-state calls cost a single request.
- No `Provider` is registered — the plugin never silently injects paid data into every prompt. Data is fetched only when an action explicitly fires.

## Settings

| Setting | Required | Default | Description |
|---|---|---|---|
| `AGENTFEED_PRIVATE_KEY` | yes | — | Payer wallet key (base58 string or JSON byte array). Must hold USDC on Solana mainnet. |
| `AGENTFEED_BASE_URL` | no | `https://x402.ochinimus.app` | API base URL. |
| `AGENTFEED_MAX_SPEND_PER_CALL` | no | `0.5` | USD cap per call; higher quotes are refused. |

## Security notes

- Use a **dedicated hot wallet** for the agent with only the USDC you're willing to spend. Never your main wallet.
- The private key never leaves the process; payments are signed locally and settled through the x402 facilitator.

## Also available over MCP

The same data is exposed as MCP tools (x402-gated) — see the [AgentFeed manifest](https://x402.ochinimus.app/.well-known/x402.json).

## License

MIT — [seekdaseek](https://github.com/seekdaseek)
