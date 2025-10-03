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
  title: "NextShop",
  description: "Shop using next",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={myFont.className}>
      <body>
        <div className="App">
          <Providers>
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
