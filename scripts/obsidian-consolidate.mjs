import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { publishGuides } from './obsidian-guides.mjs';
import { declarationDetails } from './obsidian-note-context.mjs';
import { loadKnowledgeContext } from './knowledge-context.mjs';

const read = (file) => readFileSync(file, 'utf8');
const json = (file) => JSON.parse(read(file));
const table = (value) => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ').replaceAll('`', "'");
const title = (name) => `TaraSibale - ${name}`;
const extras = {
  'UI Components': 'Reference for the browser components, their parent contracts, and local helpers. For end-to-end behavior, read [[TaraSibale - Feature Flows]].',
  'API and Validation': 'Reference for request processing, server helpers, and validated payloads. For authorization policy, read [[TaraSibale - Modes and Access]]; for storage relationships, read [[TaraSibale - Database]].',
  'Domain Types': 'Shared TypeScript contracts used by the interface. These describe declared shapes; server validation and PostgreSQL constraints independently enforce persisted data.',
  'Dependencies': 'One entry per package, with the declared version ranges across workspaces combined. Ranges describe package manifests, not proof of the installed version or of every runtime import.',
  'Workspace Configuration': 'Reference for npm commands, package metadata, TypeScript projects, linting, and local build/documentation tooling. For the startup and troubleshooting workflow, read [[TaraSibale - Development]].',
};

function packageKey(label) {
  return label.lastIndexOf('@') > 0 ? label.slice(0, label.lastIndexOf('@')) : label;
}

function inboundReferences(vault, managed, retiredNames, target) {
  const hits = [];
  const prefix = relative(vault, target).replaceAll('\\', '/');
  function visit(directory) {
    for (const item of readdirSync(directory, { withFileTypes: true })) {
      if (item.name.startsWith('.') || item.isSymbolicLink()) continue;
      const file = join(directory, item.name);
      if (item.isDirectory()) { visit(file); continue; }
      if (!/\.(md|canvas)$/.test(item.name) || managed.has(file)) continue;
      const text = read(file);
      for (const [, inner] of text.matchAll(/\[\[([^\]]+)\]\]/g)) {
        const address = inner.split('|')[0].split('#')[0].replace(/\.md$/, '');
        const local = prefix && address.startsWith(`${prefix}/`) ? address.slice(prefix.length + 1) : address;
        if (retiredNames.has(local)) hits.push(`${relative(vault, file)} -> ${address}`);
      }
      if (item.name.endsWith('.canvas')) {
        for (const node of JSON.parse(text).nodes ?? []) {
          if (node.type !== 'file') continue;
          const address = node.file.replace(/\.md$/, '');
          const local = prefix && address.startsWith(`${prefix}/`) ? address.slice(prefix.length + 1) : address;
          if (retiredNames.has(local)) hits.push(`${relative(vault, file)} -> ${node.file}`);
        }
      }
    }
  }
  visit(vault);
  return hits;
}

function destination(node, manifests) {
  const file = node.source_file ?? '';
  const label = node.label;
  if (!file) return { name: title(label === 'frontend_src_index' ? 'UI Components' : 'Dependencies'), section: label === 'frontend_src_index' ? 'Stylesheet reference' : 'Node and extraction references' };
  if (file.endsWith('package.json')) {
    const data = manifests[file];
    const key = packageKey(label);
    if (data?.dependencies?.[key] || data?.devDependencies?.[key]) return { name: title('Dependencies'), section: 'Packages' };
    return { name: title('Workspace Configuration'), section: label in (data?.scripts ?? {}) || label === 'scripts' ? 'Commands' : 'Package metadata' };
  }
  if (/tsconfig|\.oxlintrc/.test(file)) return { name: title('Workspace Configuration'), section: 'TypeScript and lint configuration' };
  if (/scripts\//.test(file) && !file.startsWith('Backend/')) return { name: title('Workspace Configuration'), section: file };
  if (/vite\.config/.test(file)) return { name: title('Workspace Configuration'), section: file };
  if (/\/test\//.test(file)) return { name: title('Development'), section: file };
  if (/Frontend\/src\/components\/|toastStore/.test(file)) return { name: title('UI Components'), section: file };
  if (file === 'Frontend/src/types.ts') return { name: title('Domain Types'), section: file };
  if (/userState/.test(file)) return { name: title('Saved State'), section: file };
  if (/portfolio|adminDefaults|promote-admin|Backend\/src\/(auth|publishing)\.ts/.test(file)) return { name: title('Modes and Access'), section: file };
  if (/Backend\/src\/(api|validation)\.ts/.test(file)) return { name: title('API and Validation'), section: file };
  if (/migrations\/|scripts\/migrate|Backend\/src\/db\.ts/.test(file)) return { name: title('Database'), section: file };
  if (/Frontend\/src\/data\/|Backend\/scripts\/(seed|validate-seed)/.test(file)) return { name: title('Attractions and Data'), section: file };
  return { name: title('Architecture'), section: file };
}

export function consolidateVault({ repository, target, vault }) {
  const graph = json(join(repository, 'graphify-out/graph.json'));
  const context = loadKnowledgeContext(repository);
  const manifests = Object.fromEntries(['package.json', 'Frontend/package.json', 'Backend/package.json'].map((file) => [file, json(join(repository, file))]));
  const routes = new Map(graph.nodes.map((node) => [node.id, destination(node, manifests)]));
  const statePath = join(target, '.tarasibale-consolidation.json');
  const prior = existsSync(statePath) ? json(statePath) : { oldLinks: {} };
  const oldLinks = { ...prior.oldLinks };
  const graphManifest = join(target, '.graphify_obsidian_manifest.json');
  const rawFiles = existsSync(graphManifest) ? json(graphManifest).files.filter((f) => f.endsWith('.md') && existsSync(join(target, f))) : [];

  for (const filename of rawFiles) {
    const text = read(join(target, filename));
    const label = text.match(/^# (.+)$/m)?.[1];
    const source = text.match(/^source_file: "(.*)"$/m)?.[1];
    const node = graph.nodes.find((n) => n.label === label && (n.source_file ?? '') === (source ?? ''));
    oldLinks[filename.slice(0, -3)] = node ? routes.get(node.id) : { name: title('Using the Knowledge Base') };
  }
  // Maintained guides also contain symbol links when exporting into a fresh vault.
  for (const node of graph.nodes) {
    if (!oldLinks[node.label] && graph.nodes.filter((n) => n.label === node.label).length === 1) oldLinks[node.label] = routes.get(node.id);
  }
  oldLinks['graph.canvas'] = { name: '00 TaraSibale - Reading Map.canvas' };

  const appendices = new Map();
  const append = (name, text) => appendices.set(name, (appendices.get(name) ?? '') + text);
  const files = [...new Set(graph.nodes.map((n) => n.source_file).filter(Boolean))].sort();
  for (const file of files) {
    if (/package\.json$|tsconfig|\.oxlintrc/.test(file)) continue;
    const nodes = graph.nodes.filter((n) => n.source_file === file);
    const route = routes.get(nodes[0].id);
    const path = resolve(repository, file);
    if (relative(repository, path).startsWith('..') || basename(path).startsWith('.env')) throw new Error(`Unsafe source: ${file}`);
    const source = read(path);
    const summary = context.files[file]?.summary ?? 'New indexed file; its purpose needs a documentation review.';
    let body = `\n\n### ${file}\n\n${summary}\n\n[Open source](${pathToFileURL(path).href})\n\n`;
    const symbols = nodes.filter((n) => n.label !== file && n.label !== basename(file));
    if (symbols.length) {
      body += '| Entry | Responsibility | Indexed line |\n| --- | --- | --- |\n';
      for (const node of symbols) {
        const description = context.symbols[`${file}::${node.label}`] ?? 'New entry; review the source before relying on an explanation.';
        // File responsibilities appear once above; avoid repeating identical paragraphs.
        const distinct = description === summary ? 'Implements the file responsibility described above.' : description.replace(summary, '').trim();
        body += `| \`${table(node.label)}\` | ${table(distinct)} | ${node.source_location ?? 'not recorded'} |\n`;
      }
      if (/\.(ts|tsx)$/.test(file)) {
        for (const node of symbols) {
          const details = declarationDetails({ path, text: source, lines: source.split('\n') }, node.label, Number(node.source_location?.match(/L(\d+)/)?.[1] ?? 1));
          if (!details.details?.includes('### Fields and callbacks')) continue;
          const fields = details.details.split('### Fields and callbacks')[1].trim();
          body += `\n> [!info]- ${node.label}: field contract\n>\n${fields.split('\n').map((line) => `> ${line}`).join('\n')}\n`;
        }
      }
    }
    append(route.name, body);
  }

  let dependencies = '\n\n## Packages\n\n| Package | Purpose | Root range | Frontend range | Backend range |\n| --- | --- | --- | --- | --- |\n';
  const packageNames = [...new Set(Object.values(manifests).flatMap((data) => [...Object.keys(data.dependencies ?? {}), ...Object.keys(data.devDependencies ?? {})]))].sort();
  for (const pkg of packageNames) {
    const owner = Object.keys(manifests).find((file) => manifests[file].dependencies?.[pkg] || manifests[file].devDependencies?.[pkg]);
    const description = context.symbols[`${owner}::${pkg}`] ?? context.symbols[`${owner}::${pkg}@${manifests[owner].dependencies?.[pkg] ?? manifests[owner].devDependencies?.[pkg]}`] ?? 'See the workspace manifest for its declaration.';
    dependencies += `| \`${pkg}\` | ${table(description)} | ${['package.json', 'Frontend/package.json', 'Backend/package.json'].map((file) => manifests[file].dependencies?.[pkg] ?? manifests[file].devDependencies?.[pkg] ?? '—').join(' | ')} |\n`;
  }
  dependencies += '\n## Node and extraction references\n\n';
  for (const node of graph.nodes.filter((n) => !n.source_file && n.label !== 'frontend_src_index' && n.label !== 'ref_typescript')) dependencies += `- **${node.label.replace(/^ref_node_/, 'node:')}**: ${context.external[node.label] ?? 'Unresolved imported reference; inspect its source imports.'}\n`;
  dependencies += '\nThe `ref_typescript` graph placeholder refers to the same TypeScript package listed above, used through its parser API by documentation tooling. It is not another dependency installation.\n';
  append(title('Dependencies'), dependencies);
  append(title('UI Components'), `\n\n## Stylesheet reference\n\n${context.external.frontend_src_index}\n`);

  let configuration = '\n\n## Commands\n\nThe same command name is shown once, with each workspace implementation alongside it.\n\n| Command | Root | Frontend | Backend |\n| --- | --- | --- | --- |\n';
  const commands = [...new Set(Object.values(manifests).flatMap((data) => Object.keys(data.scripts ?? {})))].sort();
  for (const command of commands) configuration += `| \`${command}\` | ${['package.json', 'Frontend/package.json', 'Backend/package.json'].map((file) => manifests[file].scripts?.[command] ? `\`${table(manifests[file].scripts[command])}\`` : '—').join(' | ')} |\n`;
  configuration += '\n## Package metadata\n\n| Manifest | Package name | Module type | Private | Version |\n| --- | --- | --- | --- | --- |\n';
  for (const [file, data] of Object.entries(manifests)) configuration += `| [${file}](${pathToFileURL(join(repository, file)).href}) | ${data.name} | ${data.type ?? 'not set'} | ${data.private} | ${data.version} |\n`;
  configuration += '\nThe root declares Frontend and Backend as npm workspaces and requires Node.js >=22.12.0. Dependencies and version ranges have one canonical table in [[TaraSibale - Dependencies]].\n\n## TypeScript and lint configuration\n\n';
  const configs = files.filter((file) => /tsconfig|\.oxlintrc/.test(file));
  configuration += '| Configuration | Responsibility |\n| --- | --- |\n';
  for (const file of configs) configuration += `| [${file}](${pathToFileURL(join(repository, file)).href}) | ${table(context.files[file]?.summary ?? 'See current configuration.')} |\n`;
  configuration += '\nCompiler options live in the linked configurations. They are grouped by project rather than represented by separate notes for every repeated key. Common option meanings are combined below.\n\n| Option or rule | Meaning |\n| --- | --- |\n';
  const options = new Map();
  for (const node of graph.nodes.filter((n) => configs.includes(n.source_file))) {
    if (node.label === node.source_file || node.label === basename(node.source_file) || ['compilerOptions', 'include', 'extends', 'files', 'references', './tsconfig.json', '$schema', 'plugins', 'rules'].includes(node.label)) continue;
    if (!options.has(node.label)) options.set(node.label, context.symbols[`${node.source_file}::${node.label}`]);
  }
  for (const [option, description] of [...options].sort()) configuration += `| \`${table(option)}\` | ${table(description ?? 'See the consuming project configuration.')} |\n`;
  append(title('Workspace Configuration'), configuration);

  const extraNotes = Object.entries(extras).map(([name, intro]) => ({ name: `${title(name)}.md`, text: `---\ntags: [tarasibale/reference]\n---\n\n# ${name}\n\n${intro}\n\nReturn to [[00 TaraSibale - Start Here]].\n` }));
  const noteNames = new Set([...readdirSync(join(repository, 'docs/obsidian')).filter((f) => f.endsWith('.md')), ...extraNotes.map((n) => n.name)]);
  const rewrite = (text) => text.replace(/\[\[([^\]]+)\]\]/g, (whole, inner) => {
    const [address, alias] = inner.split('|');
    const [oldName] = address.split('#');
    if (noteNames.has(`${oldName}.md`) || oldName === '00 TaraSibale - Reading Map.canvas') return whole;
    const route = oldLinks[oldName];
    if (!route) return whole;
    return `[[${route.name}${route.section ? `#${route.section}` : ''}|${alias ?? oldName}]]`;
  });

  // Back up every existing managed note before any canonical note is updated.
  const guideManifest = join(target, '.tarasibale-guides.json');
  const owned = [...new Set([...rawFiles, ...(existsSync(guideManifest) ? Object.keys(json(guideManifest)) : []), 'graph.canvas'])].filter((name) => existsSync(join(target, name)));
  const retiredNames = new Set(rawFiles.map((file) => file.slice(0, -3)));
  retiredNames.add('graph.canvas');
  const inbound = inboundReferences(vault, new Set(owned.map((name) => join(target, name))), retiredNames, target);
  if (inbound.length) throw new Error(`Personal notes/canvases still reference retiring notes; no notes were moved. Reconcile these links first: ${inbound.slice(0, 12).join('; ')}`);
  let archive;
  if (rawFiles.length) {
    const id = createHash('sha256').update(target).digest('hex').slice(0, 10);
    archive = join(repository, 'graphify-out/obsidian-archive', `${new Date().toISOString().replaceAll(':', '-')}-${id}`);
    mkdirSync(archive, { recursive: true });
    for (const name of [...owned, '.graphify_obsidian_manifest.json', '.tarasibale-guides.json']) {
      if (existsSync(join(target, name))) copyFileSync(join(target, name), join(archive, name));
    }
  }
  const result = publishGuides({ repository, target, vault, extraNotes, transform: (guide) => ({
    ...guide,
    text: rewrite(guide.text + (appendices.has(guide.name.slice(0, -3)) ? `\n\n## Implementation reference\n${appendices.get(guide.name.slice(0, -3))}` : '')),
  }) });
  if (result.preserved.length) throw new Error(`Locally edited canonical notes were preserved. Reconcile these before pruning old notes: ${result.preserved.join(', ')}`);
  // Validate desired note links before removing the granular notes they replace.
  for (const name of noteNames) {
    const text = read(join(target, name));
    for (const [, inner] of text.matchAll(/\[\[([^\]]+)\]\]/g)) {
      const address = inner.split('|')[0].split('#')[0];
      if (!noteNames.has(`${address}.md`) && address !== '00 TaraSibale - Reading Map.canvas') throw new Error(`Unresolved consolidated link in ${name}: ${inner}`);
    }
  }
  // Persist the recovery route before pruning so an interrupted migration can
  // resume after some raw files have already moved into the archive.
  const state = { oldLinks, archive: archive ?? prior.archive, canonicalNotes: [...noteNames].sort(), indexedNodes: graph.nodes.length };
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
  for (const name of rawFiles.filter((name) => !noteNames.has(name))) {
    const source = join(target, name);
    try { renameSync(source, join(archive, name)); }
    catch (error) {
      if (error.code !== 'EXDEV') throw error;
      // A complete copy was made before publication; removing this copy is recoverable.
      unlinkSync(source);
    }
  }
  for (const name of ['graph.canvas', '.graphify_obsidian_manifest.json']) {
    if (state.archive && existsSync(join(target, name))) unlinkSync(join(target, name));
  }
  return { notes: noteNames.size, archived: rawFiles.length, archive: archive ?? prior.archive };
}
