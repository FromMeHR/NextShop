import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import css from "./ProfilePage.module.css";

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { setCart } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await axios
      .delete(`${process.env.REACT_APP_BASE_API_URL}/api/cart/sync/`, {
        withCredentials: true,
      })
      .then(() => {
        setCart([]);
      })
      .catch((error) => {
        console.error("Cart sync failed:", error);
      });
    await axios
      .post(`${process.env.REACT_APP_BASE_API_URL}/api/auth/token/logout/`)
      .then(() => {
        logout();
        navigate("/");
      })
      .catch(() => {
        toast.error("Logout failed. Please try again.");
      });
  };

  return (
    <div className={css["profile-page"]}>
      <p>Профіль {user && user.email}</p>
      <button onClick={handleLogout}>Вийти</button>
    </div>
  );
}
