import axios from "axios";
import { redirectToAuth } from "./redirectToAuth";

let refreshPromise = null;

async function refreshToken() {
  if (!refreshPromise) {
    refreshPromise = axios.post(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/jwt/refresh/`,
      {},
      { withCredentials: true }
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
  try {
    const response = await axios({
      url,
      withCredentials: true,
      ...options,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      const refreshed = await refreshToken();
      if (!refreshed) {
        redirectToAuth();
        throw error;
      }

      const retryResponse = await axios({
        url,
        withCredentials: true,
        ...options,
      });
      return retryResponse.data;
    }
    throw error;
  }
}
