import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export function resolveKnowledgeContext(parts) {
  const combined = { files: {}, symbols: {}, external: {}, shared: {} };
  for (const part of parts) {
    for (const category of Object.keys(combined)) {
      for (const [key, value] of Object.entries(part[category] ?? {})) {
        if (Object.hasOwn(combined[category], key)) throw new Error(`Duplicate context key: ${category}.${key}`);
        combined[category][key] = value;
      }
    }
  }
  const resolve = (value, key) => {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object' || Object.keys(value).length !== 1) throw new Error(`Invalid context reference: ${key}`);
    const text = Object.hasOwn(value, 'fileSummary') ? combined.files[value.fileSummary]?.summary
      : Object.hasOwn(value, 'shared') ? combined.shared[value.shared] : undefined;
    if (typeof text !== 'string') throw new Error(`Unresolved context reference: ${key}`);
    return text;
  };
  return {
    files: combined.files,
    symbols: Object.fromEntries(Object.entries(combined.symbols).map(([key, value]) => [key, resolve(value, key)])),
    external: Object.fromEntries(Object.entries(combined.external).map(([key, value]) => [key, resolve(value, key)])),
  };
}

export function loadKnowledgeContext(repository) {
  const directory = join(repository, 'docs/obsidian-context');
  return resolveKnowledgeContext(readdirSync(directory).filter((name) => name.endsWith('.json')).sort()
    .map((name) => JSON.parse(readFileSync(join(directory, name), 'utf8'))));
}
