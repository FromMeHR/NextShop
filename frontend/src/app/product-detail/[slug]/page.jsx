import { ProductDetailPage } from "../../../features/ProductDetailPage/ProductDetailPage";
import { generateProductShortInfo } from "../../../utils/generateProductShortInfo";
import { PRODUCT_STOCK_STATUS } from "../../../constants/constants";
import { findCategoryPath } from "../../../utils/findCategoryPath";
import { getCategories } from "../../../lib/categories";
import { notFound } from "next/navigation";

export const dynamic = "force-static";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const baseUrl = process.env.BASE_INTERNAL_API_URL;

  try {
    const res = await fetch(`${baseUrl}/api/products/${slug}/`, {
      next: { revalidate: 60 * 30 },
    });
    if (res.ok) {
      const product = await res.json();
      return {
        title: `${product.name} - купити в Україні: ціни, фото, характеристики | Voltio`,
        description: `Вигідна ціна на ${product.name} - купити ${product.category.name} з доставкою по Україні. Замовляйте ${product.category.name} у магазині цифрової техніки Voltio`,
        openGraph: {
          description: generateProductShortInfo(product.attributes)
            .map((item) => `${item.name}: ${item.value}`)
            .join(". "),
          siteName: "voltio.click",
          locale: "uk_UA",
          type: "website",
          images: [
            {
              url: product.image,
            },
          ],
        },
      };
    }
  } catch (error) {
    console.error("Error fetching product for metadata:", error);
  }
}

export default async function Page({ params }) {
  const { slug } = await params;
  const baseUrl = process.env.BASE_INTERNAL_API_URL;

  try {
    const res = await fetch(`${baseUrl}/api/products/${slug}/`, {
      next: { revalidate: 60 * 30 },
    });
    if (res.ok) {
      const product = await res.json();
      const categories = await getCategories();
      const categoryPath = findCategoryPath(categories, product.category.slug);

      const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "sku": product.code,
        "name": product.name,
        "image": [product.image],
        "description": generateProductShortInfo(product.attributes)
          .map((item) => `${item.name}: ${item.value}`)
          .join(". "),
        "brand": {
          "@type": "Brand",
          "name": product.main_attribute?.name || "Voltio"
        },
        "offers": {
          "@type": "Offer",
          "availability": product.stock_status !== PRODUCT_STOCK_STATUS.OUT_OF_STOCK
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          "price": parseFloat(product.price),
          "priceCurrency": "UAH",
          "url": `${process.env.NEXT_PUBLIC_URL}/product-detail/${product.slug}`,
          "itemCondition": "https://schema.org/NewCondition",
          "seller": {
            "@type": "Organization",
            "name": "Voltio",
          },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": 60,
              "currency": "UAH"
            },
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "UA"
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "handlingTime": {
                "@type": "QuantitativeValue",
                "minValue": 0,
                "maxValue": 1,
                "unitCode": "d"
              },
              "transitTime": {
                "@type": "QuantitativeValue",
                "minValue": 1,
                "maxValue": 3,
                "unitCode": "d"
              }
            }
          },
          "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "applicableCountry": "UA",
            "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
            "merchantReturnDays": 14,
            "returnMethod": "https://schema.org/ReturnByMail",
            "returnFees": "https://schema.org/ReturnFeesCustomerResponsibility",
            "refundType": "https://schema.org/FullRefund"
          }
        }
      };

      return (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
            }}
          />
          <ProductDetailPage product={product} categoryPath={categoryPath} />
        </>
      );
    }
  } catch (error) {
    console.error("Error fetching product:", error);
  }
  return notFound();
}
