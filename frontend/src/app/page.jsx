import { MainPage } from "../features/LandingPage/MainPage";
import { getCategories } from "../lib/categories";

export const metadata = {
  title: "Купити ПК, ноутбуки або комплектуючі для ПК дуже зручно та вигідно | Інтернет-магазин цифрової техніки | Voltio",
  description: "Інтернет-магазин цифрової техніки: ігровий комп'ютер, ноутбук, комплектуючі для ПК. Доставка по всій Україні та офіційна гарантія",
};

export default async function Page() {
  const categories = await getCategories();
  return <MainPage categories={categories} />;
}
