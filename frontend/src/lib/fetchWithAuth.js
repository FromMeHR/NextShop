import axios from "axios";
import { redirectToAuth } from "./redirectToAuth";

let csrfPromise = null;
let refreshPromise = null;

export function getCsrfToken() {
  if (typeof document !== "undefined") {
    return document.querySelector("meta[name='csrf-token']")?.getAttribute("content");
  }
  return null;
}

export async function ensureCsrf() {
  if (getCsrfToken()) return;
  if (!csrfPromise) {
    csrfPromise = (async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/get-csrf-token/`,
          { withCredentials: true }
        );
        const token = res.data.csrf_token;
        if (typeof document !== "undefined") {
          let meta = document.querySelector("meta[name='csrf-token']");
          if (!meta) {
            meta = document.createElement("meta");
            meta.name = "csrf-token";
            document.head.appendChild(meta);
          }
          meta.content = token;
        }
      } catch (err) {
        console.error("CSRF initialization failed:", err);
        throw err;
      } finally {
        csrfPromise = null;
      }
    })();
  }
  return csrfPromise;
}

async function refreshToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        await ensureCsrf();
        const csrfToken = getCsrfToken();
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/jwt/refresh/`,
          {},
          {
            withCredentials: true,
            headers: csrfToken ? { "X-CSRFToken": csrfToken } : {},
          }
        );
        return true;
      } catch (err) {
        console.error("Token refresh failed:", err);
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export async function fetchWithAuth(url, options = {}) {
  const method = options.method?.toUpperCase() || "GET";
  const isSafeMethod = ["GET", "HEAD", "OPTIONS", "TRACE"].includes(method);
  if (!isSafeMethod) {
    await ensureCsrf();
  }
  const csrfToken = getCsrfToken();
  const config = {
    url,
    withCredentials: true,
    ...options,
    headers: {
      ...options.headers,
      ...((!isSafeMethod && csrfToken) ? { "X-CSRFToken": csrfToken } : {}),
    },
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      const refreshed = await refreshToken();
      if (!refreshed) {
        redirectToAuth();
        throw error;
      }

      const retryResponse = await axios(config);
      return retryResponse.data;
    }
    throw error;
  }
}
