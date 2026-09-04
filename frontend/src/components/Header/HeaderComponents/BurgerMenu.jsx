"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import { useModal } from "../../../hooks/useModal";
import { useBurgerMenu } from "../../../hooks/useBurgerMenu";
import css from "./BurgerMenu.module.css";

export function BurgerMenu() {
  const { isOpen, toggleMenu } = useBurgerMenu();
  const { isAuth } = useAuth();
  const { openModal } = useModal();
  const router = useRouter();

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
            Voltio
          </a>
        </div>
        <div className={css["burger-actions"]}>
          <button
            className={css["burger-user-button"]}
            onClick={() =>
              isAuth
                ? (() => {
                    toggleMenu();
                    router.push("/profile/user-info");
                  })()
                : openModal("auth")
            }
          >
            <div
              className={`${css["user-icon-wrapper"]} ${
                isAuth ? css["is-authorized"] : ""
              }`}
            ></div>
            <span className={css["menu-element__text"]}>
              {isAuth ? "Мій профіль" : "Вхід/Реєстрація"}
            </span>
          </button>
        </div>
        <div className={css["burger-phones"]}>
          <p>Контакти</p>
          <Link href="tel:+380999999999">+380999999999</Link>
          <Link href="tel:+380955555555">+380955555555</Link>
        </div>
      </div>
    </>
  );
}
