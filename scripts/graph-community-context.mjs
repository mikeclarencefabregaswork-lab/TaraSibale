import { basename } from 'node:path';

export function buildCommunityContext(graph, rules, descriptions) {
  const groups = new Map();
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  for (const node of graph.nodes) {
    if (!groups.has(String(node.community))) groups.set(String(node.community), []);
    groups.get(String(node.community)).push(node);
  }
  const communities = {};
  for (const [id, members] of groups) {
    const counts = new Map();
    for (const node of members) if (node.source_file) counts.set(node.source_file, (counts.get(node.source_file) ?? 0) + 1);
    const files = [...counts].sort((a, b) => b[1] - a[1]).map(([file, count]) => ({ file, count, purpose: descriptions.files[file]?.summary ?? 'Inspect the source for this newly indexed file.' }));
    const anchor = rules.anchors.find((rule) => members.some((node) => node.source_file === rule.source && node.label === rule.symbol));
    const rule = anchor ?? (files.length === 1 ? rules.files[files[0].file] : null);
    const primary = files[0]?.file ?? '';
    const name = rule?.name ?? `${basename(primary) || 'External modules'} and shared references`;
    const kind = /migrations\//.test(primary) ? 'schema'
      : /scripts\//.test(anchor?.source ?? primary) ? 'tooling'
        : /(?:package|tsconfig|oxlintrc).*\.json$/.test(primary) && !anchor ? 'configuration' : 'application';
    const requested = rule?.entries ?? [];
    const entries = requested.map((entry) => {
      const node = members.find((n) => n.source_file === entry.source && n.label === entry.symbol);
      return node ? { id: node.id, label: node.label, source: node.source_file, why: entry.why } : null;
    }).filter(Boolean);
    if (!entries.length) {
      const ranked = [...members].sort((a, b) => Number(/\(\)$/.test(b.label)) - Number(/\(\)$/.test(a.label)));
      for (const node of ranked.slice(0, 3)) entries.push({ id: node.id, label: node.label, source: node.source_file, why: descriptions.symbols[`${node.source_file}::${node.label}`] ?? descriptions.files[node.source_file]?.summary ?? 'Inspect its indexed connections.' });
    }
    communities[id] = {
      id, name, kind, count: members.length,
      purpose: rule?.purpose ?? descriptions.files[primary]?.summary ?? 'These entries share indexed dependencies. This grouping is not a separately deployed service.',
      questions: rule?.questions ?? ['Which source owns this behavior?', 'Which neighboring group supplies its dependencies?'],
      guide: rule?.guide ?? descriptions.files[primary]?.guide ?? 'TaraSibale - Code Map',
      files, entries, related: [], members: members.map((node) => node.id),
    };
  }
  for (const group of Object.values(communities)) {
    const related = new Map();
    for (const edge of graph.links) {
      const a = String(nodeById.get(edge.source)?.community);
      const b = String(nodeById.get(edge.target)?.community);
      if (a === b) continue;
      const other = a === group.id ? b : b === group.id ? a : null;
      if (other && communities[other]) related.set(other, (related.get(other) ?? 0) + 1);
    }
    group.related = [...related].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id, count]) => ({ id, count, name: communities[id].name }));
  }
  const nodes = Object.fromEntries(graph.nodes.map((node) => [node.id, {
    community: String(node.community), label: node.label, source: node.source_file,
    location: node.source_location ?? '',
    purpose: descriptions.symbols[`${node.source_file}::${node.label}`] ?? descriptions.external[node.label] ?? descriptions.files[node.source_file]?.summary ?? 'Newly indexed entry: review its source before relying on an explanation.',
    filePurpose: descriptions.files[node.source_file]?.summary ?? '',
  }]));
  const tours = [
    { name: 'Follow catalog data', why: 'Read the UI loader, server catalog implementation, and stored resource shape. This is a reading route, not a claim that these are direct call edges.', targets: [['Frontend/src/App.tsx', 'App()'], ['Backend/src/api.ts', 'createApi()'], ['Backend/migrations/001_initial.sql', 'resources']] },
    { name: 'Understand saved trips', why: 'Start with guest/device persistence, then inspect the account storage table.', targets: [['Frontend/src/userState.tsx', 'useUserStatePersistence()'], ['Backend/migrations/001_initial.sql', 'user_state']] },
    { name: 'Why is signup blocked?', why: 'Inspect the portfolio boundary before diagnosing authentication or database failures.', targets: [['Backend/src/app.ts', 'createApp()'], ['Backend/src/api.ts', 'issueSession()']] },
  ].map(({ targets, ...tour }) => ({ ...tour, nodes: targets.map(([file, label]) => graph.nodes.find((node) => node.source_file === file && node.label === label)?.id).filter(Boolean) }));
  return { communities, nodes, tours };
}
