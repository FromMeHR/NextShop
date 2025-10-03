import { generateSitemaps } from "../sitemap";

export const revalidate = 3600;

function getFileName(id) {
  if (id == null) return "sitemap.xml";
  return process.env.NODE_ENV === "development"
    ? `sitemap.xml/${id}`
    : `sitemap/${id}.xml`;
}

function getLoc(id) {
  return `${process.env.NEXT_PUBLIC_URL}/${getFileName(id)}`;
}

function getSitemap(id) {
  return `<sitemap><loc>${getLoc(id)}</loc><lastmod>${
    new Date().toISOString().split("T")[0]
  }</lastmod></sitemap>`;
}

export async function GET() {
  const ids = await generateSitemaps();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${ids.map(({ id }) => getSitemap(id)).join("")}
    </sitemapindex>
  `;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
