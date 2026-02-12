import { CatalogPage } from "../../../features/CatalogPage/CatalogPage";
import { defineServerPageSize } from "../../../utils/defineServerPageSize";
import { findCategoryPath } from "../../../utils/findCategoryPath";
import { PRODUCT_STOCK_STATUS } from "../../../constants/constants";
import { getCategories } from "../../../lib/categories";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const search = await searchParams;
  const categorySlug = slug[0];
  const isFilterRoute = slug[1] === "filter";
  const urlFilters = isFilterRoute ? slug.slice(2) : [];

  const isQuery = !!(search?.name || search?.price || search?.ordering);
  const isMultipleFilters = urlFilters.length > 1;
  const isIndexable = !isQuery && !isMultipleFilters;
  const isNumericPage = /^\d+$/.test(search?.page);
  const pageNum = isNumericPage ? Number(search.page) : 1;

  const isFirstPage = pageNum === 1;
  const pageSuffix = !isFirstPage ? ` - Сторінка ${pageNum}` : "";
  const pageQuerySuffix = !isFirstPage ? `?page=${pageNum}` : "";

  let canonicalPath = `/catalog/${categorySlug}`;
  if (urlFilters.length === 1 && !isQuery) {
    canonicalPath += `/filter/${urlFilters[0]}`;
  }
  if (pageQuerySuffix) canonicalPath += pageQuerySuffix;

  const baseUrl = process.env.BASE_INTERNAL_API_URL;

  try {
    const res = await fetch(
      `${baseUrl}/api/categories/${categorySlug}/filters/`,
      { next: { revalidate: 60 * 60 } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.category) {
        const categoryName = data.category.name;
        let title = "";
        let description = "";
        if (urlFilters.length === 0) {
          title = `${categoryName} - купити в Україні: вигідна ціна, офіційна гарантія${pageSuffix} | Voltio`;
          description = `${categoryName} - купуйте доступно та вигідно в інтернет-магазині цифрової техніки${pageSuffix} | Voltio`;
        } else if (urlFilters.length === 1) {
          let filterName = "";
          data.filters?.forEach(group => {
            const found = group.children.find(attr => attr.slug === urlFilters[0]);
            if (found) filterName = found.name;
          });
          const filterPart = filterName ? `: ${filterName}` : "";
          title = `${categoryName}${filterPart} - купити в Україні, вигідні ціни на ${categoryName} в магазині цифрової техніки${pageSuffix} | Voltio`;
          description = `Купити ${categoryName}${filterPart} в магазині цифрової техніки${pageSuffix} | Voltio`;
        } else {
          title = `${categoryName} - купити в Україні, вигідні ціни на ${categoryName} в магазині цифрової техніки${pageSuffix} | Voltio`;
        }
        return {
          title,
          description,
          robots: {
            index: isIndexable,
            follow: true,
          },
          alternates: {
            canonical: canonicalPath,
          },
          openGraph: {
            siteName: "voltio.click",
            locale: "uk_UA",
            type: "website",
            images: [
              {
                url: data.category?.image,
              },
            ],
          },
        };
      }
    }
  } catch (error) {
    console.error("Error fetching category filters for metadata:", error);
  }
}

