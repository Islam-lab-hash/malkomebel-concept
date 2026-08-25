import fs from 'node:fs';
import path from 'node:path';

const dir = 'C:/Users/1/Desktop/MalkoMebel_Concept/concept-site/preview';
const files = fs.readdirSync(dir).filter((name) => name.endsWith('.html') && name !== 'archive.html');
const nav = '<nav><a href="/catalog.html">Каталог</a><a href="/materials.html">Материалы</a><a href="/services.html">Услуги</a><a href="/prices.html">Цены</a><a href="/archive.html">Все страницы</a><a href="/contacts.html">Контакты</a></nav>';
for (const name of files) {
  const file = path.join(dir, name);
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<nav>[\s\S]*?<\/nav>/, nav);
  html = html.replace(/(<a class="brand"[^>]*>)<button class="menu"[^>]*>Меню <i><\/i><\/button>/, '$1');
  if (!html.includes('class="menu"')) html = html.replace(/(<a class="brand"[^>]*>.*?<\/a>)/s, '$1<button class="menu" aria-label="Открыть меню">Меню <i></i></button>');
  if (!html.includes('<script src="/app.js"></script>')) html = html.replace('</body>', '<script src="/app.js"></script></body>');
  fs.writeFileSync(file, html);
}
console.log(`Updated ${files.length} core pages`);
