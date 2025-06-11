import { Link } from "react-router-dom";
import { useBurgerMenu } from "../../../hooks/useBurgerMenu";
import css from "./BurgerMenu.module.css";

export function BurgerMenu(props) {
  const { isOpen, toggleMenu } = useBurgerMenu();

  return (
    <>
      <div className={css["burger-menu-btn-wrapper"]} onClick={toggleMenu}>
        <div className={`${css["burger-menu-btn"]} ${isOpen ? css["active"] : ""}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className={css["burger-menu-text"]}>More</span>
      </div>
      <div
        className={`${css["overlay"]} ${isOpen ? css["open"] : ""}`}
        onClick={toggleMenu}
      ></div>
      <div className={`${css["burger-utility-bar"]} ${isOpen ? css["open"] : ""}`}>
        <div className={css["burger-header"]}>
          <Link to="" reloadDocument>
            Shop
          </Link>
        </div>
        <div className={css["burger-actions"]}>
          <div
            className={css["burger-user-button"]}
            onClick={() => document.getElementById("user-button").click()}
          >
            <div className={css["user-icon-wrapper"]}>
              <img
                src={`${process.env.REACT_APP_PUBLIC_URL}/svg/user.svg`}
                className={css["icon"]}
                alt="User icon"
              />
              {props.isAuthorized && (
                <img
                  src={`${process.env.REACT_APP_PUBLIC_URL}/svg/check-circle.svg`}
                  alt="Authorized check icon"
                  className={css["authorized-check-icon"]}
                />
              )}
            </div>
            <span className={css["menu-element__text"]}>
              {props.isAuthorized ? "Profile" : "Sign in/up"}
            </span>
          </div>
        </div>
        <div className={css["burger-phones"]}>
          <p>Contacts</p>
          <Link to="tel:+3803456789">+3803456789</Link>
          <Link to="tel:+3809876543">+3809876543</Link>
        </div>
      </div>
    </>
  );
}
