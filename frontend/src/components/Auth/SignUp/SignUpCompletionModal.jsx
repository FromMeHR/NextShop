import { useEffect, useState } from "react";
import { useModal } from "../../../hooks/useModal";
import ReactDOM from "react-dom";
import css from "./SignUpCompletionModal.module.css";

export function SignUpCompletionModal({
  show,
  handleClose,
  handleOpenAuth,
  handleOpenSignUpResendActivation,
}) {
  const { setOverlayVisible } = useModal();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(show);
    setOverlayVisible(show);
  }, [show, setOverlayVisible]);

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
            <p className={css["modal-title"]}>Реєстрація майже завершена</p>
            <img
              src={`${process.env.REACT_APP_PUBLIC_URL}/svg/delete.svg`}
              className={css["modal-close-button"]}
              alt="Close"
              onClick={handleClose}
            />
          </div>
          <div className={css["modal-body"]}>
            <p className={css["modal-body-text"]}>
              На зазначену Вами електронну пошту надіслано листа. <br />
              Будь ласка перейдіть за посиланням з листа для підтвердження
              вказаної електронної адреси.
            </p>
            <button
              type="button"
              className={css["return-to-sign-in-btn"]}
              onClick={() => {
                handleClose();
                setTimeout(() => handleOpenAuth(), 1);
              }}
            >
              Перейти до входу
            </button>
            <div className={css["resend-line"]}>
              <button
                type="button"
                className={css["resend-line-btn"]}
                onClick={() => {
                  handleClose();
                  setTimeout(() => handleOpenSignUpResendActivation(), 1);
                }}
              >
                Надіслати повторно
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
