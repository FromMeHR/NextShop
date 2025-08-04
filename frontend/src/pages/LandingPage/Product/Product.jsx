import { Link } from "react-router-dom";
import { useCart } from "../../../hooks/useCart";
import {
  PRODUCT_STOCK_STATUS,
  PRODUCT_STOCK_STATUS_LABELS,
} from "../../../constants/constants";
import css from "./Product.module.css";

export function Product({ product }) {
  const { addToCart } = useCart();

  return (
    <Link to={`/product-detail/${product.slug}`}>
      <div
        className={`${css["product-card"]} ${
          product.stock_status === PRODUCT_STOCK_STATUS.OUT_OF_STOCK
            ? css["product-card-out-of-stock"]
            : ""
        }`}
      >
        <div className={css["product-card-image-wrapper"]}>
          <img
            src={product.image}
            className={css["product-card-image"]}
            alt={product.name}
          />
        </div>
        <div className={css["product-card-body"]}>
          <p className={css["product-card-title"]}>{product.name}</p>
        </div>
        {product.stock_status !== PRODUCT_STOCK_STATUS.OUT_OF_STOCK ? (
          <div className={css["product-card-footer"]}>
            <p className={css["product-card-price"]}>
              {product.price} <span>₴</span>
            </p>
            <button
              type="button"
              className={css["product-cart-button"]}
              onClick={(e) => {
                e.preventDefault();
                addToCart(product.id);
                document.getElementById("cart-button").click();
              }}
            >
              <img
                src={`${process.env.REACT_APP_PUBLIC_URL}/svg/cart.svg`}
                alt="Cart icon link"
              />
            </button>
          </div>
        ) : (
          <p className={css["product-card-out-of-stock-text"]}>
            {PRODUCT_STOCK_STATUS_LABELS[product.stock_status]}
          </p>
        )}
      </div>
    </Link>
  );
}
