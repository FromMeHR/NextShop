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
            ? "Activation error"
            : "Sign-up completed"}
        </p>
        <div className={css["content"]}>
          <p className={css["content__text"]}>
            {activationStatus === "Activation error"
              ? "An error occurred during activation. Try again or contact support."
              : "You have successfully confirmed your email address. You can now sign in to your account."}
          </p>
          <button
            type="button"
            className={css["return-to-sign-in-btn"]}
            onClick={() => document.getElementById("user-button").click()}
          >
            Return to sign in
          </button>
        </div>
      </div>
    </div>
  );
}
