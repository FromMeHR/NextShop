import { Link } from "react-router-dom";
import css from "./Product.module.css";

const Product = ({ product }) => {
  return (
    <div className={`col-6 col-md-3 ${css["product-col"]}`}>
      <Link to={`/product-detail/${product.slug}`} className={css["product-link"]}>
        <div className={css["product-card"]}>
          <div className={css["product-card-image-wrapper"]}>
            <img
              src={product.image}
              className={css["product-card-image-top"]}
              alt={product.name}
            />
          </div>
          <div className={css["product-card-body"]}>
            <h5 className={css["product-card-title"]}>{product.name.length > 25 ? product.name.slice(0, 25) + '...' : product.name}</h5>
            <h6 className={css["product-card-price"]}>${product.price}</h6>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Product;
