import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Малко-Мебель | Мебель на заказ в Ростове-на-Дону",
  description:
    "Изготовление мебели на заказ для квартир, домов, офисов и торговых помещений.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
