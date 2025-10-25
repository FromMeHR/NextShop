import { useModal } from "../../../../hooks/useModal";
import ReactDOM from "react-dom";
import css from "./SignUpCompletionModal.module.css";

export function SignUpCompletionModal() {
  const { modals, openModal, closeModal } = useModal();
  const isVisible = modals.signUpCompletion;

  return ReactDOM.createPortal(
    <div
      className={`${css["modal"]} ${isVisible ? css["show"] : ""}`}
      onMouseDown={(e) => {
        if (!e.target.closest(`.${css["modal-content"]}`)) {
          closeModal("signUpCompletion");
        }
      }}
    >
      <div className={css["modal-dialog"]}>
        <div className={css["modal-content"]}>
          <div className={css["modal-header"]}>
            <p className={css["modal-title"]}>Реєстрація майже завершена</p>
            <img
              src={`${process.env.NEXT_PUBLIC_URL}/svg/delete.svg`}
              className={css["modal-close-button"]}
              alt="Close"
              onClick={() => closeModal("signUpCompletion")}
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
