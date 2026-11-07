import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildCommunityContext } from './graph-community-context.mjs';
import { loadKnowledgeContext } from './knowledge-context.mjs';

const repository = fileURLToPath(new URL('../', import.meta.url));
const output = join(repository, 'graphify-out');
const graphFile = join(output, 'graph.json');
const graph = JSON.parse(readFileSync(graphFile, 'utf8'));
const rules = JSON.parse(readFileSync(join(repository, 'docs/graphify-communities.json'), 'utf8'));
const descriptions = loadKnowledgeContext(repository);
const context = buildCommunityContext(graph, rules, descriptions);
const labels = Object.fromEntries(Object.entries(context.communities).map(([id, group]) => [id, group.name]));
for (const node of graph.nodes) node.community_name = labels[String(node.community)];
const localVault = join(homedir(), 'Documents/Obsidian Vault/TaraSibale');
for (const group of Object.values(context.communities)) {
  const guide = join(existsSync(localVault) ? localVault : join(output, 'obsidian'), `${group.guide}.md`);
  group.guideUrl = `obsidian://open?path=${encodeURIComponent(guide)}`;
}
for (const node of Object.values(context.nodes)) {
  if (!node.source) continue;
  const source = resolve(repository, node.source);
  if (relative(repository, source).startsWith('..') || node.source.includes('.env')) continue;
  node.sourceUrl = pathToFileURL(source).href;
}
writeFileSync(graphFile, `${JSON.stringify(graph, null, 2)}\n`);
writeFileSync(join(output, '.graphify_labels.json'), `${JSON.stringify(labels, null, 2)}\n`);
writeFileSync(join(output, 'community-context.json'), `${JSON.stringify(context, null, 2)}\n`);
const result = spawnSync('graphify', ['export', 'html', '--graph', graphFile, '--labels', join(output, '.graphify_labels.json')], { cwd: repository, stdio: 'inherit' });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
let html = readFileSync(join(output, 'graph.html'), 'utf8');
if (!html.includes('function showInfo(') || !html.includes('const LEGEND =')) throw new Error('Graphify HTML changed: review the context adapter before publishing.');
const payload = JSON.stringify(context).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
const ui = readFileSync(join(repository, 'scripts/graph-context-ui.js'), 'utf8');
html = html.replace(/<title>[^<]*<\/title>/, '<title>TaraSibale — Codebase Explorer</title>');
html = html.replace('</body>', `<script id="tarasibale-context-data">const TARA_CONTEXT = ${payload};</script>\n<script id="tarasibale-context-ui">${ui}</script>\n</body>`);
writeFileSync(join(output, 'graph.html'), html);
const report = ['# TaraSibale community guide', '', 'Names and descriptions explain observed code clusters. Original node IDs, communities, and relationships remain unchanged. Read the source and the named entry points; a cluster is not a deployment boundary.', ''];
for (const group of Object.values(context.communities)) {
  report.push(`## ${group.name}`, '', group.purpose, '', `**${group.count} nodes · ${group.files.length} files · ${group.kind}**`, '', 'Start with:', ...group.entries.map((entry) => `- ${entry.label} — ${entry.source}: ${entry.why}`), '', 'Questions:', ...group.questions.map((question) => `- ${question}`), '');
}
writeFileSync(join(output, 'COMMUNITY_GUIDE.md'), report.join('\n'));
const reportFile = join(output, 'GRAPH_REPORT.md');
if (existsSync(reportFile)) writeFileSync(reportFile, readFileSync(reportFile, 'utf8').replace(/Community (\d+)/g, (text, id) => labels[id] ?? text));
console.log(`Enriched ${Object.keys(labels).length} communities and ${Object.keys(context.nodes).length} nodes; topology preserved.`);
