import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import css from "./ActivateUserPage.module.css";

export function ActivateUserPage() {
  const { uid, token } = useParams();
  const [activationStatus, setActivationStatus] = useState("");

  useEffect(() => {
    const handleActivation = async () => {
      await axios({
        method: "post",
        url: `${process.env.REACT_APP_BASE_API_URL}/api/auth/users/activation/`,
        data: { uid: uid, token: token },
      })
        .then((resp) => {
          setActivationStatus(resp.data.message);
        })
        .catch(() => {
          setActivationStatus("Activation error");
        });
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
            onClick={() => document.getElementById("user-button").click()}
          >
            Перейти до входу
          </button>
        </div>
      </div>
    </div>
  );
}
