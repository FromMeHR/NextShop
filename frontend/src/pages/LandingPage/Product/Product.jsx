import { Link } from "react-router-dom";
import { useCart } from "../../../hooks/useCart";
import css from "./Product.module.css";

export function Product({ product }) {
  const { cart, addToCart } = useCart();

  return (
    <Link to={`/product-detail/${product.slug}`}>
      <div
        className={`${css["product-card"]} ${
          product.quantity === 0 ? css["product-card-out-of-stock"] : ""
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
        {product.quantity > 0 ? (
          <div className={css["product-card-footer"]}>
            <p className={css["product-card-price"]}>${product.price}</p>
            <button
              type="button"
              className={css["product-cart-button"]}
              onClick={(e) => {
                e.preventDefault();
                addToCart(product.id);
                cart.length > 0 &&
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
          <p className={css["product-card-out-of-stock-text"]}>Out of stock</p>
        )}
      </div>
    </Link>
  );
}
