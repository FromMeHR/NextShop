import { useEffect, useState } from "react";
import { useModal } from "../../../hooks/useModal";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { EMAIL_PATTERN } from "../../../constants/constants";
import axios from "axios";
import classnames from "classnames";
import ReactDOM from "react-dom";
import css from "./RestorePasswordSendEmailModal.module.css";

export function RestorePasswordSendEmailModal({
  show,
  handleClose,
  handleOpenRestorePasswordCompletion,
}) {
  const { setOverlayVisible } = useModal();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(show);
    setOverlayVisible(show);
  }, [show, setOverlayVisible]);

  const errorMessageTemplates = {
    required: "Обов'язкове поле",
    email: "Введіть E-mail у форматі name@example.com",
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ mode: "all" });

  const disabled = !isValid;

  const onSubmit = async (value) => {
    await axios({
      method: "post",
      url: `${process.env.REACT_APP_BASE_API_URL}/api/auth/users/reset_password/`,
      data: { email: value.email },
    })
      .then(() => {
        handleClose();
        setTimeout(() => handleOpenRestorePasswordCompletion(), 1);
      })
      .catch(() => {
        toast.error(
          "Не вдалося відправити електронний лист. Спробуйте пізніше."
        );
      });
  };

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
              src={`${process.env.REACT_APP_PUBLIC_URL}/svg/delete.svg`}
              className={css["modal-close-button"]}
              alt="Close"
              onClick={handleClose}
            />
          </div>
          <div className={css["modal-body"]}>
            <p className={css["modal-body-text"]}>
              Введіть електронну адресу вказану при реєстрації для відновлення
              паролю. <br /> Лист з посиланням для відновлення паролю буде
              надiслано на цю електронну адресу.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className={css["forms__item"]}>
                <div
                  className={classnames(css["form-floating"], {
                    [css["has-error"]]: errors.email,
                  })}
                >
                  <input
                    id="restore-email"
                    type="email"
                    {...register("email", {
                      required: errorMessageTemplates.required,
                      pattern: {
                        value: EMAIL_PATTERN,
                        message: errorMessageTemplates.email,
                      },
                    })}
                  />
                  <label htmlFor="restore-email">E-mail</label>
                  <p className={css["error-message"]}>
                    {errors.email && errors.email.message}
                  </p>
                </div>
              </div>
              <button
                type="submit"
                disabled={disabled}
                className={css["restore-form__btn"]}
              >
                Відновити пароль
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
