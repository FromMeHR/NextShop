"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import css from "../ProductDetailPage.module.css";

export function ProductSpecs({ product }) {
  const specsRef = useRef(null);
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(false);
  const [needsSpecsToggle, setNeedsSpecsToggle] = useState(false);

  useEffect(() => {
    if (specsRef.current?.scrollHeight > 500) {
      setNeedsSpecsToggle(true);
    }
  }, [product]);

  const toggleSpecs = () => {
    if (isSpecsExpanded) {
      specsRef.current?.parentElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setIsSpecsExpanded(!isSpecsExpanded);
  };

  return (
    <div className={css["block-specific"]}>
      <div className={css["block-specific__title"]}>
        <strong>Характеристики</strong> {product.name}
      </div>
      <div
        ref={specsRef}
        className={`${css["block-specific__content"]} ${
          needsSpecsToggle && !isSpecsExpanded ? css["hidden"] : ""
        }`}
      >
        {product.attributes.map((attribute) => (
          <React.Fragment key={attribute.id}>
            <div className={css["block-specific__item-header"]}>
              {attribute.name}
            </div>
            {attribute.children.map((child) => (
              <div className={css["block-specific__item-row"]} key={child.id}>
                <div className={css["block-specific__item-row-left"]}>
                  {child.name}
                </div>
                <div className={css["block-specific__item-row-right"]}>
                  {child.show_in_filters ? (
                    <Link
                      target="_blank"
                      href={`${process.env.NEXT_PUBLIC_URL}/catalog/${product.category.slug}/filter/${child.children[0].slug}`}
                      prefetch={false}
                    >
                      {child.children?.[0].name}
                    </Link>
                  ) : (
                    <>{child.children?.[0].name}</>
                  )}
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
      {needsSpecsToggle && (
        <div className={css["block-specific__toggle-btn-wrapper"]}>
          <button
            className={css["block-specific__toggle-btn"]}
            onClick={toggleSpecs}
          >
            {isSpecsExpanded ? "Приховати" : "Показати повністю"}
          </button>
        </div>
      )}
    </div>
  );
}
