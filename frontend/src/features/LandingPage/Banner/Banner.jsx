import css from "./Banner.module.css";

export function MainBanner() {
  return (
    <div className={css["banner__main"]}>
      <div className={css["banner__content"]}>
        <p className={css["banner__subtitle"]}>
          Обирайте найкращі девайси для роботи та розваг
        </p>
        <a href="#categories" className={css["banner__button"]}>
          До покупок
        </a>
      </div>
    </div>
  );
}
