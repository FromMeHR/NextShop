import { useAuth } from "../../hooks/useAuth";
import css from "./ProfilePage.module.css";

export function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className={css["profile-page"]}>
      <p>Profile {user && user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
