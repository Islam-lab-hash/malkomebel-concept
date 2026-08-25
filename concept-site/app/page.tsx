import Image from "next/image";
import Link from "next/link";

const categories = [
  { title: "Кухни", href: "/catalog/kuhni" },
  { title: "Шкафы-купе", href: "/catalog/shkafy-kupe" },
  { title: "Шкафы распашные", href: "/catalog/shkafy-raspashnye" },
  { title: "Гардеробные", href: "/catalog/garderobnye" },
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <Image
          className="hero__image"
          src="/images/source/hero-kitchen.jpg"
          alt="Кухонный гарнитур с фасадом МДФ"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero__shade" />
        <header className="site-header shell">
          <Link className="brand" href="/" aria-label="Малко-Мебель, главная">
            <span>МАЛКО</span>
            <small>МЕБЕЛЬ</small>
          </Link>
          <nav aria-label="Основная навигация">
            <Link href="/catalog">Мебель на заказ</Link>
            <Link href="/materials">Материалы</Link>
            <Link href="/services">Услуги</Link>
            <Link href="/prices">Цены</Link>
            <Link href="/contacts">Контакты</Link>
          </nav>
          <a className="header-phone" href="tel:+79185106999">
            +7 (918) 510-69-99
          </a>
        </header>

        <div className="hero__content shell">
          <p className="eyebrow">Мебель на заказ · Ростов-на-Дону</p>
          <h1>МАЛКО<br />МЕБЕЛЬ</h1>
          <div className="hero__bottom">
            <p>
              Изготовление мебели на заказ для квартир, домов, офисов и
              торговых помещений.
            </p>
            <div className="hero__actions">
              <Link className="button button--light" href="/catalog">Смотреть работы</Link>
              <Link className="button button--ghost" href="/request">Вызвать замерщика</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="category-bar shell" aria-label="Категории мебели">
        {categories.map((category, index) => (
          <Link href={category.href} key={category.href}>
            <span>0{index + 1}</span>
            <strong>{category.title}</strong>
            <b aria-hidden="true">↗</b>
          </Link>
        ))}
      </section>

      <section className="intro shell">
        <p className="section-index">01 / Мебель на заказ</p>
        <h2>Мебель для квартиры, дома, офиса и торговых помещений.</h2>
        <p className="intro__copy">
          Работаем по Ростову-на-Дону, Батайску, Аксаю, выезжаем по
          Ростовской области.
        </p>
      </section>
    </main>
  );
}
