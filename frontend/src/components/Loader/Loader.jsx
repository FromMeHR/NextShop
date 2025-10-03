"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import css from "./Loader.module.css";

export function Loader() {
  const [message, setMessage] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const shortWait = setTimeout(
      () => setMessage("Зачекайте, йде завантаження..."),
      3000
    );
    const longWait = setTimeout(() => setMessage("Все ще завантажується... "), 10000);
    const timeoutError = setTimeout(() => {
      router.push("/404");
    }, 30000);

    return () => {
      clearTimeout(shortWait);
      clearTimeout(longWait);
      clearTimeout(timeoutError);
    };
  }, [pathname, router]);

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
