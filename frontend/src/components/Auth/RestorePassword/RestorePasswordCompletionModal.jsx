import { useEffect, useState } from "react";
import css from "./RestorePasswordCompletionModal.module.css";

export function RestorePasswordCompletionModal({
  show,
  handleClose,
  handleOpenAuth,
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
              <p className={css["modal-title"]}>Restore password</p>
              <img
                src={`${process.env.REACT_APP_PUBLIC_URL}/svg/delete.svg`}
                className={css["modal-close-button"]}
                alt="Close"
                onClick={handleClose}
              />
            </div>
            <div className={css["modal-body"]}>
              <p className={css["modal-body-text"]}>
                Instructions for changing your password have been sent to the
                email address you provided.
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
