import { SearchPage } from "../../../features/SearchPage/SearchPage";

export async function generateMetadata({ params }) {
  const { query } = await params;
  return {
    title: `Результати пошуку за запитом ${decodeURIComponent(query)} - Voltio`,
  };
}

export default async function Page({ params }) {
  const { query } = await params;
  const searchString = decodeURIComponent(query.join("/"));
  return <SearchPage query={searchString} />;
}
