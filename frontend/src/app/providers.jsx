"use client";

import { ConfigProvider } from "antd";
import { CookiesProvider } from "react-cookie";
import { customTheme } from "../constants/customTheme";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { CategoriesProvider } from "../context/CategoriesContext";
import { BurgerMenuProvider } from "../context/BurgerMenuContext";
import { ModalProvider } from "../context/ModalContext";
import { useAuth } from "../hooks/useAuth";
import { Loader } from "../components/Loader/Loader";

function AuthGate({ children }) {
  const { isLoading } = useAuth();

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <CartProvider>
          <BurgerMenuProvider>
            <ModalProvider>{children}</ModalProvider>
          </BurgerMenuProvider>
        </CartProvider>
      )}
    </>
  );
}

export function Providers({ children, initialCategories }) {
  return (
    <ConfigProvider theme={customTheme}>
      <CookiesProvider>
        <CategoriesProvider initialCategories={initialCategories}>
          <AuthProvider>
            <AuthGate>{children}</AuthGate>
          </AuthProvider>
        </CategoriesProvider>
      </CookiesProvider>
    </ConfigProvider>
  );
}
