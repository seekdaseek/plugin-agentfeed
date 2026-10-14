// @seekdaseek/plugin-agentfeed — paid crypto market data for elizaOS agents,
// settled per-call in USDC over x402 on Solana. No API keys, no subscriptions.

import type { Plugin } from '@elizaos/core';
import { AgentFeedService } from './service.js';
import { agentfeedActions } from './actions.js';

export const agentfeedPlugin: Plugin = {
  name: 'agentfeed',
  description:
    'Crypto market data for AI agents (liquidations, funding, open interest, prices), Solana pre-trade checks, OFAC sanctions screening, scholarly papers, utilities and fixed-purpose language tasks (OCR, translate, summarize, extract, classify, prompt-injection check, transcribe). Each call is paid on the fly in USDC via the x402 protocol on Solana ($0.001–$0.10 per call). Requires a funded Solana wallet.',
  services: [AgentFeedService],
  actions: agentfeedActions,
};

export { AgentFeedService } from './service.js';
export { ENDPOINTS } from './endpoints.js';
export default agentfeedPlugin;
