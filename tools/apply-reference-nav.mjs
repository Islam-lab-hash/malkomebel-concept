import fs from 'node:fs';
import path from 'node:path';
import { legacyNav } from './legacy-nav.mjs';

const root = 'C:/Users/1/Desktop/MalkoMebel_Concept/concept-site/preview';
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : (entry.name.endsWith('.html') ? [full] : []);
});

let changed = 0;
for (const file of walk(root)) {
  let html = fs.readFileSync(file, 'utf8');
  const relativeDir = path.relative(root, path.dirname(file)).replaceAll('\\', '/');
  const depth = relativeDir ? relativeDir.split('/').length : 0;
  const prefix = '../'.repeat(depth);
  const next = html.replace(/<header class="site-head">[\s\S]*?<\/header>/, legacyNav(prefix));
  if (next !== html) {
    fs.writeFileSync(file, next);
    changed += 1;
  }
}

console.log(`Updated reference navigation in ${changed} pages`);
