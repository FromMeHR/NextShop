"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Pagination } from "antd";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Product } from "../../components/Product/Product";
import { useDropdownPosition } from "../../hooks/useDropdownPosition";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { useCategories } from "../../hooks/useCategories";
import { findCategoryPath } from "../../utils/findCategoryPath";
import { Loader } from "../../components/Loader/Loader";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import { ErrorPage404 } from "../ErrorPage/ErrorPage404";
import debounce from "lodash/debounce";
import ReactDOM from "react-dom";
import css from "./CatalogPage.module.css";

export function CatalogPage({ products: data, filters, priceRange, currentPrice, currentName, currentCategory, urlFilters, page, pageSize, currentOrdering }) {
  const { lock, unlock } = useBodyScrollLock();
  const { categories } = useCategories();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState(page || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenMobileFilters, setIsOpenMobileFilters] = useState(false);
  const [openedPriceFilter, setOpenedPriceFilter] = useState(true);
  const [openedFilters, setOpenedFilters] = useState(
    filters?.length > 0 ? filters.map((filter) => filter.id) : []
  );
  const [selectedFilters, setSelectedFilters] = useState(urlFilters || []);
  const [filtersData, setFiltersData] = useState(filters);
  const [previewCount, setPreviewCount] = useState(data?.total_items || 0);
  const [applyBtnPos, setApplyBtnPos] = useState({ top: 0, left: 0, visible: false });

  const validateUrlPrice = (priceStr, minLimit, maxLimit) => {
    let min = minLimit;
    let max = maxLimit;

    if (priceStr && priceStr.includes("-")) {
      const [a, b] = priceStr.split("-");
      min = parseInt(a);
      max = parseInt(b);
    }

    if (
      Number.isNaN(min) || Number.isNaN(max) ||
      min < minLimit || max > maxLimit || min > max
    ) {
      return { min: minLimit, max: maxLimit };
    }
    return { min, max };
  };
  const minLimit = priceRange?.min || 0;
  const maxLimit = priceRange?.max || 100000;
  const [priceValues, setPriceValues] = useState(() => {
    return validateUrlPrice(currentPrice, minLimit, maxLimit);
  });
  const [priceInputValues, setPriceInputValues] = useState(() => {
    return validateUrlPrice(currentPrice, minLimit, maxLimit);
  });
  const sliderRef = useRef(null);
  const activeHandleRef = useRef("min");

  const filtersColRef = useRef(null);
  const lastClickedFilterRef = useRef(null);

  const products = data?.results || [];
  const totalItems = data?.total_items || 0;
  const totalPages = data?.total_pages || 0;

  useEffect(() => {
    setIsLoading(false);
    setApplyBtnPos({ visible: false });
    setSelectedFilters(urlFilters || []);
    setIsOpenMobileFilters(false);
  }, [pathname, searchParams, urlFilters]);

  useEffect(() => {
    setFiltersData(filters);
    setPreviewCount(data?.total_items || 0);
    setSelectedFilters(urlFilters || []);
  }, [filters, data?.total_items, urlFilters]);

  const detectActiveHandle = useCallback((min, max) => {
    if (min !== max) return activeHandleRef.current;
    const center = (minLimit + maxLimit) / 2;
    return min < center ? "max" : "min";
  }, [minLimit, maxLimit]);

  useEffect(() => {
    const { min, max } = validateUrlPrice(currentPrice, minLimit, maxLimit);

    setPriceValues({ min, max });
    setPriceInputValues({ min, max });

    const handle = detectActiveHandle(min, max);
    activeHandleRef.current = handle;
  }, [currentPrice, minLimit, maxLimit, detectActiveHandle]);

  useEffect(() => {
    const handleResize = () => {
      if (isOpenMobileFilters && window.innerWidth <= 768) {
        lock("catalog-page");
      } else {
        unlock("catalog-page");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpenMobileFilters, lock, unlock]);

  useEffect(() => {
    if (isOpenMobileFilters && window.innerWidth <= 768) {
      lock("catalog-page");
    } else {
      unlock("catalog-page");
    }
  }, [isOpenMobileFilters, lock, unlock]);

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
    setIsLoading(true);
    setCurrentPage(page);
    updateQueryParams(page, currentOrdering);
    const productsElement = document.getElementById("products");
    if (productsElement) {
      productsElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOrderingChange = (ordering) => {
    setIsLoading(true);
    updateQueryParams(page, ordering);
  };

  const updateButtonPosition = () => {
    if (lastClickedFilterRef.current && filtersColRef.current) {
      const labelRect = lastClickedFilterRef.current.getBoundingClientRect();
      const colRect = filtersColRef.current.getBoundingClientRect();
      const scrollTop = filtersColRef.current.scrollTop;

      const isMobile = window.innerWidth <= 968;
      const isPriceSlider = lastClickedFilterRef.current === sliderRef.current;
      const extraOffset = isMobile && isPriceSlider ? 25 : 0;

      const top =
        labelRect.top -
        colRect.top +
        scrollTop +
        labelRect.height / 2 +
        extraOffset;

      if (isMobile) {
        setApplyBtnPos({
          top,
          right: 10,
          left: "auto",
          visible: true,
        });
      } else {
        setApplyBtnPos({
          top,
          left: labelRect.width + 40,
          right: "auto",
          visible: true,
        });
      }
    }
  };

  const handleFilterChange = async (e, filterSlug) => {
    let newFilters;
    if (selectedFilters.includes(filterSlug)) {
      newFilters = selectedFilters.filter((f) => f !== filterSlug);
    } else {
      newFilters = [...selectedFilters, filterSlug];
    }
    setSelectedFilters(newFilters);

    lastClickedFilterRef.current = e.currentTarget;
    updateButtonPosition();

    debouncedUpdateCounts(newFilters, priceValues, currentName);
  };

  const updateFilterCounts = useCallback(async (currentFilters, currentPrices, currentName) => {
    const params = new URLSearchParams();
    if (currentFilters.length > 0) params.set("attributes", currentFilters.join(","));
    if (currentPrices.min !== minLimit || currentPrices.max !== maxLimit) {
      params.set("price", `${currentPrices.min}-${currentPrices.max}`);
    }
    if (currentName) params.set("name", currentName);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
      const res = await fetch(`${baseUrl}/api/categories/${currentCategory.slug}/filters/?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFiltersData(data.filters);
        setPreviewCount(data.total_count);
      }
    } catch (error) {
      console.error("Failed to update filter counts", error);
    }
  }, [currentCategory?.slug, minLimit, maxLimit]);

  const debouncedUpdateCounts = useMemo(
    () => debounce((filters, prices, name) => {
      updateFilterCounts(filters, prices, name);
    }, 300),
    [updateFilterCounts]
  );

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (priceValues.min !== minLimit || priceValues.max !== maxLimit) {
      params.set("price", `${priceValues.min}-${priceValues.max}`);
    } else {
      params.delete("price");
    }

    let newPath = `/catalog/${currentCategory.slug}`;
    if (selectedFilters.length > 0) {
      newPath += `/filter/${selectedFilters.join("/")}`;
    }

    params.delete("page");
    router.push(`${newPath}?${params.toString()}`, { scroll: false });
    setApplyBtnPos({ visible: false });
    window.scrollTo(0, 0, { behavior: "smooth" });
  };

  useEffect(() => {
    const handleResize = () => {
      if (applyBtnPos.visible) {
        updateButtonPosition();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [applyBtnPos.visible]);

  useEffect(() => {
    setTimeout(() => applyBtnPos.visible && updateButtonPosition(), 300);
  }, [openedFilters, openedPriceFilter, applyBtnPos.visible]);

  const handlePriceInputChange = (e, type) => {
    const val = e.target.value.replace(/\D/g, "");
    setPriceInputValues((prev) => ({ ...prev, [type]: val }));

    activeHandleRef.current = type;
  };

  const validatePrice = (type) => {
    activeHandleRef.current = type;

    let min = parseInt(priceInputValues.min);
    let max = parseInt(priceInputValues.max);

    if (isNaN(min)) min = minLimit;
    if (isNaN(max)) max = maxLimit;

    if (type === "min") {
      if (min < minLimit) {
        min = minLimit;
      } else if (min > max) {
        min = max;
      }
    } else if (type === "max") {
      if (max > maxLimit) {
        max = maxLimit;
      } else if (max < min) {
        max = min;
      }
    }

    const newPrices = { min, max };
    setPriceValues(newPrices);
    setPriceInputValues({ min: min.toString(), max: max.toString() });

    lastClickedFilterRef.current = sliderRef.current;
    updateButtonPosition();
  };

  const valueToPercent = (value) =>
    ((value - minLimit) / (maxLimit - minLimit)) * 100;

  const percentToValue = (percent) =>
    Math.round(minLimit + (percent / 100) * (maxLimit - minLimit));

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  const moveHandle = (clientX) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const styles = getComputedStyle(sliderRef.current);
    const paddingLeft = parseFloat(styles.paddingLeft);
    const paddingRight = parseFloat(styles.paddingRight);

    const usableWidth = rect.width - paddingLeft - paddingRight;

    let x = clientX - rect.left - paddingLeft;
    x = clamp(x, 0, usableWidth);

    let percent = (x / usableWidth) * 100;
    let value = percentToValue(percent);

    setPriceValues((prev) => {
      let nextValues;
      if (activeHandleRef.current === "min") {
        const validatedMin = Math.min(value, prev.max);
        nextValues = { ...prev, min: validatedMin };
      } else {
        const validatedMax = Math.max(value, prev.min);
        nextValues = { ...prev, max: validatedMax };
      }
      setPriceInputValues({
        min: nextValues.min.toString(),
        max: nextValues.max.toString()
      });
      return nextValues;
    });
  };

  const startDrag = (handle) => (e) => {
    e.preventDefault();
    activeHandleRef.current = handle;

    lastClickedFilterRef.current = sliderRef.current;
    updateButtonPosition();

    const move = (ev) =>
      moveHandle(ev.touches ? ev.touches[0].clientX : ev.clientX);

    const stop = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", stop);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", move);
    window.addEventListener("touchend", stop);
  };

  const startDragFromTrack = (clientX) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();

    const minPx = rect.left + (valueToPercent(priceValues.min) / 100) * rect.width;
    const maxPx = rect.left + (valueToPercent(priceValues.max) / 100) * rect.width;

    const distToMin = Math.abs(clientX - minPx);
    const distToMax = Math.abs(clientX - maxPx);

    let handle;
    if (distToMin === distToMax) {
      handle = detectActiveHandle(priceValues.min, priceValues.max);
    } else {
      handle = distToMin < distToMax ? "min" : "max";
    }

    activeHandleRef.current = handle;

    moveHandle(clientX);

    lastClickedFilterRef.current = sliderRef.current;
    updateButtonPosition();

    const move = (ev) =>
      moveHandle(ev.touches ? ev.touches[0].clientX : ev.clientX);

    const stop = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", stop);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", move);
    window.addEventListener("touchend", stop);
  };

  const isChecked = (slug) => selectedFilters.includes(slug);

  const {
    isOpen: isDropdownOrderingOpen,
    setIsOpen: setIsDropdownOrderingOpen,
    selectBoxRef: selectOrderingBoxRef,
    dropdownRef: dropdownOrderingRef,
  } = useDropdownPosition({ dependencies: [currentOrdering] });

  const categoryPath = findCategoryPath(categories, currentCategory?.slug) || [];
  const breadcrumbItems = [
    ...categoryPath
      .filter((cat) => cat.slug !== null)
      .map((cat, index, filteredArray) => {
        const isLast = index === filteredArray.length - 1;
        const fullPath = filteredArray
          .slice(0, index + 1)
          .map((c) => c.slug)
          .join("/");
        return {
          name: cat.name,
          href: isLast
            ? null
            : (cat.children?.length > 0
                ? `/category/${fullPath}`
                : `/catalog/${cat.slug}`),
        };
      }),
  ];

  return (
    <>
      {currentCategory ? (
        isLoading ? (
          <Loader />
        ) : (
          <div className={css["catalog-page__main"]}>
            <div className={css["catalog-page__content"]}>
              <h1 className={css["search-results__header"]}>
                <Breadcrumbs items={breadcrumbItems} />
                {currentCategory.name}
                <span className={css["search-results__count"]}>
                  {totalItems}
                </span>
                {currentName && (
                  <span className={css["search-results__search-text"]}>
                    (за пошуком «{decodeURIComponent(currentName)}»)
                  </span>
                )}
              </h1>
              <div className={css["search-results__sort-list-wrapper"]}>
                <div className={css["search-results__sort-list"]}>
                  <div className={css["search-results__btn-wrapper"]}>
                    <button
                      className={`${css["search-results__btn-sort"]} ${
                        currentOrdering === "-popularity" ? css["active"] : ""
                      }`}
                      onClick={() => handleOrderingChange("-popularity")}
                    >
                      За популярністю
                    </button>
                  </div>
                  <div className={css["search-results__btn-wrapper"]}>
                    <button
                      className={`${css["search-results__btn-sort"]} ${
                        currentOrdering === "price" ? css["active"] : ""
                      }`}
                      onClick={() => handleOrderingChange("price")}
                    >
                      За зростанням ціни
                    </button>
                  </div>
                  <div className={css["search-results__btn-wrapper"]}>
                    <button
                      className={`${css["search-results__btn-sort"]} ${
                        currentOrdering === "-price" ? css["active"] : ""
                      }`}
                      onClick={() => handleOrderingChange("-price")}
                    >
                      За зниженням ціни
                    </button>
                  </div>
                </div>
                <button
                  className={css["search-results__mobile-filters-show-btn"]}
                  onClick={() => setIsOpenMobileFilters((prev) => !prev)}
                >
                  <span>
                    <img
                      src={`${process.env.NEXT_PUBLIC_URL}/svg/filter.svg`}
                      alt="Filter icon"
                    />
                    Фільтри
                  </span>
                </button>
                <div
                  className={`${css["search-results__mobile-select-sort-box"]} ${isDropdownOrderingOpen ? css["open"] : ""}`}
                  onClick={() => setIsDropdownOrderingOpen((prev) => !prev)}
                  ref={selectOrderingBoxRef}
                >
                  <div className={css["search-results__selected-item"]}>
                    {currentOrdering === "-popularity" ?
                      "За популярністю" : currentOrdering === "price" ?
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
                          currentOrdering === "-popularity" ? css["active"] : ""
                        }`}
                        onClick={() => handleOrderingChange("-popularity")}
                      >
                        За популярністю
                      </li>
                      <li
                        className={`${css["search-results__dropdown-results-item"]} ${
                          currentOrdering === "price" ? css["active"] : ""
                        }`}
                        onClick={() => handleOrderingChange("price")}
                      >
                        За зростанням ціни
                      </li>
                      <li
                        className={`${css["search-results__dropdown-results-item"]} ${
                          currentOrdering === "-price" ? css["active"] : ""
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
              <div className={css["search-results__main-container"]}>
                <div
                  ref={filtersColRef}
                  className={`${css["search-results__filters-col"]} ${isOpenMobileFilters ? css["open"] : ""}`}
                >
                  <button
                    className={css["search-results__mobile-close-btn"]}
                    onClick={() => setIsOpenMobileFilters(false)}
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_URL}/svg/delete.svg`}
                      alt="Close icon"
                    />
                  </button>
                  <div className={`${css["filter-item-price"]} ${openedPriceFilter ? css["open"] : ""}`}>
                    <div
                      className={css["filter-item__header"]}
                      onClick={() => setOpenedPriceFilter(!openedPriceFilter)}
                    >
                      <span>Ціна (грн)</span>
                      <button
                        className={css["filter-item__reset-btn"]}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/catalog/${currentCategory.slug}`);
                        }}
                      >
                        Скинути
                      </button>
                      <div className={css["filter-item__select-arrow"]}>
                        <img
                          src={`${process.env.NEXT_PUBLIC_URL}/svg/caret-down.svg`}
                          alt="Arrow"
                        />
                      </div>
                    </div>
                    <div className={css["filter-item__content-wrapper"]}>
                      <div className={css["filter-item__content"]}>
                        <div className={css["filter-item__content--body"]}>
                          <div className={css["filter-item__price-slider-box"]}>
                            <input
                              value={priceInputValues.min}
                              onChange={(e) => handlePriceInputChange(e, "min")}
                              onBlur={() => validatePrice("min")}
                              onKeyDown={(e) => (e.key === "Enter" || e.key === "Tab") && validatePrice("min")}
                              className={css["filter-item__price-slider--input"]}
                            />
                            <span className={css["filter-item__price-slider--to"]}>-</span>
                            <input
                              value={priceInputValues.max}
                              onChange={(e) => handlePriceInputChange(e, "max")}
                              onBlur={() => validatePrice("max")}
                              onKeyDown={(e) => (e.key === "Enter" || e.key === "Tab") && validatePrice("max")}
                              className={css["filter-item__price-slider--input"]}
                            />
                          </div>
                          <div
                            ref={sliderRef}
                            className={css["filter-item__price-slider-range-wrapper"]}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              startDragFromTrack(e.clientX);
                            }}
                            onTouchStart={(e) => {
                              startDragFromTrack(e.touches[0].clientX);
                            }}
                          >
                            <div className={css["filter-item__price-slider-range"]}>
                              <div
                                className={css["filter-item__price-ui-slider-range"]}
                                style={{
                                  left: `${valueToPercent(priceValues.min)}%`,
                                  width: `${valueToPercent(priceValues.max) - valueToPercent(priceValues.min)}%`,
                                }}
                              />
                              <span
                                className={css["filter-item__price-ui-slider-handle"]}
                                style={{
                                  left: `${valueToPercent(priceValues.min)}%`,
                                  zIndex: activeHandleRef.current === "min" ? 2 : 1,
                                }}
                                onMouseDown={startDrag("min")}
                                onTouchStart={startDrag("min")}
                              />
                              <span
                                className={css["filter-item__price-ui-slider-handle"]}
                                style={{
                                  left: `${valueToPercent(priceValues.max)}%`,
                                  zIndex: activeHandleRef.current === "max" ? 2 : 1,
                                }}
                                onMouseDown={startDrag("max")}
                                onTouchStart={startDrag("max")}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {filtersData.length > 0 && filtersData.map((filter) => (
                    <div
                      key={filter.id}
                      className={`${css["filter-item"]} ${openedFilters.includes(filter.id) ? css["open"] : ""}`}
                    >
                      <div
                        className={css["filter-item__header"]}
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenedFilters(
                            openedFilters.includes(filter.id)
                              ? openedFilters.filter((id) => id !== filter.id)
                              : [...openedFilters, filter.id]
                          );
                        }}
                      >
                        <span>{filter?.name}</span>
                        <div className={css["filter-item__select-arrow"]}>
                          <img
                            src={`${process.env.NEXT_PUBLIC_URL}/svg/caret-down.svg`}
                            alt="Arrow"
                          />
                        </div>
                      </div>
                      <div className={css["filter-item__content-wrapper"]}>
                        <div className={css["filter-item__content"]}>
                          <div className={css["filter-item__content--body"]}>
                            {filter?.children.map((child) => (
                              <div
                                key={child.id}
                                className={`${css["filter-item__child"]} ${child.quantity === 0 ? css["disabled"] : ""}`}
                              >
                                <div
                                  className={`${css["filter-item__label"]} ${isChecked(child.slug) ? css["active"] : ""}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleFilterChange(e, child.slug);
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    className={css["filter-item__checkbox"]}
                                    checked={isChecked(child.slug)}
                                    readOnly
                                  />
                                  <span className={css["filter-item__checkbox-mark"]}></span>
                                  <span>{child.name}</span>
                                  <span className={`${css["filter-item__quantity"]} ${(child.is_additive && child.quantity) > 0 ? css["is-additive"] : ""}`}>
                                    ({(child.is_additive && child.quantity > 0) ? `+${child.quantity}` : child.quantity})
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <span
                    className={`${css["apply-btn-wrapper"]} ${applyBtnPos.visible ? css["visible"] : ""}`}
                    style={{
                      top: `${applyBtnPos.top}px`,
                      left: applyBtnPos.left !== "auto" ? `${applyBtnPos.left}px` : "auto",
                      right: applyBtnPos.right !== "auto" ? `${applyBtnPos.right}px` : "auto",
                    }}
                  >
                    <button
                      className={css["apply-btn"]}
                      onClick={() => filters.length > 0 && applyFilters()}
                    >
                      Показати ({previewCount})
                    </button>
                  </span>
                </div>
                {totalItems > 0 ? (
                  <div className={css["search-results__products-col"]}>
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
                  </div>
                ) : (
                  <div className={css["search-no-results__title"]}>
                    За даними критеріями не знайдено жодного товару.
                  </div>
                )}
              </div>
            </div>
          </div>
          )
      ) : (
        <ErrorPage404 />
      )}
    </>
  );
}
