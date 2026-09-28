#!/usr/bin/env node
// gen-actions-from-spec.mjs — ENDPOINTS entries for routes the plugin does not cover
// yet, derived from the live service rather than written by hand.
//
//   path, price, description   GET https://x402.ochinimus.app/openapi.json
//   triggers                   the route's question in /SKILL.md, plus its MCP title
//   similes                    the tool name, the plugin's [X, GET_X] convention
//
// A route with a REQUIRED parameter is refused: the plugin's params are regex-matched
// out of the user's message (mint, wallet, tokenized-equity symbol, EVM address), and
// a required param needs one of those chosen deliberately. Optional params are left
// off, as 37 of 0.5.2's 45 actions already do, and the server's default applies.
//
// The price is inserted before the first sentence's full stop, "... in a single call
// ($0.001). Returns ...", the way the existing descriptions carry it; the README
// generator strips it from the Data column because the Price column shows it.
//
// usage: node gen-actions-from-spec.mjs /api/perp /api/liq-pulse ...   (prints TS)
const ORIGIN = 'https://x402.ochinimus.app';
const routes = process.argv.slice(2);
if (!routes.length) { console.error('usage: node gen-actions-from-spec.mjs <route> [...]'); process.exit(1); }

const spec = await (await fetch(`${ORIGIN}/openapi.json`)).json();
const skill = await (await fetch(`${ORIGIN}/SKILL.md`)).text();
const tl = await (await fetch(`${ORIGIN}/mcp`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
  body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
})).text();
const tools = (() => { try { return JSON.parse(tl); } catch { return JSON.parse(tl.split(/\r?\n/).find((l) => /^data:/.test(l)).slice(5)); } })().result.tools;

const questions = new Map();
for (const line of skill.split('\n')) {
  const m = line.match(/^\| (.+?) \| `GET (\/api\/[^`\s]+)`/);
  if (m) questions.set(m[2], m[1]);
}
const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const out = [];
for (const route of routes) {
  const op = spec.paths[route]?.get;
  if (!op) throw new Error(`${route}: not in the live openapi.json`);
  const usd = Number(op['x-payment-info']?.price?.amount);
  if (!Number.isFinite(usd) || usd <= 0) throw new Error(`${route}: no price in x-payment-info`);
  const required = (op.parameters || []).filter((p) => p.required).map((p) => p.name);
  if (required.length) throw new Error(`${route}: required params ${required} need a deliberate plugin param`);
  const tool = op.operationId;
  const title = tools.find((t) => t.name === tool)?.title;
  const question = questions.get(route);
  if (!title || !question) throw new Error(`${route}: missing ${!title ? 'MCP title' : 'SKILL.md question'}`);
  const desc = String(op.description);
  const dot = desc.search(/\.\s/);
  const withPrice = dot > 0 ? `${desc.slice(0, dot)} ($${usd})${desc.slice(dot)}` : `${desc.replace(/\.?$/, '')} ($${usd}).`;
  const base = tool.replace(/^get_/, '').toUpperCase();
  out.push([
    '  {',
    `    path: ${q(route)},`,
    `    usd: ${usd},`,
    `    action: ${q('AGENTFEED_' + tool.toUpperCase())},`,
    `    similes: [${q(base)}, ${q('GET_' + base)}],`,
    '    description:',
    `      ${q(withPrice)},`,
    `    triggers: [${q(question.replace(/\?$/, '').toLowerCase())}, ${q(title.toLowerCase())}],`,
    '  },',
  ].join('\n'));
}
process.stdout.write(out.join('\n') + '\n');
