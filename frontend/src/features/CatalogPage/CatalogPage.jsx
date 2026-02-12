import { Product } from "../../components/Product/Product";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import { Pagination } from "../../components/Pagination/Pagination";
import { CatalogClientLayout } from "./components/CatalogClientLayout";
import css from "./CatalogPage.module.css";

export function CatalogPage(props) {
  const { products: data, filters, categoryPath, currentName, currentCategory, urlFilters, page, pageSize, searchParams, pathname } = props;
  const products = data?.results || [];
  const totalItems = data?.total_items || 0;
  const totalPages = data?.total_pages || 0;

  let selectedFilterName = "";
  if (urlFilters.length === 1) {
    filters?.forEach((group) => {
      const found = group.children?.find((attr) => attr.slug === urlFilters[0]);
      if (found) selectedFilterName = found.name;
    });
  }
  const pageSuffix = page > 1 ? ` - Сторінка ${page}` : "";
  const breadcrumbItems = [
    ...categoryPath
      .filter((cat) => cat.slug !== null)
      .map((cat, index, filteredArray) => {
        const isLast = index === filteredArray.length - 1;
        const fullPath = filteredArray
          .slice(0, index + 1)
          .map((c) => c.slug)
          .join("/");
        return {
          name: cat.name,
          href: isLast
            ? null
            : (cat.children?.length > 0
                ? `/category/${fullPath}`
                : `/catalog/${cat.slug}`),
        };
      }),
  ];

  return (
    <div className={css["catalog-page__main"]}>
      <div className={css["catalog-page__content"]}>
        <h1 className={css["search-results__header"]}>
          <Breadcrumbs items={breadcrumbItems} />
          {currentCategory.name}
          {selectedFilterName && `: ${selectedFilterName}`}
          {pageSuffix}
          <span className={css["search-results__count"]}>
            {totalItems}
          </span>
          {currentName && (
            <span className={css["search-results__search-text"]}>
              (за пошуком «{decodeURIComponent(currentName)}»)
            </span>
          )}
        </h1>
        <CatalogClientLayout {...props}>
          {totalItems > 0 ? (
            <div className={css["search-results__products-col"]}>
              <div
                className={css["search-results__products-grid"]}
                id="products"
              >
                {products &&
                  products.length > 0 &&
                  products.map((product) => (
                    <Product key={product.code} product={product} />
                  ))}
              </div>
              {totalPages > 1 && (
                <Pagination
                  currentPage={Number(page) || 1}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  searchParams={searchParams}
                  pathname={pathname}
                />
              )}
            </div>
          ) : (
            <div className={css["search-no-results__title"]}>
              За даними критеріями не знайдено жодного товару.
            </div>
          )}
        </CatalogClientLayout>
      </div>
    </div>
  );
}
