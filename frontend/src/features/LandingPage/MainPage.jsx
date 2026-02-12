import { MainBanner } from "./Banner/Banner";
import { Categories } from "./Categories/Categories";

export function MainPage({ categories }) {
  return (
    <>
      <MainBanner />
      {categories && categories.length > 0 && (
        <Categories categories={categories} />
      )}
    </>
  );
}
