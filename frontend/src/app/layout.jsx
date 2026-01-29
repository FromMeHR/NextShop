import "./globals.css";
import "./layout.css";
import localFont from "next/font/local";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import { PageWrapper } from "../components/PageWrapper/PageWrapper";
import { Providers } from "./providers";

const myFont = localFont({
  src: "../../public/fonts/Montserrat-VariableFont.ttf",
});

export const metadata = {
  title: "Voltio",
  description: "Інтернет-магазин цифрової техніки та аксесуарів - Voltio",
};

async function getCategories() {
  const baseUrl = process.env.BASE_INTERNAL_API_URL;
  try {
    const res = await fetch(`${baseUrl}/api/categories/`, {
      next: { revalidate: 60 * 60 },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function RootLayout({ children }) {
  const categories = await getCategories();

  return (
    <html lang="en" data-scroll-behavior="smooth" className={myFont.className}>
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
