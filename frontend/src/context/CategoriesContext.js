import { createContext, useMemo } from "react";

export const CategoriesContext = createContext();

export const CategoriesProvider = ({ children, initialCategories }) => {
  const value = useMemo(() => ({
      categories: initialCategories || [],
    }),
    [initialCategories]
  );

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};
