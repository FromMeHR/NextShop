import { ConfigProvider } from "antd";
import { Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer, Slide } from "react-toastify";

import customTheme from "../pages/CustomThemes/customTheme";

import { Header } from "../components/Header/Header";
import { Footer } from "../components/Footer/Footer";
import { MainPage } from "../pages/LandingPage/MainPage";
import { ProductDetailPage } from "../pages/ProductDetail/ProductDetailPage";
import { PageWrapper } from "../components/PageWrapper/PageWrapper";
import { CartProvider } from "../context/CartContext";
import { BurgerMenuProvider } from "../context/BurgerMenuContext";
import { ModalProvider } from "../context/ModalContext";
import { ProfilePage } from "../pages/ProfilePage/ProfilePage";
import { useAuth } from "../hooks/useAuth";
import { Loader } from "../components/Loader/Loader";
import { ActivateUserPage } from "../pages/ActivateUserPage/ActivateUserPage";
import { RestorePasswordPage } from "../pages/RestorePasswordPage/RestorePasswordPage";
import { CheckoutPage } from "../pages/CheckoutPage/CheckoutPage";
import { SearchPage } from "../pages/SearchPage/SearchPage";
import { ErrorPage404 } from "../pages/ErrorPage/ErrorPage404";

export function ClientRouter() {
  const { isAuth, isLoading } = useAuth();

  return (
    <ConfigProvider theme={customTheme}>
      {isLoading ? (
        <Loader />
      ) : (
        <CartProvider>
          <BurgerMenuProvider>
            <ModalProvider>
              <Header isAuthorized={isAuth} />
              <PageWrapper>
                <Routes>
                  <Route path="/" element={<MainPage />} />
                  <Route
                    path="/product-detail/:slug"
                    element={<ProductDetailPage />}
                  />
                  <Route
                    path="/profile/user-info"
                    element={isAuth ? <ProfilePage /> : <Navigate to="/" />}
                  />
                  <Route
                    path="/activate/:uid/:token"
                    element={<ActivateUserPage />}
                  />
                  <Route
                    path="/password/reset/confirm/:uid/:token"
                    element={<RestorePasswordPage />}
                  />
                  <Route path="/order" element={<CheckoutPage />} />
                  <Route path="/search/:query" element={<SearchPage />} />
                  <Route path="*" element={<ErrorPage404 />} />
                </Routes>
              </PageWrapper>
              <Footer />
              <ToastContainer
                position="top-right"
                autoClose={3000}
                closeOnClick
                theme="dark"
                transition={Slide}
                icon={false}
              />
            </ModalProvider>
          </BurgerMenuProvider>
        </CartProvider>
      )}
    </ConfigProvider>
  );
}
