import fs from 'node:fs';
import path from 'node:path';

const root = 'C:/Users/1/Desktop/MalkoMebel_Concept';
const outDir = path.join(root, 'source-archive', 'open-tabs');
const attachmentDir = 'C:/Users/1/.codex/attachments';
const ids = [
  'a8b21972-8372-4b9c-a278-e6df256a679b', '0af293fc-b75f-474f-8afb-6a74517f86a1',
  '5833f2e5-79a5-4d8d-bb68-01f32b11c9dd', '73e4e8bb-9f60-4fc6-ae33-940361b909b0',
  'f32e4a39-91bb-4721-b77d-ef1262e8297f', '5b4d0c75-2231-4bc3-b26c-ce49b1c2bb20',
  'e07a87f1-3719-4e45-b759-7f9c1e0506a3', '6a4f121c-fef1-45d9-ad4e-52351acec698',
  'ed628a23-1cb7-48bd-8380-0c7b1222c101', '9c6a71eb-ad0d-4c01-aa0d-ef53176833be',
  'ebb5fa9d-bc35-4918-a045-a8ed366517c3', '79ff9a18-740a-4503-be44-2ea967a4b4cb',
  'e2f03417-31a3-485c-b40c-00aef3e3da06', '8c8a6e48-680c-41f8-9661-91781a88d66d',
  '5c568b1d-dd86-4e2b-815e-71b5cee93812', '52312023-af25-48e4-8e1a-1ee1d59658ec',
  'a6326d7e-448a-4f9f-b905-5469f2c36ab3', '2747b832-965a-4558-9c27-e56b7c025b2b',
  '25a1178f-7f5c-48bd-959b-41d404d61f86', '8fd2d8a6-e0cc-4698-9942-797aa6ec4152',
  '449bcbd6-b77a-4b1d-8cb6-fced0a9ed88c', 'a0d26e2a-4c46-4661-8ddf-acffc29d9f2d',
  '94ecfaef-f41b-45f2-9ea9-635794ec1066', '33c6d7fa-351c-4bfd-9101-58f6e90ad98e',
  '17d7ded9-aafa-4393-8301-78444778e3fc', '90feee51-6c0d-4752-a5a6-ac915510d90b',
  'fd46625a-8352-4df1-80e1-a003f0140a70', '74fc29ec-928f-40d9-8a0c-33d78c7726f1',
];
const strip = (html = '') => html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/\s+/g, ' ').trim();
const titleOf = (html) => strip(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
const canonicalOf = (html) => html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] || html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)/i)?.[1] || '';
const textOf = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi'))].map((m) => strip(m[1])).filter(Boolean);
const linksOf = (html) => [...html.matchAll(/<a\b[^>]*href=(?:"([^"]*)"|'([^']*)')[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => ({ href: m[1] || m[2] || '', text: strip(m[3]) })).filter((x) => x.href || x.text);
const imagesOf = (html) => [...html.matchAll(/<img\b[^>]*src=(?:"([^"]*)"|'([^']*)')[^>]*>/gi)].map((m) => m[1] || m[2]).filter(Boolean);
fs.mkdirSync(outDir, { recursive: true });
const manifest = [];
ids.forEach((id, index) => {
  const source = path.join(attachmentDir, id, 'pasted-text.txt');
  if (!fs.existsSync(source)) return;
  const html = fs.readFileSync(source, 'utf8');
  const title = titleOf(html) || `Паста ${index + 1}`;
  const copiedName = `${String(index + 5).padStart(2, '0')}-${id}.html`;
  fs.copyFileSync(source, path.join(outDir, copiedName));
  const links = linksOf(html);
  const nav = links.filter((x) => /мебель на заказ|выбор материалов|услуги|цены|конструктор|заявка|отзывы|контакты|кухн|шкаф|лдсп|egger|kronospan|доставка|ремонт/i.test(`${x.text} ${x.href}`)).slice(0, 120);
  const social = links.filter((x) => /whatsapp|t\.me|telegram|vk\.com|max\.ru|mailto:|tel:/i.test(x.href));
  manifest.push({ index: index + 5, file: copiedName, sourceAttachment: source, title, canonical: canonicalOf(html), bytes: Buffer.byteLength(html), headings: [...textOf(html, 'h1'), ...textOf(html, 'h2'), ...textOf(html, 'h3')].slice(0, 12), paragraphs: textOf(html, 'p').filter((x) => x.length > 20).slice(0, 12), listItems: textOf(html, 'li').filter((x) => x.length > 2 && x.length < 220).slice(0, 20), nav, social, imageCount: imagesOf(html).length, images: imagesOf(html).slice(0, 30) });
});
fs.writeFileSync(path.join(outDir, 'pasted-batch-manifest.json'), JSON.stringify({ source: 'user-provided pasted HTML', generatedAt: new Date().toISOString(), count: manifest.length, files: manifest }, null, 2));
fs.writeFileSync(path.join(outDir, 'pasted-batch-summary.md'), `# Разбор переданных исходников\n\nСохранено файлов: ${manifest.length}\n\n| № | Title | H1 | Изображения |\n|---:|---|---|---:|\n${manifest.map((x) => `| ${x.index} | ${x.title.replaceAll('|', '\\|')} | ${(x.headings[0] || '').replaceAll('|', '\\|')} | ${x.imageCount} |`).join('\\n')}\n`);
console.log(JSON.stringify({ saved: manifest.length, outDir, files: manifest.map((x) => ({ index: x.index, file: x.file, title: x.title, bytes: x.bytes, imageCount: x.imageCount })) }, null, 2));
