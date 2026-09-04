"use client";

import { ConfigProvider } from "antd";
import { CookiesProvider } from "react-cookie";
import { customTheme } from "../constants/customTheme";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { CategoriesProvider } from "../context/CategoriesContext";
import { BurgerMenuProvider } from "../context/BurgerMenuContext";
import { ModalProvider } from "../context/ModalContext";

export function Providers({ children, initialCategories }) {
  return (
    <ConfigProvider theme={customTheme}>
      <CookiesProvider>
        <CategoriesProvider initialCategories={initialCategories}>
          <AuthProvider>
            <CartProvider>
              <BurgerMenuProvider>
                <ModalProvider>{children}</ModalProvider>
              </BurgerMenuProvider>
            </CartProvider>
          </AuthProvider>
        </CategoriesProvider>
      </CookiesProvider>
    </ConfigProvider>
  );
}
