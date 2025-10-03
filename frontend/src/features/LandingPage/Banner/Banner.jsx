import css from "./Banner.module.css";

export function MainBanner() {
  return (
    <div className={css["banner__main"]}>
      <div className={css["banner__content"]}>
        <h2 className={css["banner__title"]}>Shop</h2>
        <p className={css["banner__subtitle"]}>
          Відкрийте для себе останні тенденції
        </p>
        <a href="#products" className={css["banner__button"]}>
          Купити зараз
        </a>
      </div>
    </div>
  );
}
