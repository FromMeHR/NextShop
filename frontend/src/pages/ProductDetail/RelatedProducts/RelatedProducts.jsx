import Product from "../../LandingPage/Product/Product";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import css from "./RelatedProducts.module.css";

const RelatedProducts = ({ relatedProducts }) => {
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
        <section className="py-3 bg-light">
            <div className="container px-4 px-lg-5 mt-3">
                <h2 className="fw-bolder mb-4">Related products</h2>
                <div className={`d-flex gap-3 ${css["scroll-container"]}`}
                    ref={scrollContainer}>
                    {relatedProducts && relatedProducts.length > 0 ? (
                        relatedProducts.map((product) => <Product key={product.id} product={product} />)
                    ) : (
                        <p className="text-center">No related products</p>
                    )}
                </div>
            </div>
        </section>
    )
}

export default RelatedProducts;
