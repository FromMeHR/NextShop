import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Product } from "../../LandingPage/Product/Product";
import css from "./RelatedProducts.module.css";

export function RelatedProducts({ relatedProducts }) {
  const scrollContainer = useRef(null);
  const { pathname } = useLocation();

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
    <div className={css["related-products__main"]}>
      <div className={css["related-products__content"]}>
        <h2 className={css["related-products__title"]}>Related products</h2>
        <div
          className={css["scroll-container"]}
          ref={scrollContainer}
        >
          {relatedProducts && relatedProducts.length > 0 ? (
            relatedProducts.map((product) => (
              <Product key={product.id} product={product} />
            ))
          ) : (
            <p>No related products</p>
          )}
        </div>
      </div>
    </div>
  );
}
