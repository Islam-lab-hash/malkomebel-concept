import fs from 'node:fs';
import path from 'node:path';
import { legacyNav, legacyFooter } from './legacy-nav.mjs';

const dir = 'C:/Users/1/Desktop/MalkoMebel_Concept/concept-site/preview';
const files = fs.readdirSync(dir).filter((name) => name.endsWith('.html') && name !== 'archive.html');
for (const name of files) {
  const file = path.join(dir, name);
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<header class="site-head">[\s\S]*?<\/header>/, legacyNav('./'));
  html = html.replace(/<footer>[\s\S]*?<\/footer>/, legacyFooter('./'));
  html = html.replaceAll('href="/', 'href="./').replaceAll('src="/', 'src="./');
  html = html.replaceAll('<script src="/app.js"></script>', '');
  if (!html.includes('<script src="./app.js"></script>')) html = html.replace('</body>', '<script src="./app.js"></script></body>');
  fs.writeFileSync(file, html);
}
console.log(`Updated ${files.length} core pages`);
