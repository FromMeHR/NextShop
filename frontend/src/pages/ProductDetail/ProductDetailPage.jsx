import axios from "axios";
import useSWR from "swr";
import { useParams } from "react-router-dom";
import { Loader } from "../../components/Loader/Loader";
import { ErrorPage404 } from "../ErrorPage/ErrorPage404";
import { RelatedProducts } from "./RelatedProducts/RelatedProducts";
import { useCart } from "../../hooks/useCart";
import {
  PRODUCT_STOCK_STATUS,
  PRODUCT_STOCK_STATUS_LABELS,
} from "../../constants/constants";
import css from "./ProductDetailPage.module.css";

const fetcher = async (url) => {
  const response = await axios.get(url);
  return response.data;
};

export function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const baseUrl = process.env.REACT_APP_BASE_API_URL;
  const {
    data: product,
    error,
    isLoading,
  } = useSWR(`${baseUrl}/api/products/${slug}/`, fetcher);

  return error ? (
    <ErrorPage404 />
  ) : (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className={css["product-detail__main"]}>
            <div className={css["product-detail__content"]}>
              <div className={css["product-detail__row"]}>
                <div className={css["product-detail__image-wrapper"]}>
                  <img
                    className={css["product-detail__image"]}
                    src={product.image}
                    alt={product.name}
                  />
                </div>
                <div className={css["product-detail__info"]}>
                  <div className={css["product-detail__categories"]}>
                    Категорії:{" "}
                    {product.categories.map((cat) => cat.name).join(", ")}
                  </div>
                  <h2 className={css["product-detail__title"]}>
                    {product.name}
                  </h2>
                  <p className={css["product-detail__description"]}>
                    {product.description}
                  </p>
                  <div className={css["product-detail__price"]}>
                    <span>{product.price} ₴</span>
                  </div>
                  {product.stock_status === PRODUCT_STOCK_STATUS.OUT_OF_STOCK ? (
                    <div
                      className={`${css["product-detail__status"]} ${css["out-of-stock"]}`}
                    >
                      {PRODUCT_STOCK_STATUS_LABELS[product.stock_status]}
                    </div>
                  ) : (
                    <>
                      <div
                        className={`${css["product-detail__status"]} ${
                          product.stock_status === PRODUCT_STOCK_STATUS.IN_STOCK
                            ? css["in-stock"]
                            : css["low-stock"]
                        }`}
                      >
                        {product.stock_status === PRODUCT_STOCK_STATUS.FEW_ITEMS_LEFT
                          ? PRODUCT_STOCK_STATUS_LABELS.few_items_left(
                              product.quantity
                            )
                          : PRODUCT_STOCK_STATUS_LABELS[product.stock_status]}
                      </div>
                      <button
                        className={css["buy-now-button"]}
                        onClick={() => {
                          addToCart(product.id);
                          document.getElementById("cart-button").click();
                        }}
                      >
                        <span>
                          <img
                            src={`${process.env.REACT_APP_PUBLIC_URL}/svg/cart.svg`}
                            alt="Cart icon link"
                          />
                          Купити
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <RelatedProducts relatedProducts={product.similar_products} />
        </>
      )}
    </>
  );
}
