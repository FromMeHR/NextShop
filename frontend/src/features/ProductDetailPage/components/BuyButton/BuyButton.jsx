"use client";

import { useCart } from "../../../../hooks/useCart";
import { useModal } from "../../../../hooks/useModal";
import css from "./BuyButton.module.css";

export function BuyButton({ product }) {
  const { addToCart } = useCart();
  const { openModal } = useModal();

  return (
    <button
      className={css["buy-now-button"]}
      onClick={() => {
        addToCart(product.code);
        openModal("cart");
      }}
    >
      <span>
        <img
          src={`${process.env.NEXT_PUBLIC_URL}/svg/cart.svg`}
          alt="Cart icon link"
        />
        Купити
      </span>
    </button>
  );
}