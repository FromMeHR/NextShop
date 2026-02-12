"use client";

import { useCart } from "../../../hooks/useCart";
import { useModal } from "../../../hooks/useModal";
import css from "./AddToCartButton.module.css";

export function AddToCartButton({ productCode }) {
  const { addToCart } = useCart();
  const { openModal } = useModal();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(productCode);
    openModal("cart");
  };

  return (
    <button
      type="button"
      className={css["product-cart-button"]}
      onClick={handleAddToCart}
    >
      <img
        src={`${process.env.NEXT_PUBLIC_URL}/svg/cart.svg`}
        alt="Cart icon"
      />
    </button>
  );
}
