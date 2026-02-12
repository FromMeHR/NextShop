import Link from "next/link";
import { formatPrice } from "../../utils/formatPrice";
import { generateProductShortInfo } from "../../utils/generateProductShortInfo";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import {
  PRODUCT_STOCK_STATUS,
  PRODUCT_STOCK_STATUS_LABELS,
} from "../../constants/constants";
import { BuyButton } from "./components/BuyButton/BuyButton";
import { VariantSelector } from "./components/VariantSelector";
import { ProductSpecs } from "./components/ProductSpecs";
import { ProductDescription } from "./components/ProductDescription";
import { RelatedProducts } from "./components/RelatedProducts/RelatedProducts";
import css from "./ProductDetailPage.module.css";

export function ProductDetailPage({ product, categoryPath }) {
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

  return (
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
              <div className={css["product-detail__short-info-wrapper"]}>
                <div className={css["product-detail__code"]}>
                  Код товару: <span>{product.code}</span>
                </div>
                <div className={css["product-detail__short-info-header"]}>Короткі характеристики:</div>
                <ul className={css["product-detail__short-info"]}>
                  {generateProductShortInfo(product.attributes).map((attr) => (
                    <li
                      className={css["product-detail__short-info-item"]}
                      key={attr.id}
                    >
                      <span className={css["product-detail__short-info--title"]}>{attr.name}: </span>
                      {attr.slug ? (
                        <Link
                          target="_blank"
                          href={`${process.env.NEXT_PUBLIC_URL}/catalog/${product.category.slug}/filter/${attr.slug}`}
                          prefetch={false}
                        >
                          <span className={css["product-detail__short-info--desc"]}>{attr.value}</span>
                        </Link>
                      ) : (
                        <span className={css["product-detail__short-info--desc"]}>{attr.value}</span>
                      )}
                    </li>
                  ))}
                </ul>
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
                  <BuyButton product={product} />
                )}
              </div>
            </div>
          </div>
          {product.variant_data && product.variant_data.length > 0 && (
            <VariantSelector variants={product.variant_data} />
          )}
          {product.attributes && product.attributes.length > 0 && (
            <ProductSpecs product={product} />
          )}
          {product.description && product.description.length > 0 && (
            <ProductDescription description={product.description} name={product.name} />
          )}
        </div>
      </div>
      <RelatedProducts relatedProducts={product.similar_products} />
    </>
  );
}
