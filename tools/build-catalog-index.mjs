import fs from 'node:fs';
import path from 'node:path';
import { legacyNav, legacyFooter } from './legacy-nav.mjs';

const root = 'C:/Users/1/Desktop/MalkoMebel_Concept';
const preview = path.join(root, 'concept-site', 'preview');
const sourceManifest = JSON.parse(fs.readFileSync(path.join(root, 'source-archive', 'open-tabs', 'pasted-batch-manifest.json'), 'utf8'));
const archive = JSON.parse(fs.readFileSync(path.join(preview, 'archive-manifest.json'), 'utf8'));
const esc = (v = '') => String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const imageFor = (title = '') => {
  const value = title.toLowerCase();
  if (value.includes('кух')) return 'images/source/kitchen.jpg';
  if (value.includes('шкаф') || value.includes('двер')) return 'images/source/wardrobe-room.jpg';
  if (value.includes('детск')) return 'images/source/kids.jpg';
  if (value.includes('гардер')) return 'images/source/wardrobe.jpg';
  if (value.includes('стенк')) return 'images/source/living.jpg';
  if (value.includes('прихож')) return 'images/source/hallway.jpg';
  if (value.includes('офис') || value.includes('торгов')) return 'images/source/commercial.jpg';
  return 'images/source/hero-kitchen-2.jpg';
};
const groupOf = (title = '') => {
  const value = title.toLowerCase();
  if (value.includes('кух')) return 'Кухни';
  if (value.includes('шкаф') || value.includes('двер')) return 'Шкафы и перегородки';
  if (value.includes('детск') || value.includes('гардер') || value.includes('стенк') || value.includes('прихож')) return 'Для дома';
  if (value.includes('офис') || value.includes('торгов')) return 'Для бизнеса';
  return 'Материалы';
};
const cards = sourceManifest.files.map((source) => {
  const match = archive.pages.find((page) => page.title.trim() === String(source.title || '').trim());
  return { source, match, group: groupOf(source.title) };
}).filter((x) => x.match);
const groups = [...new Set(cards.map((x) => x.group))];
const markup = groups.map((group) => `<section class="catalog-source-group wrap"><div class="section-head"><div><p class="eyebrow">/ ${esc(group.toLowerCase())}</p><h2>${esc(group)}</h2></div><span class="source-count">${cards.filter((x) => x.group === group).length} страниц</span></div><div class="source-catalog-grid">${cards.filter((x) => x.group === group).map(({ source, match }) => `<a class="source-catalog-card" href="./${match.file}"><img loading="lazy" src="./${imageFor(source.title)}" alt="${esc(source.headings?.[0] || source.title)}"><div><strong>${esc(source.headings?.[0] || source.title)}</strong><small>${esc(source.title)}</small><p>${esc((source.paragraphs?.[0] || '').slice(0, 190))}</p></div></a>`).join('')}</div></section>`).join('');
const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Каталог | Малко-Мебель</title><link rel="stylesheet" href="./styles.css"></head><body>${legacyNav('./')}<main><section class="wrap catalog-intro"><p class="eyebrow">/ каталог</p><h1 class="display">Мебель<br><em>на заказ</em></h1><p class="lead-dark">Изготовление мебели на заказ для квартир, домов, офисов и торговых помещений.</p><div class="cards"><a class="card card-wide" href="./archive.html?query=Кухни"><img src="./images/source/latest-kitchen.png" alt="Кухни"><div><b>Кухни</b><span>Мебель на заказ</span></div></a><a class="card" href="./archive.html?query=Шкафы-купе"><img src="./images/source/wardrobe.jpg" alt="Шкафы-купе"><div><b>Шкафы-купе</b><span>Мебель на заказ</span></div></a><a class="card" href="./archive.html?query=Раздвижные перегородки"><img src="./images/source/partition.jpg" alt="Раздвижные перегородки и двери"><div><b>Раздвижные перегородки и двери</b><span>Мебель на заказ</span></div></a><a class="card" href="./archive.html?query=Стенки"><img src="./images/source/living.jpg" alt="Стенки и горки"><div><b>Стенки / горки</b><span>Мебель на заказ</span></div></a><a class="card" href="./archive.html?query=Детские"><img src="./images/source/kids.jpg" alt="Детские"><div><b>Детские</b><span>Мебель на заказ</span></div></a><a class="card" href="./archive.html?query=Торговая мебель"><img src="./images/source/commercial.jpg" alt="Торговая мебель"><div><b>Торговая мебель</b><span>Мебель на заказ</span></div></a></div></section>${markup}</main>${legacyFooter('./')}<script src="./app.js"></script></body></html>`;
fs.writeFileSync(path.join(preview, 'catalog.html'), html);
console.log(JSON.stringify({ sourceCards: cards.length, groups }, null, 2));
