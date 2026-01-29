import { headers } from "next/headers";
import { CatalogPage } from "../../../features/CatalogPage/CatalogPage";
import { defineServerPageSize } from "../../../utils/defineServerPageSize";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const categorySlug = slug[0];
  const baseUrl = process.env.BASE_INTERNAL_API_URL;

  try {
    const res = await fetch(
      `${baseUrl}/api/categories/${categorySlug}/filters/`,
      { next: { revalidate: 60 * 60 } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.category) {
        return { title: `${data.category.name} - Voltio` };
      }
    }
  } catch (error) {
    console.error("Error fetching category for metadata:", error);
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
    console.error("Error fetching filters:", error);
  }

  const ordering = search?.ordering || "-popularity";
  const page = search?.page ? Number(search.page) : 1;

  const ua = (await headers()).get("user-agent") || "";
  const pageSize = defineServerPageSize(ua);

  let products = null;
  try {
    let res = null;
    if (priceQuery || nameQuery) {
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
  return (
    <CatalogPage
      products={products}
      filters={filters}
      currentCategory={currentCategory}
      priceRange={priceRange}
      currentPrice={priceQuery}
      currentName={nameQuery}
      urlFilters={urlFilters}
      page={page}
      pageSize={pageSize}
      currentOrdering={ordering}
    />
  );
}
