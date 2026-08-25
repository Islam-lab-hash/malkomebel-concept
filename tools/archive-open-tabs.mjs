import fs from 'node:fs';
import path from 'node:path';

const root = 'C:/Users/1/Desktop/MalkoMebel_Concept';
const outDir = path.join(root, 'source-archive', 'open-tabs');
const inputs = [
  { file: '01-konstruktor.html', source: 'C:/Users/1/.codex/attachments/8684a20c-dd81-46ad-9ccd-34f7b7f49fa7/pasted-text.txt' },
  { file: '02-zayavka.html', source: 'C:/Users/1/.codex/attachments/fcb45905-235e-493f-89d9-d353e4692386/pasted-text.txt' },
  { file: '03-otzyvy.html', source: 'C:/Users/1/.codex/attachments/3be12237-2704-467b-8585-c9128e9e1c10/pasted-text.txt' },
  { file: '04-kontakty.html', source: 'C:/Users/1/.codex/attachments/028a216c-b66b-49f7-b215-eaacee91d1d0/pasted-text.txt' },
];
const strip = (html = '') => html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim();
const titleOf = (html) => strip(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
const linksOf = (html) => [...html.matchAll(/<a\b[^>]*href=(?:"([^"]*)"|'([^']*)')[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => ({ href: m[1] || m[2] || '', text: strip(m[3]) })).filter((x) => x.href && x.text);
fs.mkdirSync(outDir, { recursive: true });
const manifest = [];
for (const item of inputs) {
  if (!fs.existsSync(item.source)) continue;
  const html = fs.readFileSync(item.source, 'utf8');
  const copied = path.join(outDir, item.file);
  fs.copyFileSync(item.source, copied);
  const links = linksOf(html);
  const nav = links.filter((x) => ['Мебель на заказ', 'Выбор материалов', 'Услуги', 'Цены', 'Конструктор', 'Заявка', 'Отзывы', 'Контакты', 'Кухни', 'Шкафы-купе', 'ЛДСП', 'Egger', 'Kronospan'].some((label) => x.text.includes(label))).slice(0, 80);
  const social = links.filter((x) => /whatsapp|t\.me|telegram|vk\.com|max\.ru|malkomebel/i.test(x.href));
  manifest.push({ file: item.file, sourceAttachment: item.source, title: titleOf(html), bytes: Buffer.byteLength(html), nav, social });
}
fs.writeFileSync(path.join(outDir, 'open-tabs-manifest.json'), JSON.stringify({ source: 'user-provided pasted HTML', generatedAt: new Date().toISOString(), files: manifest }, null, 2));
console.log(JSON.stringify({ saved: manifest.length, outDir, files: manifest.map((x) => ({ file: x.file, title: x.title, bytes: x.bytes })) }, null, 2));
