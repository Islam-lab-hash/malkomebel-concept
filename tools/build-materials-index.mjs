import fs from 'node:fs';
import path from 'node:path';
import { legacyNav, legacyFooter } from './legacy-nav.mjs';

const root = 'C:/Users/1/Desktop/MalkoMebel_Concept';
const preview = path.join(root, 'concept-site', 'preview');
const sourceManifest = JSON.parse(fs.readFileSync(path.join(root, 'source-archive', 'open-tabs', 'pasted-batch-manifest.json'), 'utf8'));
const archive = JSON.parse(fs.readFileSync(path.join(preview, 'archive-manifest.json'), 'utf8'));
const esc = (v = '') => String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const materialSources = sourceManifest.files.filter((x) => /лдсп|egger|ламин/i.test(x.title));
const cards = materialSources.map((source, i) => {
  const match = archive.pages.find((page) => page.title.trim() === String(source.title || '').trim());
  if (!match) return '';
  const image = i === 0 ? 'images/brands/1.jpg' : 'images/brands/2.jpg';
  return `<a class="source-catalog-card" href="./${match.file}"><img loading="lazy" src="./${image}" alt="${esc(source.headings?.[0] || source.title)}"><div><strong>${esc(source.headings?.[0] || source.title)}</strong><small>${esc(source.title)}</small></div></a>`;
}).join('');
const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Материалы и фурнитура | Малко-Мебель</title><link rel="stylesheet" href="./styles.css"></head><body>${legacyNav('./')}<main><section class="wrap"><p class="eyebrow">/ материалы и фурнитура</p><h1 class="display">Материалы<br><em>и фурнитура</em></h1><div class="brand-track"><img src="./images/brands/1.jpg" alt=""><img src="./images/brands/2.jpg" alt=""><img src="./images/brands/3.jpg" alt=""><img src="./images/brands/4.png" alt=""><img src="./images/brands/5.jpg" alt=""><img src="./images/brands/6.jpg" alt=""><img src="./images/brands/7.png" alt=""><img src="./images/brands/8.png" alt=""><img src="./images/brands/9.png" alt=""><img src="./images/brands/10.png" alt=""></div></section><section class="catalog-source-group wrap"><div class="section-head"><div><p class="eyebrow">/ исходные каталоги</p><h2>ЛДСП и Egger</h2></div><span class="source-count">${materialSources.length} страницы</span></div><div class="source-catalog-grid">${cards}</div></section></main>${legacyFooter('./')}<script src="./app.js"></script></body></html>`;
fs.writeFileSync(path.join(preview, 'materials.html'), html);
console.log(JSON.stringify({ materialCards: materialSources.length }, null, 2));
