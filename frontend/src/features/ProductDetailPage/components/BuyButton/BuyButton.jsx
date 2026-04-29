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
      aria-label="Додати до кошика"
    >
      <span>
        Купити
      </span>
    </button>
  );
}