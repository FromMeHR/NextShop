import { useEffect, useState, createContext } from "react";
import { useCookies } from "react-cookie";
import { fetchWithAuth } from "../lib/fetchWithAuth";
import { IS_AUTH_COOKIE } from "../constants/constants";
import useSWR from "swr";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cookies, setCookie, removeCookie] = useCookies([IS_AUTH_COOKIE]);
  const isAuth = Boolean(cookies.is_auth);

  const { data, error, mutate } = useSWR(
    isAuth ? `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/users/me/` : null,
    fetchWithAuth,
    { revalidateOnFocus: true, shouldRetryOnError: false }
  );

  const login = () => {
    setCookie(IS_AUTH_COOKIE, "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  };

  const logout = async () => {
    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/jwt/logout/`,
        { method: "POST" }
      );
      setUser(null);
      removeCookie(IS_AUTH_COOKIE, { path: "/", sameSite: "lax" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    if (data) {
      setUser(data);
    }
    if (error) {
      setUser(null);
      removeCookie(IS_AUTH_COOKIE, { path: "/", sameSite: "lax" });
    }
    setIsLoading(isAuth ? (!data && !error) : false);
  }, [data, error, isAuth, removeCookie]);

  const value = {
    user,
    setUser,
    isAuth,
    isLoading,
    login,
    logout,
    mutate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
