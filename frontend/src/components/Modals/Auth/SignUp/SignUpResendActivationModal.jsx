import { useModal } from "../../../../hooks/useModal";
import { useForm } from "react-hook-form";
import { useStopwatch } from "react-timer-hook";
import { toast } from "react-toastify";
import { EMAIL_PATTERN } from "../../../../constants/constants";
import classnames from "classnames";
import axios from "axios";
import ReactDOM from "react-dom";
import css from "./SignUpResendActivationModal.module.css";

export function SignUpResendActivationModal() {
  const { modals, openModal, closeModal } = useModal();
  const isVisible = modals.signUpResendActivation;

  const { minutes, isRunning, start, reset } = useStopwatch({
    autoStart: false,
  });

  const errorMessageTemplates = {
    required: "Обов'язкове поле",
    email: "Введіть E-mail у форматі name@example.com",
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({ mode: "all" });

  const disabled = !isValid || isSubmitting || (isRunning && minutes < 1);

  const onSubmit = async (value) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/users/resend_activation/`,
        { email: value.email }
      );
      closeModal("signUpResendActivation");
      openModal("auth");
      toast.success("Лист успішно надіслано.");
    } catch (error) {
      if (error.response?.status === 429) {
        const resp = error.response.data;
        let waitSeconds = 600;
        if (resp.detail) {
          const match = resp.detail.match(/(\d+)\s*seconds/);
          if (match) {
            waitSeconds = parseInt(match[1], 10);
          }
        }
        const m = Math.floor(waitSeconds / 60);
        const s = waitSeconds % 60;
        isRunning ? reset() : start();
        toast.error(`Дуже багато запитів. Спробуйте пізніше через ${m} хв ${s} сек`);
      } else {
        toast.error("Не вдалося надіслати лист. Спробуйте пізніше.");
      }
      console.error("Resend activation failed:", error);
    }
  };

  return ReactDOM.createPortal(
    <div
      className={`${css["modal"]} ${isVisible ? css["show"] : ""}`}
      onMouseDown={(e) => {
        if (!e.target.closest(`.${css["modal-content"]}`)) {
          closeModal("signUpResendActivation");
        }
      }}
    >
      <div className={css["modal-dialog"]}>
        <div className={css["modal-content"]}>
          <div className={css["modal-header"]}>
            <p className={css["modal-title"]}>
              Повторне надсилання листа активації
            </p>
            <img
              src={`${process.env.NEXT_PUBLIC_URL}/svg/delete.svg`}
              className={css["modal-close-button"]}
              alt="Close"
              onClick={() => closeModal("signUpResendActivation")}
            />
          </div>
          <div className={css["modal-body"]}>
            <p className={css["modal-body-text"]}>
              Введіть електронну адресу вказану при реєстрації для повторного
              надсилання листа. <br /> На зазначену Вами електронну пошту буде
              відправлено листа з посиланням для активації.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className={css["forms__item"]}>
                <div
                  className={classnames(css["form-floating"], {
                    [css["has-error"]]: errors.email,
                  })}
                >
                  <input
                    id="resend-email"
                    type="email"
                    {...register("email", {
                      required: errorMessageTemplates.required,
                      pattern: {
                        value: EMAIL_PATTERN,
                        message: errorMessageTemplates.email,
                      },
                    })}
                  />
                  <label htmlFor="resend-email">E-mail</label>
                  <p className={css["error-message"]}>
                    {errors.email && errors.email.message}
                  </p>
                </div>
              </div>
              <button
                type="submit"
                disabled={disabled}
                className={css["resend-form__btn"]}
              >
                Надіслати
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
