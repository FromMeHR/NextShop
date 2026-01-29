import { useContext } from "react";
import { CategoriesContext } from "../context/CategoriesContext";

export const useCategories = () => {
  return useContext(CategoriesContext);
};
