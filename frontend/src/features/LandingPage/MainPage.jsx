import { MainBanner } from "./Banner/Banner";
import { Products } from "./Products/Products";

export function MainPage({ data, page, pageSize }) {
  return (
    <>
      <MainBanner />
      <Products data={data} page={page} pageSize={pageSize} />
    </>
  );
}
