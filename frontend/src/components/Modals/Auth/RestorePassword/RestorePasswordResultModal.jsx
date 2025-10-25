import { useModal } from "../../../../hooks/useModal";
import ReactDOM from "react-dom";
import css from "./RestorePasswordResultModal.module.css";

export function RestorePasswordResultModal({ restorePasswordStatus }) {
  const { modals, openModal, closeModal } = useModal();
  const isVisible = modals.restorePasswordResult;

  return ReactDOM.createPortal(
    <div
      className={`${css["modal"]} ${isVisible ? css["show"] : ""}`}
      onMouseDown={(e) => {
        if (!e.target.closest(`.${css["modal-content"]}`)) {
          closeModal("restorePasswordResult");
        }
      }}
    >
      <div className={css["modal-dialog"]}>
        <div className={css["modal-content"]}>
          <div className={css["modal-header"]}>
            <p className={css["modal-title"]}>
              {restorePasswordStatus === "Restore password error"
                ? "Посилання неактивне"
                : "Пароль змінено"}
            </p>
            <img
              src={`${process.env.NEXT_PUBLIC_URL}/svg/delete.svg`}
              className={css["modal-close-button"]}
              alt="Close"
              onClick={() => closeModal("restorePasswordResult")}
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
