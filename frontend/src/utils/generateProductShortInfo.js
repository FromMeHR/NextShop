export function generateProductShortInfo(attributes) {
  if (!attributes || !Array.isArray(attributes)) return [];
  const result = [];
  attributes.forEach((l1) => {
    if (l1.show_in_short_info) {
      const activeL2s =
        l1.children?.filter((l2) => l2.show_in_short_info) || [];
      const values = activeL2s
        .map((l2) => l2.children?.[0]?.name)
        .filter(Boolean);
      if (values.length > 0) {
        const item = { id: l1.id, name: l1.name, value: values.join(" ") };
        if (activeL2s.length === 1) {
          const l2 = activeL2s[0];
          const l3 = l2.children?.[0];
          if (l2.show_in_filters && l3?.slug) {
            item.slug = l3.slug;
          }
        }
        result.push(item);
      }
    } else {
      l1.children?.forEach((l2) => {
        if (l2.show_in_short_info) {
          const l3 = l2.children?.[0];
          const value = l3?.name;
          if (value) {
            const item = { id: l2.id, name: l2.name, value: value };
            if (l2.show_in_filters && l3?.slug) {
              item.slug = l3.slug;
            }
            result.push(item);
          }
        }
      });
    }
  });
  return result;
}
