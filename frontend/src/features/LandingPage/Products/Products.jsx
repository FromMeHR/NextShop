"use client";

import { useState, useEffect } from "react";
import { Pagination } from "antd";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Product } from "../../../components/Product/Product";
import { Loader } from "../../../components/Loader/Loader";
import css from "./Products.module.css";

export function Products({ data, page, pageSize }) {
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

  const updateQueryParams = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page);
    }
    router.push(`/?${params.toString()}`, { scroll: false });
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
    <div className={css["products__main"]} id="products">
      {isLoading ? (
        <Loader />
      ) : (
        <div className={css["products__content"]}>
          <div className={css["products-grid"]}>
            {products && products.length > 0 ? (
              products.map((product) => (
                <Product key={product.id} product={product} />
              ))
            ) : (
              <p>Товари не знайдено</p>
            )}
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
      )}
    </div>
  );
}
