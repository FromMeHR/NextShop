import { SearchPage } from "../../../features/SearchPage/SearchPage";
import { defineServerPageSize } from "../../../utils/defineServerPageSize";
import { headers } from "next/headers";
import DOMPurify from "isomorphic-dompurify";

export async function generateMetadata({ params }) {
  const { query } = await params;
  const searchString = DOMPurify.sanitize(decodeURIComponent(query.join("/")));
  return {
    title: `Результати пошуку за запитом «${searchString}» | Voltio`,
  };
}

export default async function Page({ params }) {
  const { query } = await params;
  const searchString = DOMPurify.sanitize(decodeURIComponent(query.join("/")));
  const ua = (await headers()).get("user-agent") || "";
  const pageSize = defineServerPageSize(ua);
  return <SearchPage query={searchString} pageSize={pageSize} />;
}
