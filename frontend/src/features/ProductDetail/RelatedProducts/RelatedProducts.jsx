"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Product } from "../../../components/Product/Product";
import css from "./RelatedProducts.module.css";

export function RelatedProducts({ relatedProducts }) {
  const scrollContainer = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const container = scrollContainer.current;
    if (!container) return;
    const handleWheelScroll = (event) => {
      event.preventDefault();
      container.scrollLeft += event.deltaY * 6;
    };
    container.addEventListener("wheel", handleWheelScroll);
    return () => {
      container.removeEventListener("wheel", handleWheelScroll);
    };
  }, [pathname]);

  return (
    <>
      {relatedProducts && relatedProducts.length > 0 && (
        <div className={css["related-products__main"]}>
          <div className={css["related-products__content"]}>
            <h2 className={css["related-products__title"]}>Аналоги</h2>
            <div className={css["scroll-container"]} ref={scrollContainer}>
              {relatedProducts.map((product) => (
                <Product key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
