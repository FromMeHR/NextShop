import { useEffect, useState } from "react";
import { useModal } from "../../../hooks/useModal";
import ReactDOM from "react-dom";
import css from "./RestorePasswordResultModal.module.css";

export function RestorePasswordResultModal({
  show,
  restorePasswordStatus,
  handleClose,
}) {
  const { showOverlay, hideOverlay } = useModal();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(show);
    show ? showOverlay() : hideOverlay();
  }, [show, showOverlay, hideOverlay]);

  return ReactDOM.createPortal(
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
                ? "Посилання неактивне"
                : "Пароль змінено"}
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
                ? "Зміна паролю неможлива."
                : "Ваш новий пароль успішно збережено."}
            </p>
            <button
              type="button"
              className={css["return-to-sign-in-btn"]}
              onClick={() => {
                handleClose();
                document.getElementById("user-button").click();
              }}
            >
              Перейти до входу
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
