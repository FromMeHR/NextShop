"use client";

import { useState, useEffect, useRef } from "react";
import css from "../ProductDetailPage.module.css";

export function ProductDescription({ description, name }) {
  const descRef = useRef(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [needsDescToggle, setNeedsDescToggle] = useState(false);

  useEffect(() => {
    if (descRef.current?.scrollHeight > 500) {
      setNeedsDescToggle(true);
    }
  }, [description]);

  const toggleDesc = () => {
    if (isDescExpanded) {
      descRef.current?.parentElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setIsDescExpanded(!isDescExpanded);
  };

  return (
    <div className={css["block-specific"]}>
      <div className={css["block-specific__title"]}>
        <strong>Опис</strong> {name}
      </div>
      <div
        ref={descRef}
        className={`${css["block-specific__content"]} ${
          needsDescToggle && !isDescExpanded ? css["hidden"] : ""
        }`}
      >
        <p
          className={css["product-detail__description"]}
          dangerouslySetInnerHTML={{ __html: description }}
        ></p>
      </div>
      {needsDescToggle && (
        <div className={css["block-specific__toggle-btn-wrapper"]}>
          <button
            className={css["block-specific__toggle-btn"]}
            onClick={toggleDesc}
          >
            {isDescExpanded ? "Приховати" : "Показати повністю"}
          </button>
        </div>
      )}
    </div>
  );
}
