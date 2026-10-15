# @seekdaseek/plugin-agentfeed

Crypto market data for AI agents (liquidations, funding, open interest, prices), Solana pre-trade checks, OFAC sanctions screening, scholarly papers, utilities and fixed-purpose language tasks (OCR, translate, summarize, extract, classify, prompt-injection check, transcribe). An [elizaOS](https://github.com/elizaOS/eliza) plugin: every route is an action, paid per call in USDC over the [x402 protocol](https://x402.org) on Solana.

No API keys. No subscriptions. No signup. Your agent holds a wallet, and pays $0.001–$0.10 per call only when it actually needs data.

Backed by [AgentFeed](https://x402.ochinimus.app): 83 paid data routes and 1 free one, 84 actions in all.

- **Market data:** the liquidation tape (Bybit, OKX and Binance streams), a Hyperliquid funding radar over every perp, open interest, positioning, a signal board and a per-coin signal, spot prices read on-chain, tradfi perps, FX rates, a macro calendar, tokenized-stock peg data and collateral exit quotes.
- **Solana pre-trade checks:** token check, token flow and holder clusters, plus token risk; and honeypot checks for tokens on Base, BNB Chain and Ethereum.
- **Research and compliance:** OFAC sanctions screening, scholarly papers, Wikipedia, email and domain checks, SEC filings and insider trades, and web pages and PDFs as markdown.
- **Utilities:** hash, QR, time and unit conversion.
- **Fixed-purpose language tasks:** OCR, summarize, extract, translate, classify, prompt-injection check and transcribe.

The service itself takes x402 `exact` on nine networks in every 402 (Solana, Base, Polygon, Arbitrum, Arc, Algorand, Optimism, Monad, Avalanche) and, on request, on eleven more (`GET /api/<route>|<network>`: Celo, HyperEVM, Unichain, Scroll, SKALE Base, BNB Chain, Ethereum, Robinhood Chain, World Chain, Sei, X Layer), plus half-price batch and Gateway options for high-frequency callers, MPP, and prepaid API keys for bots that cannot pay x402. This plugin pays per call with `exact` on Solana only: the other networks, the half-price options, MPP and prepaid keys are not used, and the prepaid key purchase routes are not actions.

## What your agent can ask for

| Action | Data | Price |
|---|---|---|
| `AGENTFEED_GET_CASCADE_SCAN` | Liquidation cascade scan across EVERY USDT perp we record on Bybit, OKX and Binance at once, not just the majors: symbol, side liquidated, USD total, prints, duration, severity. | $0.05 |
| `AGENTFEED_GET_LIQUIDATION_LEADERS` | Liquidation leaderboard: top symbols by liquidation USD right now across every USDT perp we record on Bybit, OKX and Binance, with long/short split, biggest single print and venue count. | $0.02 |
| `AGENTFEED_GET_CASCADE_ALERT` | Liquidation cascade detector, live: clustered same-side liquidations happening NOW on SOL, BTC, ETH, XRP and DOGE across Bybit, OKX and Binance, with side, USD total, prints, duration and severity. | $0.01 |
| `AGENTFEED_GET_TRADE_CONTEXT` | Crypto trading context in one call: SOL and BTC prices read on-chain from DEX pools, perp funding rates, Fear & Greed, positioning (open interest and the top Hyperliquid accounts' net-long share) and 1h/24h liquidation stats. | $0.01 |
| `AGENTFEED_GET_LIQUIDATIONS` | Crypto liquidations, live tape: recent perp liquidation prints across Bybit, OKX and Binance with timestamp, side liquidated, size, price and USD value. | $0.005 |
| `AGENTFEED_GET_LIQUIDATION_STATS` | Liquidation stats, 1h and 24h totals for SOL, BTC, ETH, XRP and DOGE: long vs short USD split, biggest single print, and a per-exchange breakdown across Bybit, OKX and Binance. | $0.01 |
| `AGENTFEED_GET_POSITIONING` | Positioning for SOL and BTC perps on Hyperliquid: open interest with its 1h and 24h change, and the net-long share of the top 250 Hyperliquid accounts. | $0.005 |
| `AGENTFEED_GET_FUNDING_RATE` | Funding rate for any Hyperliquid perp: the raw rate, its interval in hours, the 8h equivalent, the annualised rate, next funding time and mark price. | $0.005 |
| `AGENTFEED_GET_MARKET_SNAPSHOT` | Crypto market snapshot in one call: SOL and BTC spot prices read on-chain from DEX pools, both Hyperliquid perp funding rates with mark price and open interest, and the Fear & Greed index with its classification. | $0.005 |
| `AGENTFEED_GET_SOL_PRICE` | SOL price / Solana spot price in USD, live, read on-chain: the median of the two deepest SOL/USDC pools on Solana (Orca Whirlpool, Raydium CLMM), computed from chain state. | $0.001 |
| `AGENTFEED_GET_BTC_PRICE` | BTC price / Bitcoin spot price in USD, live, read on-chain: the median of three Uniswap V3 reads on Base and Ethereum (cbBTC/USDC, and cbBTC and WBTC through WETH/USDC), computed from chain state. | $0.001 |
| `AGENTFEED_GET_TOKEN_RISK` | Solana token rug check / risk signals for any SPL mint: mint and freeze authority status (revoked is safer), top-1 and top-10 holder concentration, supply, and a list of risk flags. | $0.01 |
| `AGENTFEED_GET_TOKEN_METADATA` | SPL token metadata for any Solana mint: name, symbol, URI, decimals, total supply, mint and freeze authority, token program, and whether the metadata is still mutable. | $0.005 |
| `AGENTFEED_GET_WALLET_HOLDINGS` | Solana wallet holdings for any address: native SOL with its USD value at AgentFeed's own on-chain SOL price, every SPL token with mint, symbol and amount (no token prices), and an NFT count. | $0.008 |
| `AGENTFEED_GET_SQUEEZE_SCORE` | Short squeeze score and long flush score, 0-100, for any Hyperliquid perp. | $0.10 |
| `AGENTFEED_GET_LIQ_HISTORY` | Liquidation history, time-bucketed: total, long and short USD, prints and biggest print per bucket, for any USDT perp or the whole recorded universe, up to 7 days back. | $0.05 |
| `AGENTFEED_GET_LIQ_HEATMAP` | Liquidation heatmap by PRICE LEVEL: where leverage actually got flushed in the last N hours — USD, prints and long/short split per price zone, with the hottest zone flagged. | $0.02 |
| `AGENTFEED_GET_CASCADE_HISTORY` | Liquidation cascade history: past clustered same-side flush events reconstructed from our own tape, with start and end, prints, USD total and peak print, up to 72h back. | $0.03 |
| `AGENTFEED_GET_VENUE_LIQ_SHARE` | Liquidations by exchange: per-venue liquidation share across Bybit, OKX and Binance with long/short split and biggest print, for any symbol or the whole recorded universe. | $0.02 |
| `AGENTFEED_GET_FUNDING_EXTREMES` | Funding rate extremes across every Hyperliquid perp above a liquidity floor: the most positive and most negative funding with annualized %, 24h price move and open interest. | $0.02 |
| `AGENTFEED_GET_FUNDING_RADAR` | Funding radar over every Hyperliquid perp: 337 on 13 Oct 2026, 178 on the main dex and 159 on the HIP-3 dexes (stocks, indices, commodities, FX). | $0.02 |
| `AGENTFEED_GET_MARKET_STATE` | Market state for BTC, ETH, SOL or HYPE in one call: spot and the perp's basis against the Hyperliquid oracle, realized vol 7d and 30d, funding with its 30-day z-score, open interest and its changes, the top Hyperliquid accounts' net-long share, liquidations 1h and 24h by side, Fear and Greed, the next FOMC or CPI release, and flags with stated thresholds. | $0.02 |
| `AGENTFEED_GET_MACRO_CALENDAR` | FOMC, CPI, NFP and PCE calendar for traders: the next Fed rate decisions and the CPI, nonfarm payrolls and PCE release dates with UTC times converted from New York time (DST-aware), each with its official Fed, BLS or BEA source URL and the time we verified it. | $0.005 |
| `AGENTFEED_GET_TRADFI_RADAR` | Stock perps, S&P 500, Nasdaq, gold and oil perps ranked by funding rate: every stock, index, commodity and FX perp on the Hyperliquid HIP-3 dexes (trade[XYZ], Paragon, Markets by Kinetiq, Entropy), with funding at its 8h equivalent, a 30-day funding z-score, open interest and its 24h change, mark minus oracle basis and 24h volume. | $0.02 |
| `AGENTFEED_GET_EQUITY_24H` | Weekend price for US stocks: an indicative 24/7 price for a stock or index (TSLA, NVDA, S&P 500, Nasdaq) from stock perps on Hyperliquid and our tokenized stocks DEX price, with the last regular-session price, its time and source, the implied gap in %, each source's liquidity and the session (open, pre, after, overnight, weekend). | $0.01 |
| `AGENTFEED_GET_OPEN_INTEREST` | Open interest for ANY Hyperliquid perp: OI in base units and in USD with the mark price, and its 1h and 24h change from our own 5-minute sampler (null until that record reaches back so far). | $0.01 |
| `AGENTFEED_GET_OI_SPIKE_SCAN` | Open interest spikes across every Hyperliquid perp: coins whose open interest moved abnormally in the last hour against their own previous day, with the 1h, 4h and 24h change (in coin units, so a price move does not count), a spike z-score, the price move and funding. | $0.02 |
| `AGENTFEED_GET_BASIS` | Perp basis for any Hyperliquid perp: its mark price against Hyperliquid's oracle price (the validators' weighted median of spot venues), as a premium or discount in %, with a contango or backwardation read and the funding context. | $0.01 |
| `AGENTFEED_GET_VOLATILITY` | Realized volatility for any Hyperliquid perp: 7-day and 30-day annualized from daily candles, plus today's range in %. | $0.01 |
| `AGENTFEED_GET_FUNDING_HISTORY` | Funding rate history for any Hyperliquid perp, up to 200 hourly settlements: the average rate, its annualized %, the share of intervals that were positive, and the raw series. | $0.005 |
| `AGENTFEED_GET_TOP_MOVERS` | Top gainers and losers over 24h across every Hyperliquid perp above a liquidity floor, each with its funding rate attached. | $0.01 |
| `AGENTFEED_GET_ORDERBOOK_IMBALANCE` | Orderbook imbalance for any Hyperliquid perp: resting bid and ask liquidity in USD within ±N bps of mid, the ratio between the two sides, and a skew read. | $0.01 |
| `AGENTFEED_GET_ORDERBOOK_WALLS` | Orderbook walls for any Hyperliquid perp: the largest resting orders on each side of the book, with USD size and distance from mid. | $0.01 |
| `AGENTFEED_GET_TOKEN_HOLDERS` | Top holders of any SPL token: per-account share with top-1, top-5 and top-10 concentration for a Solana mint. | $0.02 |
| `AGENTFEED_GET_WALLET_ACTIVITY` | Solana wallet activity: recent transactions for any address, each with the wallet's SOL and token balance changes, the fee, failures and the programs invoked. | $0.02 |
| `AGENTFEED_GET_PRIORITY_FEES` | Solana priority fees right now: percentiles from min to max of the per-slot minimum fee paid on the busiest SOL/USDC pools over the last ~150 slots, in micro-lamports per compute unit, with a recommended level. | $0.005 |
| `AGENTFEED_GET_JITO_TIPS` | Jito tips sampled on-chain: p25 to p99 in SOL of the newest transfers into Jito's tip accounts, what landed bundles actually paid, refreshed every 5 minutes, with a landing recommendation. | $0.005 |
| `AGENTFEED_GET_SOL_NETWORK` | Solana network health: recent average TPS, the current slot, the current epoch and epoch progress in %. | $0.005 |
| `AGENTFEED_GET_PEG_UNIVERSE` | Tokenized stocks ranked by off-hours peg risk: every tokenized US equity we track, with p95 and max deviation bps, market-open deviation as the control, and median liquidity. | $0.05 |
| `AGENTFEED_GET_PEG_DEVIATION` | Tokenized stock peg deviation on Solana: the on-chain DEX price of a tokenized US equity versus the underlying's last real trade, in bps, with 24h stats split into market-open and off-hours. | $0.02 |
| `AGENTFEED_GET_PEG_SESSIONS` | Tokenized stock peg by trading session: deviation broken out across open, premarket, afterhours, overnight and weekend — mean, p95, max bps and median liquidity each, with the worst off-hours window flagged. | $0.03 |
| `AGENTFEED_GET_EXIT_QUOTE` | EXIT LIQUIDITY on seized collateral: what a liquidator ACTUALLY realises selling a Kamino reserve into live routing, versus the oracle price the protocol marks it at. | $0.02 |
| `AGENTFEED_GET_EXIT_METHOD` | FREE: exactly how the collateral exit measurements are produced, so the numbers can be checked rather than trusted. | free |
| `AGENTFEED_GET_ETH_PRICE` | ETH spot price in USD, read on-chain from the two deepest WETH/USDC Uniswap V3 pools, on Ethereum and on Base. | $0.001 |
| `AGENTFEED_GET_BASE_GAS` | Base gas price (chain 8453) in BOTH gwei and wei, with base fee, priority fee and block number when the node supplies them. | $0.005 |
| `AGENTFEED_GET_BASE_BALANCE` | ERC20 and native ETH wallet balance on Base or Ethereum mainnet, for a 0x address or an ENS name. | $0.005 |
| `AGENTFEED_GET_CASCADE_FORECAST` | Liquidation forecast, FORWARD-LOOKING and not a description of what already happened. | $0.02 |
| `AGENTFEED_GET_PERP` | Use when an agent needs one perp market in a single call. | $0.005 |
| `AGENTFEED_GET_LIQ_PULSE` | Use when an agent needs to know what is being liquidated right now. | $0.005 |
| `AGENTFEED_GET_LIQ_FEED` | Use when an agent needs liquidation pressure as it happens. | $0.001 |
| `AGENTFEED_GET_FUNDING_PULSE` | Use when an agent needs the most extreme funding rates right now. | $0.005 |
| `AGENTFEED_GET_SPOT` | Use when an agent needs a spot price without choosing a venue. | $0.001 |
| `AGENTFEED_GET_HL_WHALES` | Use when an agent needs to know how the biggest Hyperliquid traders are positioned. | $0.02 |
| `AGENTFEED_GET_BASE_LAUNCHES` | Use when an agent needs the newest token launches on Base. | $0.02 |
| `AGENTFEED_GET_HONEYPOT_CHECK` | Use when an agent needs to know whether a token on Base, BNB Chain or Ethereum can be sold before it buys. | $0.01 |
| `AGENTFEED_GET_WEB_MARKDOWN` | Use when an agent needs the readable text of a web page as markdown. | $0.005 |
| `AGENTFEED_GET_PDF_MARKDOWN` | Use when an agent needs the text of a PDF as markdown. | $0.01 |
| `AGENTFEED_GET_SEC_FILINGS` | Use when an agent needs a US company's latest SEC filings. | $0.005 |
| `AGENTFEED_GET_INSIDER_TRADES` | Use when an agent needs what a company's insiders bought and sold. | $0.01 |
| `AGENTFEED_GET_SEC_8K` | Use when an agent needs the material events US companies disclosed in the last hours. | $0.01 |
| `AGENTFEED_GET_TRADFI_PERPS` | Use when an agent needs a 24/7 price for a stock, index, commodity or currency outside market hours. | $0.005 |
| `AGENTFEED_GET_FX_RATES` | Use when an agent needs official daily exchange rates. | $0.002 |
| `AGENTFEED_GET_SIGNAL_BOARD` | Signal board for trading bots: the Hyperliquid perp market in one table, ranked by open interest in USD (30 coins by default, up to 60, or the coins you list). | $0.01 |
| `AGENTFEED_GET_COIN_SIGNAL` | Signal for one Hyperliquid perp, for trading bots. | $0.004 |
| `AGENTFEED_GET_SANCTIONS_CHECK` | Use when an agent needs to screen a crypto wallet before paying or being paid. | $0.008 |
| `AGENTFEED_GET_EMAIL_VERIFY` | Use when an agent needs to know whether an email address can plausibly receive mail. | $0.005 |
| `AGENTFEED_GET_DOMAIN` | Use when an agent needs the basic facts about a domain. | $0.005 |
| `AGENTFEED_GET_PAPERS` | Use when an agent needs scholarly papers on a topic. | $0.015 |
| `AGENTFEED_GET_PAPER` | Use when an agent needs the paper behind a DOI. | $0.005 |
| `AGENTFEED_GET_WIKI` | Use when an agent needs a reliable plain-text summary of a topic. | $0.005 |
| `AGENTFEED_GET_QR` | Use when an agent needs a QR code for a link, address or payment string. | $0.005 |
| `AGENTFEED_GET_HASH` | Use when an agent needs a hash it should not compute itself. | $0.005 |
| `AGENTFEED_GET_TIME` | Use when an agent needs an exact time conversion with the right daylight-saving rules. | $0.005 |
| `AGENTFEED_GET_CONVERT` | Use when an agent needs an exact unit conversion. | $0.005 |
| `AGENTFEED_GET_SOL_TOKEN_CHECK` | Use when an agent needs a pre-trade check on a Solana token. | $0.025 |
| `AGENTFEED_GET_SOL_TOKEN_FLOW` | Use when an agent needs to know who is trading a Solana token. | $0.008 |
| `AGENTFEED_GET_SOL_HOLDER_CLUSTERS` | Use when an agent needs to know whether a Solana token's holders are one owner. | $0.008 |
| `AGENTFEED_GET_OCR` | Use when an agent needs the text inside an image. | $0.04 |
| `AGENTFEED_GET_SUMMARIZE` | Use when an agent needs the gist of a web page or PDF. | $0.02 |
| `AGENTFEED_GET_EXTRACT` | Use when an agent needs named fields from a page or PDF. | $0.025 |
| `AGENTFEED_GET_TRANSLATE` | Use when an agent needs text in another language. | $0.04 |
| `AGENTFEED_GET_CLASSIFY` | Use when an agent needs text sorted into its own categories. | $0.005 |
| `AGENTFEED_GET_INJECTION_CHECK` | Use when an agent needs to vet untrusted text before reading it. | $0.004 |
| `AGENTFEED_GET_TRANSCRIBE` | Use when an agent needs the words in an audio file. | $0.02 |

## How the actions read your message

Most actions need nothing but the question. The ones that take an input read it from the message, and without it they answer with what is missing and pay nothing.

| Input | What the message must contain |
|---|---|
| Solana mint (token risk, metadata, holders, token check, token flow, holder clusters) | a mint address; token flow also takes "the last 80 swaps" (20 to 100) |
| Solana wallet (holdings, activity) | a wallet address |
| `AGENTFEED_GET_SANCTIONS_CHECK` | a crypto address of any family (Ethereum, Bitcoin, Tron, Solana, XRP, Litecoin) |
| `AGENTFEED_GET_COIN_SIGNAL` | a Hyperliquid perp: BTC, ETH, SOL, HYPE, `$WIF`, kPEPE |
| `AGENTFEED_GET_SIGNAL_BOARD` | nothing; "top 10" or "for BTC, ETH and SOL" narrows it |
| OCR, transcribe, summarize, web and PDF to markdown | an http(s) URL; summarize also takes "medium" |
| extract | an http(s) URL and the fields, as `{"title":"string","price":"number"}` or `fields: title, price:number` |
| translate | the target language ("to German", `de`, `pt-BR`) and the text in double quotes or after a colon |
| classify | the text in double quotes and the labels, as `labels: a, b, c` or `as a, b or c` |
| injection check | the text in double quotes or after a colon |
| hash | `sha256`, `keccak256` or `blake2b`, and the data in double quotes or after a colon |
| QR | the text, link or address, in double quotes, after a colon or as a URL; "png" for PNG |
| convert | a number and two units: "5 miles to km", "72 F to C" |
| time | nothing; an IANA zone or a city, and an ISO time with Z or an offset, narrow it |
| email, domain, DOI | an email address, a hostname such as `example.com`, a DOI such as `10.1038/nature14539` |
| Wikipedia, papers | a title ("about Solana (blockchain platform)"), a topic ("papers on graph neural networks since 2022, top 5") |
| SEC filings, insider trades | a US ticker such as `$NVDA` |

Inputs travel in the URL of a GET, so a whole request over 8,000 characters once encoded is refused in words before anything is paid; the 4,000-character text limit of translate, classify and injection check is reachable only with plain Latin text.

The seven fixed-purpose language tasks are not offered from every region. Where the service does not offer them it answers HTTP 451 before asking for payment; the action then says so in words, pays nothing and does not retry.

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
> "How are the biggest traders positioned on SOL?"
> "Is this token a rug: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
> "Give me the full trade context before we size this position."
> "What has $NVDA filed with the SEC lately?"
> "Screen this wallet before I pay it: 4a8o45skRPcyjAdyR8yES215Swvh8uTpZD6KLarhxCJ7"
> "Translate to German: \"Good morning. The market opens at 9:30.\""
> "How many km are in 5 miles?"

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
