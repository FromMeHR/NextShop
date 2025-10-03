import { headers } from "next/headers";
import { MainPage } from "../features/LandingPage/MainPage";
import { defineServerPageSize } from "../utils/defineServerPageSize";

export default async function Page({ searchParams }) {
  const search = await searchParams;
  const page = search?.page ? Number(search.page) : 1;

  const ua = (await headers()).get("user-agent") || "";
  const pageSize = defineServerPageSize(ua);

  const baseUrl = process.env.BASE_INTERNAL_API_URL;
  let data = null;

  try {
    const res = await fetch(
      `${baseUrl}/api/products/?page=${page}&page_size=${pageSize}`,
      { next: { revalidate: 60 } }
    );
    if (res.ok) {
      data = await res.json();
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
  return <MainPage data={data} page={page} pageSize={pageSize} />;
}
