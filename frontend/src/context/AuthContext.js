import { useEffect, useState, createContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import useSWR from "swr";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState(localStorage.getItem("Token"));
  const [isAuth, setIsAuth] = useState(
    !!JSON.parse(localStorage.getItem("isAuth"))
  );
  const fetcher = ([url, authToken]) =>
    axios
      .get(url, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      })
      .then((res) => res.data)
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        console.error("An error occurred while fetching data:", error);
      });
  const { data, error, mutate } = useSWR(
    authToken
      ? [`${process.env.REACT_APP_BASE_API_URL}/api/auth/users/me/`, authToken]
      : null,
    fetcher,
    { revalidateOnFocus: true }
  );

  const login = (authToken) => {
    localStorage.setItem("Token", authToken);
    setAuthToken(authToken);
    localStorage.setItem("isAuth", true);
    setIsAuth(true);
  };

  const logout = () => {
    localStorage.removeItem("Token");
    setAuthToken("");
    localStorage.removeItem("isAuth");
    setIsAuth(false);
    setUser(null);
  };

  useEffect(() => {
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          if (
            error.response.data.detail ===
            "Your session has expired. Please login again."
          ) {
            toast.error("Ваш сеанс завершився. Будь ласка, увійдіть ще раз.");
          }
          logout();
        }
        return Promise.reject(error);
      }
    );
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (data) {
      setUser(data);
    }
    if (error) {
      setUser(null);
    }
    setIsLoading(false);
  }, [data, error]);

  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common["Authorization"] = `Token ${authToken}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [authToken]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "Token") {
        setIsAuth(!!e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = {
    login,
    logout,
    user,
    isAuth,
    isLoading,
    authToken,
    error,
    mutate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
