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
  if (page === "category") {
    try {
      const res = await fetch(
        `${process.env.BASE_INTERNAL_API_URL}/api/categories-sitemap/?start=0&end=50000`,
        { next: { revalidate: 60 * 60 } }
      );
      if (res.ok) {
        const categories = await res.json();
        return categories.map((cat) => ({
          url: `${process.env.NEXT_PUBLIC_URL}/category/${cat.full_slug}`,
          lastModified: new Date().toISOString().split("T")[0],
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
        return filters.map((f) => {
          const urlPath = f.filter_slug
            ? `catalog/${f.category_slug}/filter/${f.filter_slug}`
            : `catalog/${f.category_slug}`;
          return {
            url: `${process.env.NEXT_PUBLIC_URL}/${urlPath}`,
            lastModified: new Date().toISOString().split("T")[0],
            priority: 0.8,
          };
        });
      }
    } catch (err) {
      console.error("Error fetching category filters for sitemap:", err.message);
      return [];
    }
  }
}
