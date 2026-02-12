import "./globals.css";
import "./layout.css";
import localFont from "next/font/local";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import { PageWrapper } from "../components/PageWrapper/PageWrapper";
import { Providers } from "./providers";
import { getCategories } from "../lib/categories";

const myFont = localFont({
  src: "../../public/fonts/Montserrat-VariableFont.ttf",
});

export const viewport = {
  themeColor: "#191919",
};

export const metadata = {
  metadataBase: new URL(`${process.env.NEXT_PUBLIC_URL}`),
  openGraph: {
    siteName: "voltio.click",
    locale: "uk_UA",
    type: "website",
    images: [
      {
        url: "/img/opengraph-image.jpg",
      },
    ],
  },
  twitter: {
    card: "summary",
  },
};

export default async function RootLayout({ children }) {
  const categories = await getCategories();
  const publicUrl = process.env.NEXT_PUBLIC_URL;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": `${publicUrl}/`,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${publicUrl}/search/{search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "Voltio — інтернет-магазин цифрової техніки",
      "url": `${publicUrl}/`,
      "logo": `${publicUrl}/svg/logo.svg`,
      "image": `${publicUrl}/svg/logo.svg`,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "вул. Старокозацька, 28А",
        "addressLocality": "Дніпро",
        "postalCode": "49000",
        "addressCountry": "UA"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+380995544422",
        "contactType": "customer service"
      }
    }
  ];

  return (
    <html lang="uk" data-scroll-behavior="smooth" className={myFont.className}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <div className="App">
          <Providers initialCategories={categories}>
            <Header />
            <PageWrapper>{children}</PageWrapper>
            <Footer />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              closeOnClick
              theme="dark"
              transition={Slide}
              icon={false}
            />
          </Providers>
        </div>
      </body>
    </html>
  );
}
