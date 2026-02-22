"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useBodyScrollLock } from "../../../hooks/useBodyScrollLock";
import { useCategories } from "../../../hooks/useCategories";
import Link from "next/link";
import css from "./CatalogBox.module.css";

export function CatalogBox() {
  const { lock, unlock } = useBodyScrollLock();
  const { categories } = useCategories();
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [level, setLevel] = useState(0);
  const [stack, setStack] = useState([]);
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTitle = level === 0 ? "Каталог товарів" : stack[stack.length - 1]?.name;

  const currentCategories = () => {
    if (level === 0) return categories;
    if (level === 1) return stack[0]?.children || [];
    if (level === 2) return stack[1]?.children || [];
  };

  useEffect(() => {
    setIsOpenDropdown(false);
    resetCatalog();
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpenDropdown && event.target.isConnected) {
        const outsideContent = dropdownRef.current && !dropdownRef.current.contains(event.target);
        if (outsideContent) {
          setIsOpenDropdown(false);
        }
      }
    };
    const handleResize = () => {
      if (isOpenDropdown && window.innerWidth <= 768) {
        lock("catalog-box");
      } else {
        unlock("catalog-box");
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpenDropdown, lock, unlock]);

  useEffect(() => {
    if (isOpenDropdown && window.innerWidth <= 768) {
      lock("catalog-box");
    } else {
      unlock("catalog-box");
    }
  }, [isOpenDropdown, lock, unlock]);

  const handleCategoryClick = (cat) => {
    if (cat.children?.length > 0) {
      setStack((prev) => [...prev, cat]);
      setLevel((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStack((prev) => prev.slice(0, -1));
    setLevel((prev) => prev - 1);
  };

  const resetCatalog = () => {
    setStack([]);
    setLevel(0);
  };

  const toggleCatalog = (e) => {
    if (!isOpenDropdown && categories?.length > 0) {
      setActiveCategory(categories.find((cat) => cat.children.length > 0) || null);
    }
    setIsOpenDropdown((prev) => !prev);
  };

  return (
    <>
      <button className={css["navbar-catalog-btn"]} onClick={toggleCatalog}>
        <div className={`${css["burger-menu-icon"]}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span>Каталог</span>
      </button>
      <div className={`${css["catalog-box-dropdown"]} ${isOpenDropdown ? css["open"] : ""}`}>
        <div className={css["catalog-box-dropdown__content"]} ref={dropdownRef}>
          <div className={css["catalog-box-dropdown__mobile-header"]}>
            {level > 0 && (
              <button onClick={handleBack} className={css["catalog-box-dropdown__mobile-back-btn"]}>
                {level === 1 ? "Каталог товарів" : stack[stack.length - 2]?.name}
                <img
                  src={`${process.env.NEXT_PUBLIC_URL}/svg/up.svg`}
                  className={css["catalog-box-dropdown__mobile-back-btn-arrow"]}
                  alt="Arrow"
                />
              </button>
            )}
            <div className={css["catalog-box-dropdown__mobile-title"]}>{currentTitle}</div>
          </div>
          <div className={css["catalog-box-dropdown__mobile-row"]}>
            {currentCategories().map((cat) => (
              <div
                key={cat.id}
                className={`${css["catalog-box-dropdown__item"]}`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat.slug && cat.children.length === 0 ? (
                  <Link
                    href={`/catalog/${cat.slug}`}
                    className={css["catalog-item-link"]}
                    prefetch={false}
                  >
                    {cat.name}
                  </Link>
                ) : (
                  <>
                    <span className={css["catalog-item-span"]}>{cat.name}</span>
                    <img
                      src={`${process.env.NEXT_PUBLIC_URL}/svg/up.svg`}
                      className={css["catalog-item-arrow"]}
                      alt="Arrow"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
          <div className={css["catalog-box-dropdown__row"]}>
            <div className={css["catalog-box-dropdown__column-left"]}>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`${css["catalog-box-dropdown__item"]} ${
                    activeCategory?.id === cat.id ? css["active"] : ""
                  }`}
                  onMouseEnter={() => {
                    cat.children.length > 0 && setActiveCategory(cat);
                  }}
                >
                  {cat.slug && cat.children.length === 0 ? (
                    <Link
                      href={`/catalog/${cat.slug}`}
                      className={css["catalog-item-link"]}
                      prefetch={false}
                    >
                      {cat.name}
                    </Link>
                  ) : (
                    <>
                      <span className={css["catalog-item-span"]}>{cat.name}</span>
                      <img
                        src={`${process.env.NEXT_PUBLIC_URL}/svg/up.svg`}
                        className={css["catalog-item-arrow"]}
                        alt="Arrow"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className={css["catalog-box-dropdown__column-right"]}>
              {activeCategory?.children?.length > 0 && (
                <div className={css["catalog-box-grid"]}>
                  {activeCategory.children.map((lvl2) => {
                    const hasChildrenLvl2 = lvl2.children && lvl2.children.length > 0;
                    const urlLvl2 = hasChildrenLvl2
                      ? `/category/${activeCategory.slug}/${lvl2.slug}`
                      : `/catalog/${lvl2.slug}`;
                    return (
                      <div key={lvl2.id} className={css["catalog-box-section"]}>
                        {lvl2.slug ? (
                          <Link
                            href={urlLvl2}
                            className={css["catalog-lvl2-title"]}
                            prefetch={false}
                          >
                            {lvl2.name}
                          </Link>
                        ) : (
                          <span className={css["catalog-lvl2-header"]}>{lvl2.name}</span>
                        )}
                        {lvl2.children?.length > 0 && (
                          <div className={css["catalog-lvl3-list"]}>
                            {lvl2.children.map((lvl3) => (
                              <Link
                                key={lvl3.id}
                                href={`/catalog/${lvl3.slug}`}
                                className={css["catalog-lvl3-item"]}
                                prefetch={false}
                              >
                                {lvl3.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
