import { OrderDetailPage } from "../../../features/OrderDetailPage/OrderDetailPage";

export const metadata = { title: "Деталі замовлення" };

export default async function Page({ params }) {
  const { orderCode } = await params;
  return <OrderDetailPage orderCode={orderCode} />;
}
