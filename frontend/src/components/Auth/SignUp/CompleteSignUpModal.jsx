import { useEffect, useState } from "react";
import css from "./CompleteSignUpModal.module.css";

export function CompleteSignUpModal({
  show,
  handleClose,
  handleOpenAuth,
  handleOpenResendActivationSignUp,
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  return (
    <>
      <div
        className={`${css["overlay"]} ${isVisible ? css["show"] : ""}`}
        onClick={handleClose}
      ></div>
      <div
        className={`${css["modal"]} ${isVisible ? css["show"] : ""}`}
        onClick={handleClose}
      >
        <div className={css["modal-dialog"]}>
          <div
            className={css["modal-content"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={css["modal-header"]}>
              <p className={css["modal-title"]}>Authorization</p>
              <img
                src={`${process.env.REACT_APP_PUBLIC_URL}/svg/delete.svg`}
                className={css["modal-close-button"]}
                alt="Close"
                onClick={handleClose}
              />
            </div>
            <div className={css["modal-body"]}>
              <p className={css["modal-body-text"]}>
                A letter has been sent to the email address you provided. <br />
                Please follow the link in the letter to confirm your email
                address.
              </p>
              <button
                type="button"
                className={css["return-to-sign-in-btn"]}
                onClick={() => {
                  handleClose();
                  handleOpenAuth();
                }}
              >
                Return to sign in
              </button>
              <div className={css["resend-line"]}>
                <button
                  type="button"
                  className={css["resend-line-btn"]}
                  onClick={() => {
                    handleClose();
                    handleOpenResendActivationSignUp();
                  }}
                >
                  Resend activation link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
