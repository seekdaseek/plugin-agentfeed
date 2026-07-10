# @seekdaseek/plugin-agentfeed

Live crypto market data for [elizaOS](https://github.com/elizaOS/eliza) trading agents, paid per-call in USDC over the [x402 protocol](https://x402.org) on Solana.

No API keys. No subscriptions. No signup. Your agent holds a wallet, and pays $0.001–$0.01 per call only when it actually needs data.

Backed by [AgentFeed](https://x402.ochinimus.app) — multi-exchange liquidation collection (Bybit + OKX WebSocket), Bybit v5 positioning, Pyth prices, and Helius DAS on-chain data.

## What your agent can ask for

| Action | Data | Price |
|---|---|---|
| `AGENTFEED_GET_TRADE_CONTEXT` | Full market state: prices, funding, fear/greed, positioning, liquidations | $0.01 |
| `AGENTFEED_GET_LIQUIDATIONS` | Recent SOL/BTC liquidation prints, filterable | $0.003 |
| `AGENTFEED_GET_LIQUIDATION_STATS` | 1h/24h totals, long/short split, biggest print | $0.004 |
| `AGENTFEED_GET_POSITIONING` | Long/short ratio + open interest with 1h/24h deltas | $0.004 |
| `AGENTFEED_GET_FUNDING_RATE` | SOL + BTC perp funding rates | $0.002 |
| `AGENTFEED_GET_MARKET_SNAPSHOT` | Compact market snapshot | $0.003 |
| `AGENTFEED_GET_SOL_PRICE` | SOL spot via Pyth | $0.001 |
| `AGENTFEED_GET_BTC_PRICE` | BTC spot via Pyth | $0.001 |
| `AGENTFEED_GET_TOKEN_RISK` | Rug-risk scan: mint/freeze authority, holder concentration | $0.01 |
| `AGENTFEED_GET_TOKEN_METADATA` | SPL token metadata via Helius DAS | $0.005 |
| `AGENTFEED_GET_WALLET_HOLDINGS` | Wallet portfolio via Helius DAS | $0.008 |

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

- Before paying any endpoint, the plugin reads the live 402 quote and **refuses any price above `AGENTFEED_MAX_SPEND_PER_CALL`** (default `$0.02`).
- Approved quotes are cached for 10 minutes, so steady-state calls cost a single request.
- No `Provider` is registered — the plugin never silently injects paid data into every prompt. Data is fetched only when an action explicitly fires.

## Settings

| Setting | Required | Default | Description |
|---|---|---|---|
| `AGENTFEED_PRIVATE_KEY` | yes | — | Payer wallet key (base58 string or JSON byte array). Must hold USDC on Solana mainnet. |
| `AGENTFEED_BASE_URL` | no | `https://x402.ochinimus.app` | API base URL. |
| `AGENTFEED_MAX_SPEND_PER_CALL` | no | `0.02` | USD cap per call; higher quotes are refused. |

## Security notes

- Use a **dedicated hot wallet** for the agent with only the USDC you're willing to spend. Never your main wallet.
- The private key never leaves the process; payments are signed locally and settled through the x402 facilitator.

## Also available over MCP

The same data is exposed as MCP tools (x402-gated) — see the [AgentFeed manifest](https://x402.ochinimus.app/.well-known/x402.json).

## License

MIT — [seekdaseek](https://github.com/seekdaseek)
