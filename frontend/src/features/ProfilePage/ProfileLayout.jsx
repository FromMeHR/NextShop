"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { fetchWithAuth } from "../../lib/fetchWithAuth";
import { Loader } from "../../components/Loader/Loader";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import css from "./ProfileLayout.module.css";

export function ProfileLayout({ children }) {
  const [openedSection, setOpenedSection] = useState(true);
  const { user, logout, isLoading } = useAuth();
  const { setCart } = useCart();
  const pathname = usePathname();

  const handleToggleSection = () => {
    setOpenedSection((prev) => !prev);
  };

  const isActiveItem = (href) => pathname === href;

  const menuItems = [
    {
      href: "/profile/user-info",
      title: `${user?.name} ${user?.surname}`,
    },
    {
      href: "/profile/orders",
      title: "Мої замовлення",
    },
  ];

  const currentItem = menuItems.find((item) => item.href === pathname) ?? menuItems[0];

  useEffect(() => {
    const forwardUrl = localStorage.getItem("forwardUrl");
    if (forwardUrl) {
      localStorage.removeItem("forwardUrl");
      window.location.href = forwardUrl;
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cart/sync/`,
        { method: "DELETE" }
      );
      setCart([]);
    } catch (error) {
      console.error("Cart sync failed:", error);
    }
    await logout();
    window.location.replace("/");
  };

  return !user || isLoading ? (
    <Loader />
  ) : (
    <div className={css["profile__main"]}>
      <div className={css["profile__content"]}>
        <Breadcrumbs items={[{ name: "Особистий кабінет" }]} />
        <div className={css["profile__row"]}>
          <div className={css["profile__left"]}>
            <div className={css["profile__block"]}>
              <div
                className={`${css["profile__section"]} ${
                  openedSection ? css["open"] : ""
                }`}
              >
                <div
                  className={css["profile__header-wrapper"]}
                  onClick={() => handleToggleSection()}
                >
                  <div className={css["profile__header"]}>
                    <img
                      src={`${process.env.NEXT_PUBLIC_URL}/svg/user.svg`}
                      className={css["profile__header--icon"]}
                      alt="User"
                    />
                    <span className={css["profile__header--title"]}>
                      {currentItem.title}
                    </span>
                    <img
                      src={`${process.env.NEXT_PUBLIC_URL}/svg/up.svg`}
                      className={css["profile__header--arrow"]}
                      alt="Arrow"
                    />
                  </div>
                </div>
                <div className={css["profile__section--content-wrapper"]}>
                  <div className={css["profile__section--content"]}>
                    <ul className={css["profile__list"]}>
                      <li
                        className={`${css["profile__list-item"]} ${
                          isActiveItem("/profile/user-info") ? css["active"] : ""
                        }`}
                      >
                        <Link href="/profile/user-info" >
                          <img
                            src={`${process.env.NEXT_PUBLIC_URL}/svg/user.svg`}
                            className={css["profile__list-item--icon"]}
                            alt="User"
                          />
                          <span className={css["profile__list-item--title"]}>
                            {user.name} {user.surname}
                          </span>
                        </Link>
                      </li>
                      <li
                        className={`${css["profile__list-item"]} ${
                          isActiveItem("/profile/orders") ? css["active"] : ""
                        }`}
                      >
                        <Link href="/profile/orders">
                          <img
                            src={`${process.env.NEXT_PUBLIC_URL}/svg/cart.svg`}
                            className={css["profile__list-item--icon"]}
                            alt="Orders"
                          />
                          <span className={css["profile__list-item--title"]}>
                            Мої замовлення
                          </span>
                        </Link>
                      </li>
                      <li className={css["profile__list-item"]}>
                        <button
                          className={css["profile__logout-btn"]}
                          onClick={handleLogout}
                        >
                          <img
                            src={`${process.env.NEXT_PUBLIC_URL}/svg/logout.svg`}
                            className={css["profile__list-item--icon"]}
                            alt="Logout"
                          />
                          <span className={css["profile__list-item--title"]}>
                            Вийти з акаунту
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={css["profile__right"]}>
            <div className={css["profile__block"]}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
