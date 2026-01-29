"use client";

import { useState, useEffect, useRef } from "react";
import { Product } from "../../../components/Product/Product";
import css from "./RelatedProducts.module.css";

export function RelatedProducts({ relatedProducts }) {
  const [scrollStatus, setScrollStatus] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });
  const scrollContainer = useRef(null);
  const targetScrollLeft = useRef(0);

  const updateScrollButtons = () => {
    const container = scrollContainer.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    targetScrollLeft.current = scrollLeft;

    setScrollStatus({
      canScrollLeft: scrollLeft > 1,
      canScrollRight: scrollLeft + clientWidth < scrollWidth - 1
    });
  };

  useEffect(() => {
    const container = scrollContainer.current;
    if (container) {
      targetScrollLeft.current = container.scrollLeft;
      updateScrollButtons();
      container.addEventListener("scroll", updateScrollButtons);
      window.addEventListener("resize", updateScrollButtons);
      return () => {
        container.removeEventListener("scroll", updateScrollButtons);
        window.removeEventListener("resize", updateScrollButtons);
      };
    }
  }, []);

  const handleScroll = (direction) => {
    const container = scrollContainer.current;
    if (!container) return;
    const firstChild = container.firstElementChild;
    if (!firstChild) return;

    const containerStyle = window.getComputedStyle(container);
    const columnGap = parseFloat(containerStyle.columnGap) || 0;
    const itemWidth = firstChild.offsetWidth + columnGap;
    const scrollDistance = itemWidth + columnGap;

    let newTarget;
    if (direction === "left") {
      newTarget = targetScrollLeft.current - scrollDistance;
    } else {
      newTarget = targetScrollLeft.current + scrollDistance;
    }

    const maxScroll = container.scrollWidth - container.clientWidth;
    newTarget = Math.max(0, Math.min(newTarget, maxScroll));

    targetScrollLeft.current = newTarget;
    container.scrollTo({ left: newTarget });
  };

  return (
    <>
      {relatedProducts && relatedProducts.length > 0 && (
        <div className={css["related-products__main"]}>
          <div className={css["related-products__content"]}>
            <h2 className={css["related-products__title"]}>Аналоги</h2>
            <div className={css["scroll-container-wrapper"]}>
              <button
                className={`${css["scroll-btn"]} ${css["left"]} ${scrollStatus.canScrollLeft ? css["active"] : ""}`}
                onClick={() => handleScroll("left")}
              >
                <img src={`${process.env.NEXT_PUBLIC_URL}/svg/up.svg`} alt="Left" />
              </button>
              <div className={css["scroll-container"]} ref={scrollContainer}>
                {relatedProducts.map((product) => (
                  <Product key={product.code} product={product}/>
                ))}
              </div>
              <button
                className={`${css["scroll-btn"]} ${css["right"]} ${scrollStatus.canScrollRight ? css["active"] : ""}`}
                onClick={() => handleScroll("right")}
              >
                <img src={`${process.env.NEXT_PUBLIC_URL}/svg/up.svg`} alt="Right" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
