import { ScrollToTopButton } from "./FooterComponents/ScrollToTopButton";
import css from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={css["footer-main"]}>
      <div className={css["footer-content"]}>
        <div className={css["footer-links"]}>
          <a href="#!">Про нас</a>
          <a href="#!">Контакти</a>
        </div>
        <div className={css["footer-social"]}>
          <a href="#!" className={css["social-fb"]} aria-label="Facebook"></a>
          <a href="#!" className={css["social-tw"]} aria-label="Twitter"></a>
          <a href="#!" className={css["social-inst"]} aria-label="Instagram"></a>
        </div>
        <div className={css["footer-credits"]}>
          <p className={css["footer-text"]}>
            &copy; Voltio 2025-2026
          </p>
        </div>
      </div>
      <ScrollToTopButton />
    </footer>
  );
}
