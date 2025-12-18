"use client";

import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { fetchWithAuth } from "../../lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import css from "./ProfilePage.module.css";

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { setCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const forwardUrl = localStorage.getItem("forwardUrl");
    if (forwardUrl) {
      localStorage.removeItem("forwardUrl");
      window.location.href = forwardUrl;
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cart/sync/`,
        { method: "DELETE" }
      );
      setCart([]);
    } catch (error) {
      console.error("Cart sync failed:", error);
    }
    await logout();
    router.push("/");
  };

  return (
    <div className={css["profile-page"]}>
      <p>Профіль {user?.email}</p>
      <button onClick={handleLogout}>Вийти</button>
    </div>
  );
}
