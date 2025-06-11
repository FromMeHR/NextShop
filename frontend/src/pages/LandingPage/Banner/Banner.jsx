import css from "./Banner.module.css";

export function MainBanner() {
  return (
    <div className={css["banner__main"]}>
      <div className={css["banner__content"]}>
        <h2 className={css["banner__title"]}>Shop</h2>
        <p className={css["banner__subtitle"]}>
          Discover the latest trends
        </p>
        <a href="#shop" className={css["banner__button"]}>
          Shop Now
        </a>
      </div>
    </div>
  );
}
