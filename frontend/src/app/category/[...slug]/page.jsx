import { CategoryPage } from "../../../features/CategoryPage/CategoryPage";
import { findCategoryPath } from "../../../utils/findCategoryPath";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const lastCategorySlug = slug[slug.length - 1];
  const baseUrl = process.env.BASE_INTERNAL_API_URL;

  try {
    const res = await fetch(`${baseUrl}/api/categories`, {
      next: { revalidate: 60 * 60 },
    });
    if (res.ok) {
      const categories = await res.json();
      const categoryPath = findCategoryPath(categories, lastCategorySlug);
      const lastCategory = categoryPath
        ? categoryPath[categoryPath.length - 1]
        : null;
      return {
        title: `${lastCategory?.name} - Voltio`,
      };
    }
  } catch (error) {
    console.error("Error fetching category for metadata:", error);
  }
}

export default async function Page({ params }) {
  const { slug } = await params;
  const lastCategorySlug = slug[slug.length - 1];
  const baseUrl = process.env.BASE_INTERNAL_API_URL;

  try {
    const res = await fetch(`${baseUrl}/api/categories`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const categories = await res.json();
      const categoryPath = findCategoryPath(categories, lastCategorySlug);
      if (categoryPath) {
        return <CategoryPage categoryPath={categoryPath} />;
      }
    }
  } catch (error) {
    console.error("Error fetching category:", error);
  }
  throw new Error("Category not found");
}
