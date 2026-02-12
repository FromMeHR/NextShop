export async function getCategories() {
  const baseUrl = process.env.BASE_INTERNAL_API_URL;
  try {
    const res = await fetch(`${baseUrl}/api/categories/`, {
      next: { revalidate: 60 * 60 },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
