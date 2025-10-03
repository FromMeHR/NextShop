"use client";

import { useState, useEffect } from "react";
import { Pagination } from "antd";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Product } from "../../components/Product/Product";
import { Loader } from "../../components/Loader/Loader";
import css from "./SearchPage.module.css";

export function SearchPage({ data, page, pageSize, query }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState(page || 1);
  const [isLoading, setIsLoading] = useState(false);

  const products = data ? data.results : [];
  const totalItems = data ? data.total_items : 0;
  const totalPages = data ? data.total_pages : 0;

  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  const updateQueryParams = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete("page");
    } else {
      params.set("page", newPage.toString());
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    const productsElement = document.getElementById("products");
    if (productsElement) {
      productsElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePageChange = (page) => {
    setIsLoading(true);
    setCurrentPage(page);
    updateQueryParams(page);
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
                Результати за пошуком «{decodeURIComponent(query)}»
                <span className={css["search-results__count"]}>
                  {totalItems}
                </span>
              </h1>
              <div
                className={css["search-results__products-grid"]}
                id="products"
              >
                {products &&
                  products.length > 0 &&
                  products.map((product) => (
                    <Product key={product.id} product={product} />
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
