"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Pagination } from "antd";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Product } from "../../components/Product/Product";
import { useDropdownPosition } from "../../hooks/useDropdownPosition";
import { Loader } from "../../components/Loader/Loader";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import { Scrollbar } from "../../components/Scrollbar/Scrollbar";
import { defineClientPageSize } from "../../utils/defineClientPageSize";
import axios from "axios";
import useSWR from "swr";
import Link from "next/link";
import ReactDOM from "react-dom";
import css from "./SearchPage.module.css";

const fetcher = async (url) => {
  const response = await axios.get(url);
  return response.data;
};

export function SearchPage({ query }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const pageNumber = Number(searchParams.get("page")) || 1;
  const ordering = searchParams.get("ordering") || "-popularity";
  const pageSize = useMemo(() => defineClientPageSize(window.innerWidth), []);
  const [currentPage, setCurrentPage] = useState(pageNumber);
  const [scrollStatus, setScrollStatus] = useState({
    canScrollLeft: false,
    canScrollRight: false
  });
  const scrollContainer = useRef(null);
  const targetScrollLeft = useRef(0);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
  const { data, isLoading } = useSWR(
    `${baseUrl}/api/search/?name=${query}&ordering=${ordering}&page=${currentPage}&page_size=${pageSize}`,
    fetcher
  );

  const products = data?.results || [];
  const totalItems = data?.total_items || 0;
  const totalPages = data?.total_pages || 0;
  const categories = data?.available_categories || [];

  const updateQueryParams = (newPage, newOrdering) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", newPage.toString());
    }
    if (newOrdering) {
      params.set("ordering", newOrdering);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateQueryParams(page, ordering);
    const productsElement = document.getElementById("products");
    if (productsElement) {
      productsElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOrderingChange = (ordering) => {
    updateQueryParams(pageNumber, ordering);
  };

  const {
    isOpen: isDropdownOrderingOpen,
    setIsOpen: setIsDropdownOrderingOpen,
    selectBoxRef: selectOrderingBoxRef,
    dropdownRef: dropdownOrderingRef,
  } = useDropdownPosition({ dependencies: [ordering] });

  const updateScrollButtons = () => {
    const container = scrollContainer.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    targetScrollLeft.current = scrollLeft;

    setScrollStatus({
      canScrollLeft: scrollLeft > 1,
      canScrollRight: scrollLeft + clientWidth < scrollWidth - 1
    });
  };

  useEffect(() => {
    const container = scrollContainer.current;
    if (container) {
      targetScrollLeft.current = container.scrollLeft;
      updateScrollButtons();
      container.addEventListener("scroll", updateScrollButtons);
      window.addEventListener("resize", updateScrollButtons);
      return () => {
        container.removeEventListener("scroll", updateScrollButtons);
        window.removeEventListener("resize", updateScrollButtons);
      };
    }
  }, [totalItems]);

  const handleScroll = (direction) => {
    const container = scrollContainer.current;
    if (!container) return;
    const firstChild = container.firstElementChild;
    if (!firstChild) return;

    const containerStyle = window.getComputedStyle(container);
    const columnGap = parseFloat(containerStyle.columnGap) || 0;
    const itemWidth = firstChild.offsetWidth + columnGap;
    const scrollDistance = itemWidth + columnGap;

    let newTarget;
    if (direction === "left") {
      newTarget = targetScrollLeft.current - scrollDistance;
    } else {
      newTarget = targetScrollLeft.current + scrollDistance;
    }

    const maxScroll = container.scrollWidth - container.clientWidth;
    newTarget = Math.max(0, Math.min(newTarget, maxScroll));

    targetScrollLeft.current = newTarget;
    container.scrollTo({ left: newTarget });
  };

  return (
    <div className={css["search-page__main"]}>
      {isLoading ? (
        <Loader />
      ) : (
        <div className={css["search-page__content"]}>
          {totalItems > 0 ? (
            <>
              <h1 className={css["search-results__header"]}>
                <Breadcrumbs items={[{ name: "Пошук" }]} />
                Результати за пошуком «{decodeURIComponent(query)}»
                <span className={css["search-results__count"]}>
                  {totalItems}
                </span>
              </h1>
              <div className={css["available-categories-wrapper"]}>
                <button
                  className={`${css["scroll-btn"]} ${css["left"]} ${scrollStatus.canScrollLeft ? css["active"] : ""}`}
                  onClick={() => handleScroll("left")}
                >
                  <img src={`${process.env.NEXT_PUBLIC_URL}/svg/up.svg`} alt="Left" />
                </button>
                {categories.length > 0 && (
                  <>
                    <div className={css["available-categories"]} ref={scrollContainer}>
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/catalog/${cat.slug}?name=${query}`}
                          className={css["available-categories__link"]}
                          prefetch={false}
                        >
                          <span>
                            {cat.name} <i>({cat.count})</i>
                          </span>
                        </Link>
                      ))}
                    </div>
                    <Scrollbar
                      scrollContainerRef={scrollContainer}
                      dependencies={[categories]}
                    />
                  </>
                )}
                <button
                  className={`${css["scroll-btn"]} ${css["right"]} ${scrollStatus.canScrollRight ? css["active"] : ""}`}
                  onClick={() => handleScroll("right")}
                >
                  <img src={`${process.env.NEXT_PUBLIC_URL}/svg/up.svg`} alt="Right" />
                </button>
              </div>
              <div className={css["search-results__sort-list-wrapper"]}>
                <div className={css["search-results__sort-list"]}>
                  <div className={css["search-results__btn-wrapper"]}>
                    <button
                      className={`${css["search-results__btn-sort"]} ${
                        ordering === "-popularity" ? css["active"] : ""
                      }`}
                      onClick={() => handleOrderingChange("-popularity")}
                    >
                      За популярністю
                    </button>
                  </div>
                  <div className={css["search-results__btn-wrapper"]}>
                    <button
                      className={`${css["search-results__btn-sort"]} ${
                        ordering === "price" ? css["active"] : ""
                      }`}
                      onClick={() => handleOrderingChange("price")}
                    >
                      За зростанням ціни
                    </button>
                  </div>
                  <div className={css["search-results__btn-wrapper"]}>
                    <button
                      className={`${css["search-results__btn-sort"]} ${
                        ordering === "-price" ? css["active"] : ""
                      }`}
                      onClick={() => handleOrderingChange("-price")}
                    >
                      За зниженням ціни
                    </button>
                  </div>
                </div>
                <div
                  className={`${css["search-results__select-sort-box"]} ${isDropdownOrderingOpen ? css["open"] : ""}`}
                  onClick={() => setIsDropdownOrderingOpen((prev) => !prev)}
                  ref={selectOrderingBoxRef}
                >
                  <div className={css["search-results__selected-item"]}>
                    {ordering === "-popularity" ?
                      "За популярністю" : ordering === "price" ?
                        "За зростанням ціни" : "За зниженням ціни"}
                  </div>
                  <div
                    className={`${css["search-results__select-arrow"]} ${
                      isDropdownOrderingOpen ? css["open"] : ""
                    }`}
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_URL}/svg/caret-down.svg`}
                      alt="Arrow"
                    />
                  </div>
                </div>
                {ReactDOM.createPortal(
                  <div
                    className={`${css["search-results__dropdown"]} ${isDropdownOrderingOpen ? css["open"] : ""}`}
                    ref={dropdownOrderingRef}
                  >
                    <ul
                      className={css["search-results__dropdown-results"]}
                      onClick={() => setIsDropdownOrderingOpen(false)}
                    >
                      <li
                        className={`${css["search-results__dropdown-results-item"]} ${
                          ordering === "-popularity" ? css["active"] : ""
                        }`}
                        onClick={() => handleOrderingChange("-popularity")}
                      >
                        За популярністю
                      </li>
                      <li
                        className={`${css["search-results__dropdown-results-item"]} ${
                          ordering === "price" ? css["active"] : ""
                        }`}
                        onClick={() => handleOrderingChange("price")}
                      >
                        За зростанням ціни
                      </li>
                      <li
                        className={`${css["search-results__dropdown-results-item"]} ${
                          ordering === "-price" ? css["active"] : ""
                        }`}
                        onClick={() => handleOrderingChange("-price")}
                      >
                        За зниженням ціни
                      </li>
                    </ul>
                  </div>,
                  document.body
                )}
              </div>
              <div
                className={css["search-results__products-grid"]}
                id="products"
              >
                {products &&
                  products.length > 0 &&
                  products.map((product) => (
                    <Product key={product.code} product={product} />
                  ))}
              </div>
              {totalPages > 1 && (
                <Pagination
                  showSizeChanger={false}
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalItems}
                  onChange={handlePageChange}
                  showTitle={false}
                  className={css["pagination"]}
                />
              )}
            </>
          ) : (
            <div className={css["search-no-results"]}>
              <div className={css["search-no-results__robot-image-wrapper"]}>
                <img
                  src={`${process.env.NEXT_PUBLIC_URL}/img/robot-with-loupe.png`}
                  alt="No results found"
                  className={css["search-no-results__robot-image"]}
                />
              </div>
              <div className={css["search-no-results__content"]}>
                <div className={css["search-no-results__title"]}>
                  Результати на запит «{decodeURIComponent(query)}» відсутні
                </div>
                <ul className={css["search-no-results__list"]}>
                  <li>Перевірте написання запиту</li>
                  <li>Спробуйте більш загальні ключові слова</li>
                </ul>
                <a href="/">
                  <div className={css["search-no-results__btn-wrapper"]}>
                    <button className={css["search-no-results__btn-back"]}>
                      Перейти на головну
                    </button>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
