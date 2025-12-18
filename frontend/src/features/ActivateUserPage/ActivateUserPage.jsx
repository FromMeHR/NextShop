"use client";

import { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import axios from "axios";
import css from "./ActivateUserPage.module.css";

export function ActivateUserPage({ uid, token }) {
  const { openModal } = useModal();
  const [activationStatus, setActivationStatus] = useState("");

  useEffect(() => {
    const handleActivation = async () => {
      try {
        const resp = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/users/activation/`,
          { uid: uid, token: token }
        );
        setActivationStatus(resp.data.message);
      } catch (error) {
        console.error("Activation failed:", error);
        setActivationStatus("Activation error");
      }
    };

    handleActivation();
  }, [uid, token]);

  return (
    <div className={css["container"]}>
      <div className={css["container__body"]}>
        <p className={css["title"]}>
          {activationStatus === "Activation error"
            ? "Помилка активації"
            : "Реєстрація завершена"}
        </p>
        <div className={css["content"]}>
          <p className={css["content__text"]}>
            {activationStatus === "Activation error"
              ? "Під час активації сталася помилка. Спробуйте ще раз або зв'яжіться з підтримкою."
              : "Ви успішно підтвердили вашу електронну адресу. Тепер Ви можете увійти в свій аккаунт."}
          </p>
          <button
            type="button"
            className={css["return-to-sign-in-btn"]}
            onClick={() => openModal("auth")}
          >
            Перейти до входу
          </button>
        </div>
      </div>
    </div>
  );
}
