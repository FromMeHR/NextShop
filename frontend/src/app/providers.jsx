"use client";

import { ConfigProvider } from "antd";
import { customTheme } from "../constants/customTheme";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
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

export function Providers({ children }) {
  return (
    <ConfigProvider theme={customTheme}>
      <AuthProvider>
        <AuthGate>{children}</AuthGate>
      </AuthProvider>
    </ConfigProvider>
  );
}
