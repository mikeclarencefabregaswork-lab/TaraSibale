import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { consolidateVault } from './obsidian-consolidate.mjs';

const target = resolve(process.argv[2] ?? 'graphify-out/obsidian');
let vault = target;
for (let parent = dirname(target); parent !== dirname(parent); parent = dirname(parent)) {
  if (existsSync(join(parent, '.obsidian'))) {
    vault = parent;
    break;
  }
}
mkdirSync(target, { recursive: true });
if (vault === target) mkdirSync(join(target, '.obsidian'), { recursive: true });
const repository = fileURLToPath(new URL('../', import.meta.url));
const result = consolidateVault({ repository, target, vault });
console.log(`Published ${result.notes} canonical notes; archived ${result.archived} granular notes outside the vault.`);
if (result.archive) console.log(`Recoverable originals: ${result.archive}`);
