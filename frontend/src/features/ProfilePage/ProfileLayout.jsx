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
                    <div className={css["profile__header--user-icon-wrapper"]}></div>
                    <span className={css["profile__header--title"]}>
                      {currentItem.title}
                    </span>
                    <div className={css["profile__header--arrow-icon-wrapper"]}></div>
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
                          <div className={`${css["profile__list-item--icon"]} ${css["user"]}`}></div>
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
                          <div className={`${css["profile__list-item--icon"]} ${css["cart"]}`}></div>
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
                          <div className={`${css["profile__list-item--icon"]} ${css["logout"]}`}></div>
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
