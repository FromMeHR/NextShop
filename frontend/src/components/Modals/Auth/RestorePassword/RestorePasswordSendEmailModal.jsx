import { useModal } from "../../../../hooks/useModal";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { EMAIL_PATTERN } from "../../../../constants/constants";
import axios from "axios";
import classnames from "classnames";
import ReactDOM from "react-dom";
import css from "./RestorePasswordSendEmailModal.module.css";

export function RestorePasswordSendEmailModal() {
  const { modals, openModal, closeModal } = useModal();
  const isVisible = modals.restorePasswordSendEmail;

  const errorMessageTemplates = {
    required: "Обов'язкове поле",
    email: "Введіть E-mail у форматі name@example.com",
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({ mode: "all" });

  const disabled = !isValid || isSubmitting;

  const onSubmit = async (value) => {
    await axios({
      method: "post",
      url: `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/users/reset_password/`,
      data: { email: value.email },
    })
      .then(() => {
        closeModal("restorePasswordSendEmail");
        openModal("restorePasswordCompletion");
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
      onMouseDown={(e) => {
        if (!e.target.closest(`.${css["modal-content"]}`)) {
          closeModal("restorePasswordSendEmail");
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
              onClick={() => closeModal("restorePasswordSendEmail")}
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
