import fs from 'node:fs';
import path from 'node:path';

const root = 'C:/Users/1/Desktop/MalkoMebel_Concept';
const preview = path.join(root, 'concept-site', 'preview');
const reportPath = path.join(root, 'source-archive', 'reports', 'pages.json');
const records = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const archiveDir = path.join(preview, 'archive-pages');
fs.mkdirSync(archiveDir, { recursive: true });

const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');

const nav = `<header class="site-head"><a class="brand" href="/">МАЛКО<span>МЕБЕЛЬ</span></a><button class="menu" aria-label="Открыть меню">Меню <i></i></button><nav><a href="/catalog.html">Каталог</a><a href="/materials.html">Материалы</a><a href="/services.html">Услуги</a><a href="/prices.html">Цены</a><a href="/archive.html">Все страницы</a><a href="/contacts.html">Контакты</a></nav><a class="phone" href="tel:+79185106999">+7 (918) 510-69-99</a></header>`;
const footer = `<footer><span>© Малко-Мебель 2013–2026</span><span>Мебель на заказ в Ростове-на-Дону · <a href="/privacy.html">Политика</a></span></footer>`;
const imageFor = (url = '', title = '') => {
  const value = `${url} ${title}`.toLowerCase();
  if (value.includes('кух') || value.includes('фасад')) return '/images/source/kitchen.jpg';
  if (value.includes('детск')) return '/images/source/kids.jpg';
  if (value.includes('гардер') || value.includes('шкаф')) return '/images/source/wardrobe-room.jpg';
  if (value.includes('перегород') || value.includes('двер')) return '/images/source/partition.jpg';
  if (value.includes('офис') || value.includes('торгов')) return '/images/source/commercial.jpg';
  if (value.includes('прихож')) return '/images/source/hallway.jpg';
  if (value.includes('спаль')) return '/images/source/bedroom.jpg';
  return '/images/source/hero-kitchen-2.jpg';
};
const categoryOf = (url = '') => {
  const pathname = new URL(url).pathname.replace(/^\//, '');
  return pathname.split('/')[0] || 'главная';
};
const slug = (record, index) => {
  const base = (record.file || record.url || `page-${index + 1}`)
    .replace(/^pages\//, '').replace(/\/index\.html$/, '').replace(/\.html$/, '')
    .replace(/[^a-zA-Z0-9а-яА-Я_-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'home';
  return `${String(index + 1).padStart(4, '0')}-${base}`;
};

const output = [];
for (const [index, record] of records.entries()) {
  const fileSlug = slug(record, index);
  const title = record.title || record.h1?.[0] || record.url;
  const heading = record.h1?.[0] || title;
  const paragraphs = (record.paragraphs || []).filter(Boolean).slice(0, 6);
  const headings = (record.headings || []).filter(Boolean).slice(0, 12);
  const bullets = (record.listItems || []).filter((item) => item && item.length < 180).slice(0, 12);
  const body = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Малко-Мебель</title><meta name="description" content="${esc(record.description || title)}"><link rel="stylesheet" href="/styles.css"></head><body>${nav}<main><section class="archive-hero wrap"><p class="eyebrow">/ исходная страница ${String(index + 1).padStart(4, '0')}</p><h1 class="display">${esc(heading)}</h1><p class="lead-dark">${esc(record.description || 'Мебель на заказ в Ростове-на-Дону.')}</p><a class="under" href="${esc(record.url)}" target="_blank" rel="noreferrer">Открыть оригинал <span>↗</span></a></section><section class="archive-detail wrap"><div class="archive-media"><img src="${imageFor(record.url, title)}" alt="${esc(heading)}"></div><div class="archive-copy"><p class="eyebrow">/ содержание</p>${paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}${headings.length ? `<h2>Разделы страницы</h2><ul class="source-list">${headings.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : ''}${bullets.length ? `<h2>Навигация и пункты</h2><ul class="source-list compact">${bullets.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : ''}</div></section><section class="archive-meta wrap"><p class="eyebrow">/ источник</p><p><strong>URL:</strong> <a href="${esc(record.url)}" target="_blank" rel="noreferrer">${esc(record.url)}</a></p><p><strong>Категория:</strong> ${esc(categoryOf(record.url))}</p><a class="button dark" href="/archive.html">Вернуться ко всем страницам</a></section></main>${footer}<script src="/app.js"></script></body></html>`;
  fs.writeFileSync(path.join(archiveDir, `${fileSlug}.html`), body);
  output.push({ index: index + 1, file: `archive-pages/${fileSlug}.html`, url: record.url, title, category: categoryOf(record.url) });
}

const groups = new Map();
for (const item of output) {
  if (!groups.has(item.category)) groups.set(item.category, []);
  groups.get(item.category).push(item);
}
const groupMarkup = [...groups.entries()].sort((a, b) => b[1].length - a[1].length).map(([category, items]) => `<section class="archive-group" data-category="${esc(category)}"><div class="archive-group-head"><h2>${esc(category)}</h2><span>${items.length} страниц</span></div><div class="archive-list">${items.map((item) => `<a href="/${item.file}" data-search="${esc(`${item.title} ${item.url} ${item.category}`.toLowerCase())}"><span>${String(item.index).padStart(4, '0')}</span><strong>${esc(item.title)}</strong><small>${esc(item.url)}</small></a>`).join('')}</div></section>`).join('');
const archivePage = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Все страницы | Малко-Мебель</title><link rel="stylesheet" href="/styles.css"></head><body>${nav}<main><section class="archive-hero wrap"><p class="eyebrow">/ карта исходного сайта</p><h1 class="display">Все страницы<br><em>в одном месте</em></h1><p class="lead-dark">${records.length} публичных страниц исходного сайта. Каждая сохранена отдельным маршрутом в переработанном интерфейсе, с исходным заголовком, текстом и ссылкой на оригинал.</p><label class="archive-search"><span>Поиск по страницам</span><input id="archive-search" type="search" placeholder="Кухни, шкафы, материалы..."></label></section><section class="archive-summary wrap"><div><strong>${records.length}</strong><span>HTML-страниц</span></div><div><strong>${groups.size}</strong><span>разделов</span></div><div><strong>5 910</strong><span>исходных ассетов в архиве</span></div></section><section class="archive-content wrap" id="archive-content">${groupMarkup}</section></main>${footer}<script src="/app.js"></script></body></html>`;
fs.writeFileSync(path.join(preview, 'archive.html'), archivePage);
fs.writeFileSync(path.join(preview, 'archive-manifest.json'), JSON.stringify({ source: 'https://malkomebel.ru', count: output.length, generatedAt: new Date().toISOString(), pages: output }, null, 2));
console.log(JSON.stringify({ generatedPages: output.length, groups: groups.size, archiveDir }, null, 2));
