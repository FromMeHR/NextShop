import { useEffect, useState } from "react";
import css from "./RestorePasswordResultModal.module.css";

export function RestorePasswordResultModal({
  show,
  restorePasswordStatus,
  handleClose,
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
              <p className={css["modal-title"]}>
                {restorePasswordStatus === "Restore password error"
                  ? "The link is inactive"
                  : "Password changed"}
              </p>
              <img
                src={`${process.env.REACT_APP_PUBLIC_URL}/svg/delete.svg`}
                className={css["modal-close-button"]}
                alt="Close"
                onClick={handleClose}
              />
            </div>
            <div className={css["modal-body"]}>
              <p className={css["modal-body-text"]}>
                {restorePasswordStatus === "Restore password error"
                  ? "Changing the password is not possible."
                  : "Your new password has been successfully saved."}
              </p>
              <button
                type="button"
                className={css["return-to-sign-in-btn"]}
                onClick={() => {
                  handleClose();
                  document.getElementById("user-button").click()
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
