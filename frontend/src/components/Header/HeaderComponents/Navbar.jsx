"use client";

import { useRouter } from "next/navigation";
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
          <a href="/">Shop</a>
        </div>
        <div className={`${css["search-wrapper"]}`}>
          <SearchBox />
        </div>
        <div className={`${css["navbar-utility-bar"]}`}>
          <div
            className={css["navbar-user-button"]}
            onClick={() =>
              isAuth
                ? (() => {
                    setIsOpen(false);
                    router.push("/profile/user-info");
                  })()
                : openModal("auth")
            }
          >
            <div className={css["user-icon-wrapper"]}>
              <img
                src={`${process.env.NEXT_PUBLIC_URL}/svg/user.svg`}
                alt="User icon"
              />
              {isAuth && (
                <img
                  src={`${process.env.NEXT_PUBLIC_URL}/svg/check-circle.svg`}
                  alt="Authorized check icon"
                  className={css["authorized-check-icon"]}
                />
              )}
            </div>
          </div>
          <div
            className={css["navbar-cart-button"]}
            onClick={() => cart.length > 0 && openModal("cart")}
          >
            <div className={css["cart-icon-wrapper"]}>
              <img
                src={`${process.env.NEXT_PUBLIC_URL}/svg/cart.svg`}
                alt="Cart icon"
              />
              {totalQuantity > 0 && (
                <span className={css["navbar-cart-badge"]}>
                  {totalQuantity}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
