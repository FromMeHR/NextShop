import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "antd";
import { useParams, useSearchParams } from "react-router-dom";
import { Loader } from "../../components/Loader/Loader";
import { Product } from "../../pages/LandingPage/Product/Product";
import { DEFAULT_PAGE_SIZE } from "../../constants/constants";
import { useWindowWidth } from "../../hooks/useWindowWidth";
import { definePageSize } from "../../utils/definePageSize";
import axios from "axios";
import useSWR from "swr";
import css from "./SearchPage.module.css";

const fetcher = async (url) => {
  const response = await axios.get(url);
  return response.data;
};

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { query } = useParams();
  const pageNumber = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(pageNumber);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const baseUrl = process.env.REACT_APP_BASE_API_URL;
  const url = `${baseUrl}/api/search/?name=${query}&ordering=name&page=${currentPage}&page_size=${pageSize}`;
  const { data, isLoading } = useSWR(url, fetcher);
  const products = data ? data.results : [];
  const totalItems = data ? data.total_items : 0;
  const totalPages = data ? data.total_pages : 0;

  const windowWidth = useWindowWidth();

  useEffect(() => {
    definePageSize(windowWidth, setPageSize);
  }, [windowWidth]);

  const updateQueryParams = (newPage) => {
    if (newPage === 1) {
      searchParams.delete("page");
    } else {
      searchParams.set("page", newPage);
    }
    setSearchParams(searchParams);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateQueryParams(page);
  };

  return (
    <>
      <div className={css["search-page__main"]}>
        <div className={css["search-page__content"]}>
          {isLoading ? (
            <Loader />
          ) : (
            <>
              {totalItems > 0 ? (
                <>
                  <h1 className={css["search-results__header"]}>
                    Search results for «{query}»
                    <span className={css["search-results__count"]}>
                      {totalItems}
                    </span>
                  </h1>
                  <div className={css["search-results__products-grid"]}>
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
                  <div
                    className={css["search-no-results__robot-image-wrapper"]}
                  >
                    <img
                      src={`${process.env.REACT_APP_PUBLIC_URL}/img/robot-with-loupe.png`}
                      alt="No results found"
                      className={css["search-no-results__robot-image"]}
                    />
                  </div>
                  <div className={css["search-no-results__content"]}>
                    <div className={css["search-no-results__title"]}>
                      No results found for «{query}»
                    </div>
                    <ul className={css["search-no-results__list"]}>
                      <li>Check your spelling</li>
                      <li>Try more general keywords</li>
                    </ul>
                    <Link to="/" reloadDocument>
                      <div className={css["search-no-results__btn-wrapper"]}>
                        <button className={css["search-no-results__btn-back"]}>
                          Back to main
                        </button>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
