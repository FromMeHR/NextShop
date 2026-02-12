"use client";

import { useRef } from "react";
import Link from "next/link";
import { Scrollbar } from "../../../components/Scrollbar/Scrollbar";
import css from "../ProductDetailPage.module.css";

export function VariantSelector({ variants }) {
  return (
    <div className={css["block-specific"]}>
      <div className={css["block-specific__content"]}>
        {variants.map((variant) => (
          <VariantGroup key={variant.id} variant={variant} />
        ))}
      </div>
    </div>
  );
}

function VariantGroup({ variant }) {
  const scrollContainer = useRef(null);

  return (
    <div className={css["block-specific__item-variant-row"]}>
      <div className={css["block-specific__item-variant-row-up"]}>
        <div className={css["block-specific__item-variant-row-header"]}>
          {variant.name}
        </div>
      </div>
      <div
        className={css["block-specific__item-variant-row-down"]}
        ref={scrollContainer}
      >
        {variant.items.map((item) => (
          <Link
            href={`/product-detail/${item.slug}`}
            prefetch={false}
            className={`${css["block-specific__item-variant-row-item"]} ${
              item.is_active ? css["active"] : ""
            }`}
            key={item.id}
          >
            <span className={css["block-specific__item-variant-row-label"]}>
              {item.label}
            </span>
            <span className={css["block-specific__item-variant-row-price"]}>
              {item.price}
            </span>
          </Link>
        ))}
      </div>
      <Scrollbar scrollContainerRef={scrollContainer} />
    </div>
  );
}