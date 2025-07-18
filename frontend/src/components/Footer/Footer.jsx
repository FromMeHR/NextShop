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
          <a href="#!">
            <img
              src={`${process.env.REACT_APP_PUBLIC_URL}/svg/facebook.svg`}
              alt="Facebook icon link"
            />
          </a>
          <a href="#!">
            <img
              src={`${process.env.REACT_APP_PUBLIC_URL}/svg/twitter.svg`}
              alt="Twitter icon link"
            />
          </a>
          <a href="#!">
            <img
              src={`${process.env.REACT_APP_PUBLIC_URL}/svg/instagram.svg`}
              alt="Instagram icon link"
            />
          </a>
        </div>
        <div className={css["footer-credits"]}>
          <p className={css["footer-text"]}>
            &copy; Shop 2025
          </p>
        </div>
      </div>
      <ScrollToTopButton />
    </footer>
  );
}
