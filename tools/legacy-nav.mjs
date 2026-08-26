const SOCIALS = [
  ['WA', 'WhatsApp', 'whatsapp://send/?phone=79185106999', 'whatsapp.svg'],
  ['MAX', 'Max', 'https://max.ru/u/f9LHodD0cOLWEHnLTOSeadpYo25q7dHiAATFOq5tytlpwu6WdYVpgsUxs3g', 'max.svg'],
  ['TG', 'Telegram', 'https://t.me/malkomeb', 'telegram.png'],
  ['VK', 'VK', 'https://vk.com/malkomebel', 'vk.png'],
];

const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const href = (prefix, file, query = '') => `${prefix}${file}${query ? `?query=${encodeURIComponent(query)}` : ''}`;
const item = (prefix, label, query = '') => `<a href="${href(prefix, 'archive.html', query || label)}">${esc(label)}</a>`;

const orderItems = [
  'Кухни', 'Шкафы-купе', 'Встроенные шкафы-купе', 'Шкафы распашные',
  'Раздвижные перегородки и двери', 'Детские', 'Гардеробные', 'Стенки, горки',
  'Прихожие', 'Офисная мебель', 'Торговая мебель',
];
const kitchenItems = [
  'Все кухни на заказ', 'Кухни из массива дерева', 'Кухни из шпона', 'Кухни "Италия"',
  'Кухни МДФ с наборным фасадом (под дерево)', 'Кухни "под потолок"', 'Кухни из МДФ крашеного',
  'Кухни из МДФ пленочного', 'Кухни МДФ-пластик', 'Кухни - МДФ рамочный', 'Кухни с гнутыми фасадами',
  'Кухни с фотопечатью', 'Кухни с росписью', 'Кухни с каменными столешницами',
];
const materialColumns = [
  { title: 'ЛДСП', items: ['ЛДСП, обзор', 'Egger', 'Kronospan', 'Невский Ламинат', 'Русский Ламинат'] },
  { title: 'Для кухонь', items: ['Материалы и фурнитура для кухонь, обзор', 'Столешницы', 'Столешницы из искусственного камня', 'Витражи для кухонь', 'Фартуки из закалённого стекла с фотопечатью'] },
  { title: 'Для шкафов', items: ['Материалы и фурнитура для шкафов, обзор', 'Профили для шкафов-купе', 'Зеркала', 'Витражи для шкафов-купе', 'Витражи в двери и ниши', 'Пескоструйка', 'Фотопечать', 'Цветные стекла'] },
];

const socials = (prefix = './') => SOCIALS.map(([short, label, url, asset]) => `<a class="social-link" href="${url}" target="_blank" rel="noreferrer" aria-label="${label}"><img src="${prefix}images/social/${asset}" alt=""><b>${short}</b><span>${label}</span></a>`).join('');
const group = (label, prefix, content, target = 'catalog.html') => `<div class="nav-group"><button class="nav-parent" type="button" aria-expanded="false">${esc(label)}<span aria-hidden="true">⌄</span></button><div class="nav-dropdown">${content}<a class="nav-overview" href="${href(prefix, target)}">Открыть раздел ↗</a></div></div>`;

export const legacyNav = (prefix = './') => {
  const orderMenu = `<div class="nav-columns"><div class="nav-column">${orderItems.map((x) => item(prefix, x)).join('')}</div><div class="nav-column nav-column-emphasis">${kitchenItems.map((x) => item(prefix, x)).join('')}</div></div>`;
  const materialMenu = `<div class="nav-columns materials-columns">${materialColumns.map((column) => `<div class="nav-column"><strong>${esc(column.title)}</strong>${column.items.map((x) => item(prefix, x)).join('')}</div>`).join('')}</div>`;
  const servicesMenu = `<div class="nav-column">${['Доставка, сборка и установка', 'Ремонт мебели'].map((x) => item(prefix, x)).join('')}</div>`;
  return `<header class="site-head"><div class="site-topline"><span>Ростов-на-Дону · Батайск · Аксай</span><span>Мебель на заказ с 2013 года</span><div class="site-socials">${socials(prefix)}</div></div><div class="site-nav-row"><a class="brand" href="${prefix}">МАЛКО<span>МЕБЕЛЬ</span></a><button class="menu" aria-label="Открыть меню">Меню <i></i></button><nav class="legacy-nav" aria-label="Основная навигация">${group('Мебель на заказ', prefix, orderMenu)}${group('Выбор материалов', prefix, materialMenu, 'materials.html')}${group('Услуги', prefix, servicesMenu, 'services.html')}<a class="nav-direct" href="${href(prefix, 'prices.html')}">Цены</a><a class="nav-direct" href="${href(prefix, 'constructor.html')}">Конструктор</a><a class="nav-direct" href="${href(prefix, 'request.html')}">Заявка</a><a class="nav-direct" href="${href(prefix, 'reviews.html')}">Отзывы</a><a class="nav-direct" href="${href(prefix, 'contacts.html')}">Контакты</a></nav><a class="phone" href="tel:+79185106999">+7 (918) 510-69-99</a></div></header>`;
};

export const legacyFooter = (prefix = './') => `<footer><div><span>© Малко-Мебель 2013–2026</span><span>Мебель на заказ в Ростове-на-Дону · <a href="${href(prefix, 'privacy.html')}">Политика</a> · <a href="${href(prefix, 'archive.html')}">Карта страниц</a></span></div><div class="footer-socials">${socials(prefix)}</div></footer>`;
