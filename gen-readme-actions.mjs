#!/usr/bin/env node
// gen-readme-actions.mjs — the README's action table, generated from the code.
//
// Up to 0.5.1 the table was hand-kept: 13 rows, while dist/index.js registered
// 45 AGENTFEED_GET_* actions. It also let three sources disagree about the spend
// cap -- the README said $0.02, agentConfig said 0.05 and named get_cascade_scan
// as the priciest tool, and the code used DEFAULT_MAX_SPEND_USD = 0.5 while
// get_squeeze_score cost $0.10. So this script does two things from the BUILT
// code, which is what npm ships:
//
//   writes   the "What your agent can ask for" table, one row per ENDPOINTS entry
//   checks   that the README and package.json agentConfig state the default cap
//            and the most expensive action the code actually has; it exits 1 if
//            either disagrees, so a price or default change cannot ship silently.
//
// usage: npm run build && node gen-readme-actions.mjs
import fs from 'node:fs';
import vm from 'node:vm';

const DIST = 'dist/index.js';
const code = fs.readFileSync(DIST, 'utf8');

const at = code.indexOf('var ENDPOINTS = [');
if (at < 0) throw new Error(`no ENDPOINTS array in ${DIST}`);
let depth = 0, end = at + 'var ENDPOINTS = '.length;
for (; end < code.length; end++) {
  if (code[end] === '[') depth++;
  else if (code[end] === ']' && --depth === 0) { end++; break; }
}
const ENDPOINTS = vm.runInNewContext('(' + code.slice(at + 'var ENDPOINTS = '.length, end) + ')');

const registered = [...new Set(code.match(/AGENTFEED_GET_[A-Z0-9_]+/g))];
const missing = registered.filter((a) => !ENDPOINTS.some((e) => e.action === a));
if (missing.length) throw new Error(`actions outside ENDPOINTS, the table would miss them: ${missing.join(', ')}`);

const money = (usd) => {
  if (!usd) return 'free';
  const d = (String(usd).split('.')[1] || '').length;
  return '$' + usd.toFixed(Math.max(2, d));
};
// The first sentence, without the "($0.05)" price the Price column already shows.
const data = (desc) => {
  const first = String(desc).split(/(?<=\.)\s/)[0];
  return first.replace(/\s*\(\$[0-9.]+\)/g, '').replace(/\|/g, '\\|').trim();
};

const rows = ENDPOINTS.map((e) => `| \`${e.action}\` | ${data(e.description)} | ${money(e.usd)} |`);
const table = '| Action | Data | Price |\n|---|---|---|\n' + rows.join('\n') + '\n';

let md = fs.readFileSync('README.md', 'utf8');
const H = '| Action | Data | Price |\n|---|---|---|\n';
const t0 = md.indexOf(H);
if (t0 < 0) throw new Error('README action table header not found');
let t1 = t0 + H.length;
while (md.startsWith('| `AGENTFEED_', t1)) t1 = md.indexOf('\n', t1) + 1;
md = md.slice(0, t0) + table + md.slice(t1);
fs.writeFileSync('README.md', md);

// ---- the spend-cap facts, checked against the code -----------------------
const DEFAULT = Number((code.match(/DEFAULT_MAX_SPEND_USD\s*=\s*([0-9.e-]+)/) || [])[1]);
const top = ENDPOINTS.reduce((m, e) => (e.usd > m.usd ? e : m));
const topTool = top.action.replace(/^AGENTFEED_/, '').toLowerCase();
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const cfg = pkg.agentConfig.pluginParameters.AGENTFEED_MAX_SPEND_PER_CALL.description;
const problems = [];
const readmeDefaults = [...md.matchAll(/default `\$?([0-9.]+)`/gi)].map((m) => Number(m[1]));
const settingsRow = (md.match(/\| `AGENTFEED_MAX_SPEND_PER_CALL` \| no \| `([0-9.]+)` \|/) || [])[1];
if (!readmeDefaults.length || readmeDefaults.some((v) => v !== DEFAULT)) problems.push(`README spend-guard default ${JSON.stringify(readmeDefaults)} != code ${DEFAULT}`);
if (Number(settingsRow) !== DEFAULT) problems.push(`README settings table default ${settingsRow} != code ${DEFAULT}`);
if (Number((cfg.match(/Default: ([0-9.]+)/) || [])[1]) !== DEFAULT) problems.push(`agentConfig default != code ${DEFAULT}`);
if (!cfg.includes(topTool) || !md.includes(topTool)) problems.push(`most expensive action is ${topTool} (${money(top.usd)}); README or agentConfig names something else`);
if (problems.length) { console.error('SPEND-CAP DOCS DISAGREE WITH THE CODE:\n  ' + problems.join('\n  ')); process.exit(1); }

console.log(`action table: ${rows.length} rows from ${DIST} (${registered.length} registered actions)`);
console.log(`spend cap: default ${DEFAULT}, most expensive ${topTool} at ${money(top.usd)} -- README and agentConfig agree`);
