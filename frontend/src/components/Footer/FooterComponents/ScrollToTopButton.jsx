import { useState, useEffect } from "react";
import css from "./ScrollToTopButton.module.css";

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      className={`${css["btn_back-to-top"]} ${isVisible ? css.visible : ""}`}
      onClick={scrollToTop}
    >
      <img
        src={`${process.env.REACT_APP_PUBLIC_URL}/svg/up.svg`}
        alt="Back to top"
      />
    </button>
  );
}
