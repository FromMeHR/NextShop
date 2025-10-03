import { notFound } from "next/navigation";

export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }];
}

export default async function sitemap({ id }) {
  if (id === "0") {
    const routes = [
      "",
    ];
    return routes.map((route) => ({
      url: `${process.env.NEXT_PUBLIC_URL}/${route}`,
      lastModified: new Date().toISOString().split("T")[0],
      priority: 1,
    }));
  }
  const validIds = ["1", "2", "3"];
  if (!validIds.includes(id)) {
    return notFound();
  }
  const start = (id - 1) * 50000;
  const end = start + 50000;
  try {
    const res = await fetch(
      `${process.env.BASE_INTERNAL_API_URL}/api/products-sitemap/?start=${start}&end=${end}`,
      { next: { revalidate: 60 * 60 } }
    );
    if (res.ok) {
      const products = await res.json();
      return products.map((product) => ({
        url: `${process.env.NEXT_PUBLIC_URL}/product-detail/${product.slug}`,
        lastModified: new Date().toISOString().split("T")[0],
        priority: 0.5,
      }));
    }
  } catch (err) {
    console.error("Error fetching products for sitemap:", err.message);
    return [];
  }
}
