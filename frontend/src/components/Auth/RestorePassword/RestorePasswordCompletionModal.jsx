import { useEffect, useState } from "react";
import { useModal } from "../../../hooks/useModal";
import ReactDOM from "react-dom";
import css from "./RestorePasswordCompletionModal.module.css";

export function RestorePasswordCompletionModal({
  show,
  handleClose,
  handleOpenAuth,
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
            <p className={css["modal-title"]}>Відновити пароль</p>
            <img
              src={`${process.env.NEXT_PUBLIC_URL}/svg/delete.svg`}
              className={css["modal-close-button"]}
              alt="Close"
              onClick={handleClose}
            />
          </div>
          <div className={css["modal-body"]}>
            <p className={css["modal-body-text"]}>
              Інструкції щодо зміни пароля надіслано на email, який Ви вказали.
            </p>
            <button
              type="button"
              className={css["return-to-sign-in-btn"]}
              onClick={() => {
                handleClose();
                handleOpenAuth();
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
