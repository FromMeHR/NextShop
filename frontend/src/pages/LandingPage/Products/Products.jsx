import { useState, useEffect } from "react";
import { Pagination } from "antd";
import { useSearchParams } from "react-router-dom";
import useSWR from "swr";
import axios from "axios";
import { Product } from "../Product/Product";
import { Loader } from "../../../components/Loader/Loader";
import definePageSize from "../../../utils/definePageSize";
import useWindowWidth from "../../../hooks/useWindowWidth";
import { DEFAULT_PAGE_SIZE } from "../../../constants/constants";
import css from "./Products.module.css";

const fetcher = async (url) => {
  const response = await axios.get(url);
  return response.data;
};

export function Products() {
  const [queryParams, setQueryParams] = useSearchParams();
  const pageNumber = Number(queryParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(pageNumber);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const baseUrl = process.env.REACT_APP_BASE_API_URL;
  const url = `${baseUrl}/api/products/?page=${currentPage}&page_size=${pageSize}`;

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
      queryParams.delete("page");
    } else {
      queryParams.set("page", newPage);
    }
    setQueryParams(queryParams);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateQueryParams(page);
  };

  return (
    <section className="py-5" id="shop">
      <h4 className="text-center">Our Products</h4>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="container px-4 px-lg-5 mt-5">
          <div className="row justify-content-center">
            {products && products.length > 0 ? (
              products.map((product) => (
                <Product key={product.id} product={product} />
              ))
            ) : (
              <p className="text-center">No products found</p>
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
    </section>
  );
}
