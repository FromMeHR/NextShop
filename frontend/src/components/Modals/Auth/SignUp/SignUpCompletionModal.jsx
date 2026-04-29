import { useModal } from "../../../../hooks/useModal";
import ReactDOM from "react-dom";
import css from "./SignUpCompletionModal.module.css";

export function SignUpCompletionModal({ isActive, modalRef }) {
  const { openModal, closeModal } = useModal();

  return ReactDOM.createPortal(
    <div ref={modalRef} className={`${css["modal"]} ${isActive ? css["show"] : ""}`}>
      <div className={css["modal-dialog"]}>
        <div className={css["modal-content"]}>
          <div className={css["modal-header"]}>
            <p className={css["modal-title"]}>Реєстрація майже завершена</p>
            <button
              type="button"
              className={css["modal-close-button"]}
              onClick={() => closeModal("signUpCompletion")}
              aria-label="Закрити модальне вікно"
            ></button>
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
                closeModal("signUpCompletion");
                openModal("auth");
              }}
            >
              Перейти до входу
            </button>
            <div className={css["resend-line"]}>
              <button
                type="button"
                className={css["resend-line-btn"]}
                onClick={() => {
                  closeModal("signUpCompletion");
                  openModal("signUpResendActivation");
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
