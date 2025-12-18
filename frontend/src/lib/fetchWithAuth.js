import axios from "axios";
import { redirectToAuth } from "./redirectToAuth";

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
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/jwt/refresh/`,
          {},
          { withCredentials: true }
        );

        const retryResponse = await axios({
          url,
          withCredentials: true,
          ...options,
        });
        return retryResponse.data;
      } catch (refreshError) {
        redirectToAuth();
        throw refreshError;
      }
    }
    throw error;
  }
}
