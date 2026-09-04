import { useEffect, useState, createContext } from "react";
import { useCookies } from "react-cookie";
import { fetchWithAuth } from "../lib/fetchWithAuth";
import { IS_AUTH_COOKIE } from "../constants/constants";
import useSWR from "swr";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [cookies, setCookie, removeCookie] = useCookies([IS_AUTH_COOKIE]);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(Boolean(cookies[IS_AUTH_COOKIE]));
  }, [cookies]);

  const {
    data: user,
    error,
    mutate,
    isLoading: isSwrLoading,
  } = useSWR(
    isAuth ? `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/users/me/` : null,
    fetchWithAuth,
    { revalidateOnFocus: true, shouldRetryOnError: false }
  );

  useEffect(() => {
    if (error) {
      setIsAuth(false);
      removeCookie(IS_AUTH_COOKIE, { path: "/", sameSite: "lax" });
      mutate(null, false);
    }
  }, [error, mutate, removeCookie]);

  const login = () => {
    setCookie(IS_AUTH_COOKIE, "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
    setIsAuth(true);
  };

  const logout = async () => {
    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/jwt/logout/`,
        { method: "POST" }
      );
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsAuth(false);
      removeCookie(IS_AUTH_COOKIE, { path: "/", sameSite: "lax" });
      mutate(null, false);
    }
  };

  const value = {
    user: user || null,
    isAuth,
    isLoading: isAuth ? isSwrLoading : false,
    login,
    logout,
    mutate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
