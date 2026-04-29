import { useModal } from "../../../../hooks/useModal";
import ReactDOM from "react-dom";
import css from "./RestorePasswordResultModal.module.css";

export function RestorePasswordResultModal({ isActive, modalRef, restorePasswordStatus }) {
  const { openModal, closeModal } = useModal();

  return ReactDOM.createPortal(
    <div ref={modalRef} className={`${css["modal"]} ${isActive ? css["show"] : ""}`}>
      <div className={css["modal-dialog"]}>
        <div className={css["modal-content"]}>
          <div className={css["modal-header"]}>
            <p className={css["modal-title"]}>
              {restorePasswordStatus === "Restore password error"
                ? "Посилання неактивне"
                : "Пароль змінено"}
            </p>
            <button
              type="button"
              className={css["modal-close-button"]}
              onClick={() => closeModal("restorePasswordResult")}
              aria-label="Закрити модальне вікно"
            ></button>
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
                closeModal("restorePasswordResult");
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
