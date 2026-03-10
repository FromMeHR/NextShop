import { OrderDetailPage } from "../../../features/OrderDetailPage/OrderDetailPage";

export const metadata = { title: "Деталі замовлення | Voltio" };

export default async function Page({ params }) {
  const { orderCode } = await params;
  return <OrderDetailPage orderCode={orderCode} />;
}
