import { ProductDetailPage } from "../../../features/ProductDetailPage/ProductDetailPage";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const baseUrl = process.env.BASE_INTERNAL_API_URL;

  try {
    const res = await fetch(`${baseUrl}/api/products/${slug}/`, {
      next: { revalidate: 60 * 30 },
    });
    if (res.ok) {
      const product = await res.json();
      return {
        title: `${product.name} - NextShop`,
        description: product.description,
      };
    }
  } catch (error) {
    console.error("Error fetching product for metadata:", error);
  }
}

export default async function Page({ params }) {
  const { slug } = await params;
  const baseUrl = process.env.BASE_INTERNAL_API_URL;
  let product = null;

  try {
    const res = await fetch(`${baseUrl}/api/products/${slug}/`, {
      next: { revalidate: 60 * 30 },
    });
    if (res.ok) {
      product = await res.json();
    }
  } catch (error) {
    console.error("Error fetching product:", error);
  }
  return <ProductDetailPage product={product} />;
}
