import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import css from "./Loader.module.css";

export function Loader() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const shortWait = setTimeout(
      () => setMessage("Зачекайте, йде завантаження..."),
      3000
    );
    const longWait = setTimeout(() => setMessage("Все ще завантажується... "), 10000);
    const timeoutError = setTimeout(() => {
      navigate("/404");
    }, 30000);

    return () => {
      clearTimeout(shortWait);
      clearTimeout(longWait);
      clearTimeout(timeoutError);
    };
  }, [navigate]);

  return (
    <div className={css["loader__container"]}>
      <div className={css["loader__bar"]}>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        {message && <p className={css["loader__message"]}>{message}</p>}
      </div>
    </div>
  );
}
