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
import { ENDPOINTS, BASE58_RE, type EndpointDef } from './endpoints.js';

function buildExamples(def: EndpointDef): ActionExample[][] {
  return def.triggers.slice(0, 2).map((t) => [
    {
      name: '{{user1}}',
      content: { text: t.replace('<mint>', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v').replace('<address>', '4a8o45skRPcyjAdyR8yES215Swvh8uTpZD6KLarhxCJ7') },
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
      if (def.param) {
        const m = (message?.content?.text ?? '').match(BASE58_RE);
        if (!m) {
          await callback?.({
            text: `I need a Solana ${def.param} address in the message to run this lookup.`,
          });
          return false;
        }
        path = path.replace(`:${def.param}`, m[0]);
      }

      const result = await svc.paidGet(path);

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
