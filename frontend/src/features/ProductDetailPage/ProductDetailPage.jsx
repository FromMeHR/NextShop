"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ErrorPage404 } from "../ErrorPage/ErrorPage404";
import { RelatedProducts } from "./RelatedProducts/RelatedProducts";
import { useCart } from "../../hooks/useCart";
import { useModal } from "../../hooks/useModal";
import { useCategories } from "../../hooks/useCategories";
import { formatPrice } from "../../utils/formatPrice";
import { findCategoryPath } from "../../utils/findCategoryPath";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import { Scrollbar } from "../../components/Scrollbar/Scrollbar";
import {
  PRODUCT_STOCK_STATUS,
  PRODUCT_STOCK_STATUS_LABELS,
} from "../../constants/constants";
import css from "./ProductDetailPage.module.css";

export function ProductDetailPage({ product }) {
  const { addToCart } = useCart();
  const { openModal } = useModal();
  const { categories } = useCategories();
  const contentRef = useRef(null);
  const scrollContainer = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);

  useEffect(() => {
    const fullHeight = contentRef.current?.scrollHeight;
    if (fullHeight > 500) {
      setNeedsToggle(true);
    }
  }, [product]);

  const handleToggleExpand = () => {
    if (isExpanded) {
      setIsExpanded(false);
      const parentElement = contentRef.current?.parentElement;
      if (parentElement) {
        parentElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      setIsExpanded(true);
    }
  };

  const categoryPath = findCategoryPath(categories, product.category.slug) || [];
  const breadcrumbItems = [
    ...categoryPath
      .filter((cat) => cat.slug !== null)
      .map((cat, index, filteredArray) => {
        const fullPath = filteredArray
          .slice(0, index + 1)
          .map((c) => c.slug)
          .join("/");
        return {
          name: cat.name,
          href: cat.children?.length > 0
            ? `/category/${fullPath}`
            : `/catalog/${cat.slug}`,
        };
      }),
    {
      name: product.main_attribute?.name,
      href: `/catalog/${product.category.slug}/filter/${product.main_attribute?.slug}`,
    },
  ];

  return !product ? (
    <ErrorPage404 />
  ) : (
    <>
      <div className={css["product-detail__main"]}>
        <div className={css["product-detail__content"]}>
          <Breadcrumbs items={breadcrumbItems} />
          <div className={css["product-detail__row"]}>
            <div className={css["product-detail__image-wrapper"]}>
              <img
                className={css["product-detail__image"]}
                src={product.image}
                alt={product.name}
              />
            </div>
            <div className={css["product-detail__info"]}>
              <h2 className={css["product-detail__title"]}>{product.name}</h2>
              <div className={css["product-detail__code"]}>
                Код товару: <span>{product.code}</span>
              </div>
              <p
                className={css["product-detail__description"]}
                dangerouslySetInnerHTML={{ __html: product.description }}
              ></p>
              <div className={css["product-detail__price-row"]}>
                {product.stock_status === PRODUCT_STOCK_STATUS.OUT_OF_STOCK ? (
                  <div
                    className={`${css["product-detail__status"]} ${css["out-of-stock"]}`}
                  >
                    {PRODUCT_STOCK_STATUS_LABELS[product.stock_status]}
                  </div>
                ) : (
                  <>
                    <div className={css["product-detail__price"]}>
                      {formatPrice(product.price)} <span>₴</span>
                    </div>
                    <div
                      className={`${css["product-detail__status"]} ${
                        product.stock_status === PRODUCT_STOCK_STATUS.IN_STOCK
                          ? css["in-stock"]
                          : css["low-stock"]
                      }`}
                    >
                      {product.stock_status ===
                      PRODUCT_STOCK_STATUS.FEW_ITEMS_LEFT
                        ? PRODUCT_STOCK_STATUS_LABELS.few_items_left(
                            product.quantity
                          )
                        : PRODUCT_STOCK_STATUS_LABELS[product.stock_status]}
                    </div>
                  </>
                )}
              </div>
              {product.stock_status !== PRODUCT_STOCK_STATUS.OUT_OF_STOCK && (
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
              )}
            </div>
          </div>
          {product.variant_data && product.variant_data.length > 0 && (
            <div className={css["block-specific"]}>
              <div className={css["block-specific__content"]}>
                {product.variant_data.map((variant) => (
                  <div
                    className={css["block-specific__item-variant-row"]}
                    key={variant.id}
                  >
                    <div className={css["block-specific__item-variant-row-up"]}>
                      <div className={css["block-specific__item-variant-row-header"]}>
                        {variant.name}
                      </div>
                    </div>
                    <div className={css["block-specific__item-variant-row-down"]} ref={scrollContainer}>
                      {variant.items.map((item) => (
                        <Link
                          href={`/product-detail/${item.slug}`}
                          prefetch={false}
                          className={`${css["block-specific__item-variant-row-item"]} ${item.is_active ? css["active"] : ""}`}
                          key={item.id}
                        >
                          <span className={css["block-specific__item-variant-row-label"]}>{item.label}</span>
                          <span className={css["block-specific__item-variant-row-price"]}>{item.price}</span>
                        </Link>
                      ))}
                    </div>
                    <Scrollbar scrollContainerRef={scrollContainer} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {product.attributes && product.attributes.length > 0 && (
            <div className={css["block-specific"]}>
              <div className={css["block-specific__title"]}>
                <strong>Характеристики</strong> {product.name.split("/")[0]}
              </div>
              <div
                ref={contentRef}
                className={`${css["block-specific__content"]} ${
                  needsToggle && !isExpanded ? css["hidden"] : ""
                }`}
              >
                {product.attributes.map((attribute) => (
                  <React.Fragment key={attribute.id}>
                    <div
                      className={css["block-specific__item-header"]}
                    >
                      {attribute.name}
                    </div>
                    {attribute.children.map((child) => (
                      <div
                        className={css["block-specific__item-row"]}
                        key={child.id}
                      >
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
              {needsToggle && (
                <div className={css["block-specific__toggle-btn-wrapper"]}>
                  <button
                    className={css["block-specific__toggle-btn"]}
                    onClick={handleToggleExpand}
                  >
                    {isExpanded ? "Приховати" : "Показати повністю"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <RelatedProducts relatedProducts={product.similar_products} />
    </>
  );
}
