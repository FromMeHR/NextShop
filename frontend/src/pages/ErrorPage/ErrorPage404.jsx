import { Link } from "react-router-dom";
import css from "./ErrorPage404.module.css";

export function ErrorPage404() {
  return (
    <div className={css["ErrorPage404__page"]}>
      <div className={css["ErrorPage404__container"]}>
        <div className={css["ErrorPage404__text404"]}>404</div>
        <div className={css["ErrorPage404__block"]}>
          <div className={css["ErrorPage404__explanation"]}>
            <p className={css["ErrorPage404__main-text"]}>Page Not Found</p>
            <p className={css["ErrorPage404__details"]}>
              The page you are looking for might have been removed, had its name
              changed or is temporarily unavailable.
            </p>
          </div>
          <Link to="/" className={css["ErrorPage404__button"]}>
            Return
          </Link>
        </div>
      </div>
    </div>
  );
}
