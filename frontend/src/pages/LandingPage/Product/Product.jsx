import { Link } from "react-router-dom";
import css from "./Product.module.css";

export function Product({ product }) {
  return (
    <Link to={`/product-detail/${product.slug}`}>
      <div className={css["product-card"]}>
        <div className={css["product-card-image-wrapper"]}>
          <img
            src={product.image}
            className={css["product-card-image"]}
            alt={product.name}
          />
        </div>
        <div className={css["product-card-body"]}>
          <p className={css["product-card-title"]}>{product.name}</p>
          <p className={css["product-card-price"]}>${product.price}</p>
        </div>
      </div>
    </Link>
  );
}
