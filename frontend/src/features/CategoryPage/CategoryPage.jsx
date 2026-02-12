import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import Link from "next/link";
import css from "./CategoryPage.module.css";

export function CategoryPage({ categoryPath }) {
  const currentCategory = categoryPath[categoryPath.length - 1];

  const renderCategoryItem = (item) => {
    if (!item.slug && item.children) {
      return item.children.map((child) => renderCategoryItem(child));
    }

    const hasChildren = item.children && item.children.length > 0;
    const currentUrlPath = categoryPath.map((c) => c.slug).filter(Boolean).join("/");
    const url = hasChildren
      ? `/category/${currentUrlPath}/${item.slug}`
      : `/catalog/${item.slug}`;

    return (
      <article key={item.id} className={css["category-card"]}>
        <Link href={url} prefetch={false}>
          <div className={css["category-card__image-wrapper"]}>
            {item.image && <img src={item.image} alt={item.name} />}
          </div>
          <span className={css["category-card__name"]}>{item.name}</span>
        </Link>
      </article>
    );
  };

  const breadcrumbItems = [
    ...categoryPath.map((item, index) => {
      const isLast = index === categoryPath.length - 1;
      const fullPath = categoryPath
        .slice(0, index + 1)
        .map((c) => c.slug)
        .filter(Boolean)
        .join("/");
      return {
        name: item.name,
        href: isLast ? null : `/category/${fullPath}`,
      };
    }),
  ];

  return (
    <div className={css["category-page__main"]}>
      <div className={css["category-page__content"]}>
        <h1 className={css["category-page__header"]}>
          <Breadcrumbs items={breadcrumbItems} />
          {currentCategory.name}
        </h1>
        <div className={css["category-page__grid"]}>
          {currentCategory.children && currentCategory.children.length > 0 && (
            currentCategory.children.map((child) => renderCategoryItem(child))
          )}
        </div>
      </div>
    </div>
  );
}
