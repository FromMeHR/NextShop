export async function generateSitemaps() {
  return [
    { id: "main" },
    { id: "product" },
    { id: "category" },
    { id: "category-filter" },
  ];
}

export default async function sitemap(props) {
  const page = await props.id;
  if (page === "main") {
    const routes = [
      "",
    ];
    return routes.map((route) => ({
      url: `${process.env.NEXT_PUBLIC_URL}/${route}`,
      lastModified: new Date().toISOString().split("T")[0],
      priority: 1,
    }));
  }
  if (page === "product") {
    try {
      const res = await fetch(
        `${process.env.BASE_INTERNAL_API_URL}/api/products-sitemap/?start=0&end=50000`,
        { next: { revalidate: 60 * 60 } }
      );
      if (res.ok) {
        const products = await res.json();
        return products.map((p) => ({
          url: `${process.env.NEXT_PUBLIC_URL}/product-detail/${p.slug}`,
          lastModified: p.updated_at
            ? new Date(p.updated_at).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          priority: 0.6,
        }));
      }
    } catch (err) {
      console.error("Error fetching products for sitemap:", err.message);
      return [];
    }
  }
  if (page === "category") {
    try {
      const res = await fetch(
        `${process.env.BASE_INTERNAL_API_URL}/api/categories-sitemap/?start=0&end=50000`,
        { next: { revalidate: 60 * 60 } }
      );
      if (res.ok) {
        const categories = await res.json();
        return categories.map((c) => ({
          url: `${process.env.NEXT_PUBLIC_URL}/category/${c.full_slug}`,
          lastModified: c.updated_at
            ? new Date(c.updated_at).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          priority: 0.8,
        }));
      }
    } catch (err) {
      console.error("Error fetching categories for sitemap:", err.message);
      return [];
    }
  }
  if (page === "category-filter") {
    try {
      const res = await fetch(
        `${process.env.BASE_INTERNAL_API_URL}/api/category-filters-sitemap/?start=0&end=50000`,
        { next: { revalidate: 60 * 60 } }
      );
      if (res.ok) {
        const filters = await res.json();
        return filters.map((f) => ({
          url: `${process.env.NEXT_PUBLIC_URL}/catalog/${f.category_slug}${
            f.filter_slug ? `/filter/${f.filter_slug}` : ""
          }`,
          lastModified: f.updated_at
            ? new Date(f.updated_at).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          priority: 0.8,
        }));
      }
    } catch (err) {
      console.error("Error fetching category filters for sitemap:", err.message);
      return [];
    }
  }
}
