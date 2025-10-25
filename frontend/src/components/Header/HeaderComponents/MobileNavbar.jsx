"use client";

import { useCart } from "../../../hooks/useCart";
import { useModal } from "../../../hooks/useModal";
import { BurgerMenu } from "./BurgerMenu";
import { usePathname } from "next/navigation";
import css from "./MobileNavbar.module.css";

export function MobileNavbar() {
  const { cart, totalQuantity } = useCart();
  const { openModal } = useModal();
  const pathname = usePathname();

  return (
    <nav className={css["navbar-wrapper"]}>
      <div className={css["navbar-content-wrapper"]}>
        <a href="/">
          <div
            className={`${css["navbar-element"]} ${
              pathname === "/" ? css["active"] : ""
            }`}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_URL}/svg/home.svg`}
              className={css["icon"]}
              alt="Home icon"
            />
            <span className={css["navbar-element__text"]}>Головна</span>
          </div>
        </a>
        <div
          className={css["navbar-element"]}
          onClick={() => cart.length > 0 && openModal("cart")}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_URL}/svg/cart.svg`}
            className={css["icon"]}
            alt="Cart icon"
          />
          {totalQuantity > 0 && (
            <span className={css["navbar-cart-badge"]}>{totalQuantity}</span>
          )}
          <span className={css["navbar-element__text"]}>Кошик</span>
        </div>
        <BurgerMenu />
      </div>
    </nav>
  );
}
