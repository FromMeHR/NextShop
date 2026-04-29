import { useModal } from "../../../../hooks/useModal";
import ReactDOM from "react-dom";
import css from "./RestorePasswordCompletionModal.module.css";

export function RestorePasswordCompletionModal({ isActive, modalRef }) {
  const { openModal, closeModal } = useModal();

  return ReactDOM.createPortal(
    <div ref={modalRef} className={`${css["modal"]} ${isActive ? css["show"] : ""}`}>
      <div className={css["modal-dialog"]}>
        <div className={css["modal-content"]}>
          <div className={css["modal-header"]}>
            <p className={css["modal-title"]}>Відновити пароль</p>
            <button
              type="button"
              className={css["modal-close-button"]}
              onClick={() => closeModal("restorePasswordCompletion")}
              aria-label="Закрити модальне вікно"
            ></button>
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
