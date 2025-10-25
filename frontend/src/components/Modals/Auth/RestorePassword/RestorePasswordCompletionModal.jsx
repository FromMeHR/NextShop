import { useModal } from "../../../../hooks/useModal";
import ReactDOM from "react-dom";
import css from "./RestorePasswordCompletionModal.module.css";

export function RestorePasswordCompletionModal() {
  const { modals, openModal, closeModal } = useModal();
  const isVisible = modals.restorePasswordCompletion;

  return ReactDOM.createPortal(
    <div
      className={`${css["modal"]} ${isVisible ? css["show"] : ""}`}
      onMouseDown={(e) => {
        if (!e.target.closest(`.${css["modal-content"]}`)) {
          closeModal("restorePasswordCompletion");
        }
      }}
    >
      <div className={css["modal-dialog"]}>
        <div className={css["modal-content"]}>
          <div className={css["modal-header"]}>
            <p className={css["modal-title"]}>Відновити пароль</p>
            <img
              src={`${process.env.NEXT_PUBLIC_URL}/svg/delete.svg`}
              className={css["modal-close-button"]}
              alt="Close"
              onClick={() => closeModal("restorePasswordCompletion")}
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
                closeModal("restorePasswordCompletion");
                openModal("auth");
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
