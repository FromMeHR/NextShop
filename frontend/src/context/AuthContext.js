import { useEffect, useState, createContext } from "react";
import { useCookies } from "react-cookie";
import { fetchWithAuth } from "../lib/fetchWithAuth";
import useSWR from "swr";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cookies, setCookie, removeCookie] = useCookies(["isAuth"]);
  const isAuth = Boolean(cookies.isAuth);

  const { data, error, mutate } = useSWR(
    isAuth ? `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/users/me/` : null,
    fetchWithAuth,
    { revalidateOnFocus: true, shouldRetryOnError: false }
  );

  const login = () => {
    setCookie("isAuth", "1", { path: "/", maxAge: 60 * 60 * 24 * 30 });
  };

  const logout = async () => {
    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/jwt/logout/`,
        { method: "POST" }
      );
      setUser(null);
      removeCookie("isAuth", { path: "/" });
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
      removeCookie("isAuth", { path: "/" });
    }
    setIsLoading(false);
  }, [data, error, removeCookie]);

  const value = {
    user,
    isAuth,
    isLoading,
    login,
    logout,
    mutate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
