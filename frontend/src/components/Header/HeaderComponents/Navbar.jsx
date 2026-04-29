"use client";

import { useRouter } from "next/navigation";
import { CatalogBox } from "./CatalogBox";
import { SearchBox } from "./SearchBox";
import { useCart } from "../../../hooks/useCart";
import { useAuth } from "../../../hooks/useAuth";
import { useModal } from "../../../hooks/useModal";
import { useBurgerMenu } from "../../../hooks/useBurgerMenu";
import css from "./Navbar.module.css";

export function Navbar() {
  const { cart, totalQuantity } = useCart();
  const { isAuth } = useAuth();
  const { setIsOpen } = useBurgerMenu();
  const { openModal } = useModal();
  const router = useRouter();

  return (
    <nav className={css["navbar-wrapper"]}>
      <div className={css["navbar-content"]}>
        <div className={css["navbar-logo"]}>
          <a href="/">
            <img
              className={css["navbar-logo__image"]}
              src={`${process.env.NEXT_PUBLIC_URL}/svg/logo.svg`}
              alt="Voltio"
            />
          </a>
        </div>
        <div className={css["navbar-catalog-box"]}>
          <CatalogBox />
        </div>
        <div className={`${css["search-wrapper"]}`}>
          <SearchBox />
        </div>
        <div className={`${css["navbar-utility-bar"]}`}>
          <button
            className={css["navbar-user-button"]}
            onClick={() =>
              isAuth
                ? (() => {
                    setIsOpen(false);
                    router.push("/profile/user-info");
                  })()
                : openModal("auth")
            }
            aria-label={isAuth ? "Мій профіль" : "Вхід/Реєстрація"}
          >
            <div
              className={`${css["user-icon-wrapper"]} ${
                isAuth ? css["is-authorized"] : ""
              }`}
            ></div>
          </button>
          <button
            className={css["navbar-cart-button"]}
            onClick={() => cart.length > 0 && openModal("cart")}
            aria-label="Кошик"
          >
            <div className={css["cart-icon-wrapper"]}>
              {totalQuantity > 0 && (
                <span className={css["navbar-cart-badge"]}>
                  {totalQuantity}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}
