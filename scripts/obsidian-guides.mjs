import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const digest = (text) => createHash('sha256').update(text).digest('hex');
const canvasName = '00 TaraSibale - Reading Map.canvas';

export function publishGuides({ repository, target, vault, transform = (guide) => guide, extraNotes = [] }) {
  const sourceDirectory = join(repository, 'docs/obsidian');
  const files = [...readdirSync(sourceDirectory).filter((name) => name.endsWith('.md')), ...extraNotes.map((note) => note.name)].sort();
  const manifestFile = join(target, '.tarasibale-guides.json');
  const previous = existsSync(manifestFile)
    ? JSON.parse(readFileSync(manifestFile, 'utf8')) : {};
  const manifest = { ...previous };
  const preserved = [];
  let written = 0;
  const publish = (name, text) => {
    const output = join(target, name);
    if (existsSync(output)) {
      const current = readFileSync(output, 'utf8');
      if (current !== text && digest(current) !== previous[name]) {
        preserved.push(name);
        return;
      }
    }
    writeFileSync(output, text);
    manifest[name] = digest(text);
    written++;
  };

  // Resolve source citations from their versioned Markdown location, not the
  // exported vault. Validate every citation before publishing any guide.
  const guides = files.map((name) => {
    const extra = extraNotes.find((note) => note.name === name);
    if (extra) return transform(extra);
    const source = join(sourceDirectory, name);
    const text = readFileSync(source, 'utf8').replace(
      /\[([^\]]+)\]\(([^\s)]+)\)/g,
      (match, label, href) => {
        if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('#')) return match;
        const citation = resolve(dirname(source), href);
        if (!existsSync(citation)) throw new Error(`Missing source citation in ${name}: ${href}`);
        return `[${label}](${pathToFileURL(citation).href})`;
      },
    );
    return transform({ name, text });
  });
  for (const guide of guides) publish(guide.name, guide.text);

  const prefix = relative(vault, target).split(sep).join('/');
  const nodes = files.map((name, index) => ({
    id: `guide-${index}`, type: 'file',
    file: [prefix, name].filter(Boolean).join('/'),
    x: (index % 3) * 520, y: Math.floor(index / 3) * 420,
    width: 480, height: 360,
  }));
  const edges = nodes.slice(1).map((node, index) => ({
    id: `read-${index}`, fromNode: nodes[0].id, fromSide: 'bottom',
    toNode: node.id, toSide: 'top', label: 'Read next',
  }));
  publish(canvasName, `${JSON.stringify({ nodes, edges }, null, 2)}\n`);
  writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  return { written, preserved };
}

