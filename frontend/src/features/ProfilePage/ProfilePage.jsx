"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useModal } from "../../hooks/useModal";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";
import css from "./ProfilePage.module.css";

export function ProfilePage() {
  const { user, isAuth, isLoading, logout } = useAuth();
  const { setCart } = useCart();
  const { openModal } = useModal();
  const router = useRouter();
  const manualLogout = useRef(false);

  useEffect(() => {
    if (!isAuth && !isLoading && !manualLogout.current) {
      router.push("/");
      openModal("auth");
    }
  }, [isAuth, isLoading, router, openModal]);

  const handleLogout = async () => {
    manualLogout.current = true;
    await axios
      .delete(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cart/sync/`, {
        withCredentials: true,
      })
      .then(() => {
        setCart([]);
      })
      .catch((error) => {
        console.error("Cart sync failed:", error);
      });
    await axios
      .post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/token/logout/`)
      .then(() => {
        logout();
        router.push("/");
      })
      .catch(() => {
        toast.error("Logout failed. Please try again.");
      });
  };

  return (
    <>
      {isAuth && (
        <div className={css["profile-page"]}>
          <p>Профіль {user && user.email}</p>
          <button onClick={handleLogout}>Вийти</button>
        </div>
      )}
    </>
  );
}
