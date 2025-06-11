import { useContext } from "react";
import { BurgerMenuContext } from "../context/BurgerMenuContext";

export const useBurgerMenu = () => {
  return useContext(BurgerMenuContext);
};
