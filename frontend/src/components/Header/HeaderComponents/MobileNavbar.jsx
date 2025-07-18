import { useCart } from "../../../hooks/useCart";
import { BurgerMenu } from "./BurgerMenu";
import { Link, useLocation } from "react-router-dom";
import css from "./MobileNavbar.module.css";

export function MobileNavbar(props) {
  const { cart, totalQuantity } = useCart();
  const location = useLocation();

  return (
    <nav className={css["navbar-wrapper"]}>
      <div className={css["navbar-content-wrapper"]}>
        <Link to="/" reloadDocument>
          <div
            className={`${css["navbar-element"]} ${
              location.pathname === "/" ? css["active"] : ""
            }`}
          >
            <img
              src={`${process.env.REACT_APP_PUBLIC_URL}/svg/home.svg`}
              className={css["icon"]}
              alt="Home icon"
            />
            <span className={css["navbar-element__text"]}>Головна</span>
          </div>
        </Link>
        <div
          className={css["navbar-element"]}
          onClick={() =>
            cart.length > 0 && document.getElementById("cart-button").click()
          }
        >
          <img
            src={`${process.env.REACT_APP_PUBLIC_URL}/svg/cart.svg`}
            className={css["icon"]}
            alt="Cart icon"
          />
          {totalQuantity > 0 && (
            <span className={css["navbar-cart-badge"]}>{totalQuantity}</span>
          )}
          <span className={css["navbar-element__text"]}>Кошик</span>
        </div>
        <BurgerMenu isAuthorized={props.isAuthorized} />
      </div>
    </nav>
  );
}
