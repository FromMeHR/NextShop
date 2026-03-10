import axios from "axios";
import { redirectToAuth } from "./redirectToAuth";

export function getCsrfToken() {
  if (typeof document !== "undefined") {
    return document.querySelector("meta[name='csrf-token']")?.getAttribute("content");
  }
  return null;
}

let csrfInitialized = false;

export async function ensureCsrf() {
  if (csrfInitialized) return;
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/get-csrf-token/`,
      { withCredentials: true }
    );
    csrfInitialized = true;
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
  }
}

let refreshPromise = null;

async function refreshToken() {
  if (!refreshPromise) {
    await ensureCsrf();
    const csrfToken = getCsrfToken();
    refreshPromise = axios.post(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/jwt/refresh/`,
      {},
      {
        withCredentials: true,
        headers: csrfToken ? { "X-CSRFToken": csrfToken } : {},
      }
    );
  }

  try {
    await refreshPromise;
    return true;
  } catch {
    return false;
  } finally {
    refreshPromise = null;
  }
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
