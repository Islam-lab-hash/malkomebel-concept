const NAV_ITEMS = [
  ['Мебель на заказ', true],
  ['Выбор материалов', true],
  ['Услуги', true],
  ['Цены', false],
  ['Конструктор', false],
  ['Заявка', false],
  ['Отзывы', false],
  ['Контакты', false],
];

const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');

/**
 * Reference navigation only. The labels are intentionally buttons with no
 * destination yet; subsection routes will be wired in a later pass.
 */
export const legacyNav = (prefix = './') => {
  const items = NAV_ITEMS.map(([label, hasSubsections]) => `<button class="nav-item${hasSubsections ? ' nav-parent' : ''}" type="button" data-section="${esc(label)}"${hasSubsections ? ' aria-expanded="false"' : ''}>${esc(label)}${hasSubsections ? '<i aria-hidden="true"></i>' : ''}</button>`).join('');
  return `<header class="site-head"><a class="brand" href="${prefix}">МАЛКО<span>МЕБЕЛЬ</span></a><button class="menu" aria-label="Открыть меню">Меню <i></i></button><nav class="reference-nav" aria-label="Основная навигация">${items}</nav><a class="phone" href="tel:+79185106999">+7 (918) 510-69-99</a></header>`;
};

export const legacyFooter = () => `<footer><span>© Малко-Мебель 2013–2026</span><span>Мебель на заказ в Ростове-на-Дону</span></footer>`;