export default async function Page({ params, searchParams }) {
  const { slug } = await params;
  const search = await searchParams;
  const categorySlug = slug[0];
  const isFilterRoute = slug[1] === "filter";
  const urlFilters = isFilterRoute ? slug.slice(2) : [];
  const filterQuery = urlFilters.length > 0 ? `${urlFilters.join(",")}` : "";
  const nameQuery = search?.name || "";
  let priceQuery = search?.price || "";
  if (priceQuery) {
    const [minStr, maxStr] = priceQuery.split("-");
    const isPureNumbers = /^\d+$/.test(minStr) && /^\d+$/.test(maxStr);
    const min = parseInt(minStr);
    const max = parseInt(maxStr);
    if (!isPureNumbers || isNaN(min) || isNaN(max) || min > max) {
      priceQuery = "";
    } else {
      priceQuery = `${min}-${max}`;
    }
  }
  const rawPage = search?.page;
  const hasPageParam = Object.hasOwn(search, "page");
  const isNumericPage = /^\d+$/.test(rawPage);
  let page = isNumericPage ? Number(rawPage) : 1;
  if (hasPageParam && (!isNumericPage || page <= 1)) {
    const newParams = new URLSearchParams(search);
    newParams.delete("page");
    const queryString = newParams.toString();
    redirect(`/catalog/${slug.join("/")}${queryString ? `?${queryString}` : ""}`);
  }
  const baseUrl = process.env.BASE_INTERNAL_API_URL;

  const commonApiParams = `attributes=${filterQuery}&price=${priceQuery}&name=${nameQuery}`;

  let filters = null;
  let currentCategory = null;
  let priceRange = null;
  try {
    let res = null;
    if (priceQuery || nameQuery) {
      res = await fetch(
        `${baseUrl}/api/categories/${categorySlug}/filters/?${commonApiParams}`,
        { cache: "no-store" }
      );
    } else {
      res = await fetch(
        `${baseUrl}/api/categories/${categorySlug}/filters/?attributes=${filterQuery}`,
        { next: { revalidate: 60 * 60 } }
      );
    }
    if (res.ok) {
      const data = await res.json();
      currentCategory = data?.category;
      filters = data?.filters;
      priceRange = data?.price_range;
    }
  } catch (error) {
    console.error("Error fetching category filters:", error);
  }

  if (!currentCategory) {
    return notFound();
  }

  const orderingQuery = search?.ordering || "";
  const ordering = orderingQuery || "-popularity";

  const ua = (await headers()).get("user-agent") || "";
  const pageSize = defineServerPageSize(ua);

  let products = null;
  try {
    let res = null;
    if (priceQuery || nameQuery || orderingQuery) {
      res = await fetch(
        `${baseUrl}/api/products/filter/${categorySlug}/?ordering=${ordering}&page=${page}&page_size=${pageSize}&${commonApiParams}`,
        { cache: "no-store" }
      );
    } else {
      res = await fetch(
        `${baseUrl}/api/products/filter/${categorySlug}/?ordering=${ordering}&page=${page}&page_size=${pageSize}&attributes=${filterQuery}`,
        { next: { revalidate: 60 * 60 } }
      );
    }
    if (res.ok) {
      products = await res.json();
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }

  const totalPages = products?.total_pages || 1;
  if (page > totalPages && totalPages > 0) {
    const newParams = new URLSearchParams(search);
    newParams.set("page", totalPages.toString());
    const queryString = newParams.toString();
    redirect(`/catalog/${slug.join("/")}?${queryString}`);
  }

  const categories = await getCategories();
  const categoryPath = findCategoryPath(categories, currentCategory?.slug);
  const pathname = `/catalog/${slug.join("/")}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": currentCategory.name,
    "itemListElement": products?.results?.map((product, index) => ({
      "@type": "ListItem",
      "position": ((page - 1) * pageSize) + index + 1,
      "item": {
        "@type": "Product",
        "url": `${process.env.NEXT_PUBLIC_URL}/product-detail/${product.slug}`,
        "name": product.name,
        "image": product.image,
        "sku": product.code,
        "offers": {
          "@type": "Offer",
          "price": parseFloat(product.price),
          "priceCurrency": "UAH",
          "availability": product.stock_status === PRODUCT_STOCK_STATUS.OUT_OF_STOCK
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/InStock"
        }
      }
    })) || []
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CatalogPage
        products={products}
        filters={filters}
        categoryPath={categoryPath}
        currentCategory={currentCategory}
        priceRange={priceRange}
        currentPrice={priceQuery}
        currentName={nameQuery}
        urlFilters={urlFilters}
        page={page}
        pageSize={pageSize}
        currentOrdering={ordering}
        searchParams={search}
        pathname={pathname}
      />
    </>
  );
}
