"use client";

import Link from "next/link";
import { useAuth } from "../../../hooks/useAuth";
import { useModal } from "../../../hooks/useModal";
import { useBurgerMenu } from "../../../hooks/useBurgerMenu";
import css from "./BurgerMenu.module.css";

export function BurgerMenu() {
  const { isOpen, toggleMenu } = useBurgerMenu();
  const { isAuth } = useAuth();
  const { openModal } = useModal();

  return (
    <>
      <div className={css["burger-menu-btn-wrapper"]} onClick={toggleMenu}>
        <div className={`${css["burger-menu-btn"]} ${isOpen ? css["active"] : ""}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className={css["burger-menu-text"]}>Ще</span>
      </div>
      <div
        className={`${css["overlay"]} ${isOpen ? css["open"] : ""}`}
        onClick={toggleMenu}
      ></div>
      <div className={`${css["burger-utility-bar"]} ${isOpen ? css["open"] : ""}`}>
        <div className={css["burger-header"]}>
          <a href="/">
            Shop
          </a>
        </div>
        <div className={css["burger-actions"]}>
          <div
            className={css["burger-user-button"]}
            onClick={() => openModal("auth")}
          >
            <div className={css["user-icon-wrapper"]}>
              <img
                src={`${process.env.NEXT_PUBLIC_URL}/svg/user.svg`}
                className={css["icon"]}
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
            <span className={css["menu-element__text"]}>
              {isAuth ? "Мій профіль" : "Вхід/Реєстрація"}
            </span>
          </div>
        </div>
        <div className={css["burger-phones"]}>
          <p>Контакти</p>
          <Link href="tel:+380995544422">+380995544422</Link>
          <Link href="tel:+380987654346">+380987654346</Link>
        </div>
      </div>
    </>
  );
}
