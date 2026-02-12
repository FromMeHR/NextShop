import { CategoryPage } from "../../../features/CategoryPage/CategoryPage";
import { findCategoryPath } from "../../../utils/findCategoryPath";
import { getCategories } from "../../../lib/categories";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const lastCategorySlug = slug[slug.length - 1];
  const categories = await getCategories();
  const categoryPath = findCategoryPath(categories, lastCategorySlug);
  if (categoryPath.length > 0) {
    const lastCategory = categoryPath[categoryPath.length - 1];
    if (lastCategory.children && lastCategory.children.length > 0) {
      return {
        title: `${lastCategory?.name} | Voltio`,
        description: `${lastCategory?.name} - вигідна ціна, офіційна гарантія та доставка по всій Україні | Voltio`,
        openGraph: {
          siteName: "voltio.click",
          locale: "uk_UA",
          type: "website",
          images: [
            {
              url: lastCategory?.image,
            },
          ],
        },
      };
    }
  }
}

export default async function Page({ params }) {
  const { slug } = await params;
  const lastCategorySlug = slug[slug.length - 1];
  const categories = await getCategories();
  const categoryPath = findCategoryPath(categories, lastCategorySlug);
  if (categoryPath.length > 0) {
    const lastCategory = categoryPath[categoryPath.length - 1];
    if (lastCategory.children && lastCategory.children.length > 0) {
      return <CategoryPage categoryPath={categoryPath} />;
    }
  }
  return notFound();
}
