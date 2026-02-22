import { formatPrice } from "../../utils/formatPrice";
import {
  PRODUCT_STOCK_STATUS,
  PRODUCT_STOCK_STATUS_LABELS,
} from "../../constants/constants";
import { AddToCartButton } from "./ProductComponents/AddToCartButton";
import Link from "next/link";
import css from "./Product.module.css";

export function Product({ product }) {
  const isOutOfStock = product.stock_status === PRODUCT_STOCK_STATUS.OUT_OF_STOCK;

  return (
    <article
      className={`${css["product-card"]} ${
        isOutOfStock ? css["product-card-out-of-stock"] : ""
      }`}
    >
      <Link href={`/product-detail/${product.slug}`} prefetch={false}>
        <div className={css["product-card-image-wrapper"]}>
          <img
            src={product.image}
            className={css["product-card-image"]}
            alt={product.name}
          />
        </div>
        <div className={css["product-card-body"]}>
          <p className={css["product-card-title"]}>
            {product.name}
          </p>
        </div>
        <footer className={css["product-card-footer"]}>
          {!isOutOfStock ? (
            <>
              <p className={css["product-card-price"]}>
                {formatPrice(product.price)}
                <span> ₴</span>
              </p>
              <AddToCartButton productCode={product.code} />
            </>
            ) : (
            <p className={css["product-card-out-of-stock-text"]}>
              {PRODUCT_STOCK_STATUS_LABELS[product.stock_status]}
            </p>
          )}
        </footer>
      </Link>
    </article>
  );
}
