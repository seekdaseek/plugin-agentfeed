// @seekdaseek/plugin-agentfeed — paid crypto market data for elizaOS agents,
// settled per-call in USDC over x402 on Solana. No API keys, no subscriptions.

import type { Plugin } from '@elizaos/core';
import { AgentFeedService } from './service.js';
import { agentfeedActions } from './actions.js';

export const agentfeedPlugin: Plugin = {
  name: 'agentfeed',
  description:
    'Live crypto market data for trading agents — liquidations, long/short positioning, open interest, funding rates, SOL/BTC prices, and SPL token rug-risk checks. Each call is paid on the fly in USDC via the x402 protocol on Solana ($0.001–$0.01 per call). Requires a funded Solana wallet.',
  services: [AgentFeedService],
  actions: agentfeedActions,
};

export { AgentFeedService } from './service.js';
export { ENDPOINTS } from './endpoints.js';
export default agentfeedPlugin;
