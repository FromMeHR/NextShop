import { headers } from "next/headers";
import { SearchPage } from "../../../features/SearchPage/SearchPage";
import { defineServerPageSize } from "../../../utils/defineServerPageSize";

export async function generateMetadata({ params }) {
  const { query } = await params;
  return {
    title: `Результати пошуку за запитом ${decodeURIComponent(query)} - NextShop`,
  };
}

export default async function Page({ searchParams, params }) {
  const { query } = await params;
  const search = await searchParams;
  const page = search?.page ? Number(search.page) : 1;

  const ua = (await headers()).get("user-agent") || "";
  const pageSize = defineServerPageSize(ua);

  const baseUrl = process.env.BASE_INTERNAL_API_URL;
  let data = null;

  try {
    const res = await fetch(
      `${baseUrl}/api/search/?name=${query}&ordering=custom_order&page=${page}&page_size=${pageSize}`,
      { next: { revalidate: 60 * 60 } }
    );
    if (res.ok) {
      data = await res.json();
    }
  } catch (error) {
    console.error("Error fetching search results:", error);
  }
  return (
    <SearchPage data={data} page={page} pageSize={pageSize} query={query} />
  );
}
