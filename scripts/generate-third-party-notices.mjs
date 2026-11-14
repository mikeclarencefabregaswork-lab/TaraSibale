import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const visited = new Set();
const sections = [];
function visit(name, parent = root) {
  let directory = parent;
  let packageDirectory;
  while (true) {
    const candidate = join(directory, 'node_modules', name);
    if (existsSync(join(candidate, 'package.json'))) { packageDirectory = candidate; break; }
    const next = dirname(directory);
    if (next === directory) throw new Error(`Cannot locate runtime package ${name}`);
    directory = next;
  }
  const metadata = JSON.parse(readFileSync(join(packageDirectory, 'package.json'), 'utf8'));
  const key = `${metadata.name}@${metadata.version}`;
  if (visited.has(key)) return;
  visited.add(key);
  const files = readdirSync(packageDirectory).filter(file => /^(licen[sc]e|copying|notice)(\.|$)/i.test(file));
  if (!files.length) throw new Error(`No license notice found for ${key}; review before distributing.`);
  sections.push(`${key}\nDeclared license: ${metadata.license || 'See license text'}\n\n` + files.sort().map(file => `${file}\n${readFileSync(join(packageDirectory, file), 'utf8')}`).join('\n'));
  for (const dependency of Object.keys(metadata.dependencies || {})) visit(dependency, packageDirectory);
}
// Frontend runtime entry points; their installed runtime dependencies are included recursively.
for (const name of ['react', 'react-dom', 'leaflet', 'lucide-react', 'motion']) visit(name);
writeFileSync(join(root, 'Frontend/public/THIRD_PARTY_NOTICES.txt'), 'TaraSibale third-party frontend runtime notices\nGenerated from installed packages; preserve with distributed builds.\nFood-photo credits are displayed individually in the Culture section.\n\n' + sections.sort().join('\n\n' + '='.repeat(72) + '\n\n'));
console.log(`Generated notices for ${visited.size} runtime packages.`);
