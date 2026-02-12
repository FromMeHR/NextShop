export function findCategoryPath(categories, targetSlug, path = []) {
  if (!categories || !Array.isArray(categories)) return [];
  for (const cat of categories) {
    const currentPath = [...path, cat];
    if (cat.slug === targetSlug) return currentPath;
    if (cat.children?.length > 0) {
      const found = findCategoryPath(cat.children, targetSlug, currentPath);
      if (found.length > 0) return found;
    }
  }
  return [];
}
