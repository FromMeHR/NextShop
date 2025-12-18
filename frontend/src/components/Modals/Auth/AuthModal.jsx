import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useCart } from "../../../hooks/useCart";
import { useModal } from "../../../hooks/useModal";
import { fetchWithAuth } from "../../../lib/fetchWithAuth";
import { useForm } from "react-hook-form";
import { useStopwatch } from "react-timer-hook";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ErrorMessage } from "@hookform/error-message";
import validator from "validator";
import classnames from "classnames";
import axios from "axios";
import ReactDOM from "react-dom";
import {
  EMAIL_PATTERN,
  PASSWORD_PATTERN,
  ALLOWED_NAME_SURNAME_SYMBOLS_PATTERN,
} from "../../../constants/constants";
import css from "./AuthModal.module.css";

export function AuthModal() {
  const { login, mutate } = useAuth();
  const { setCart } = useCart();
  const { modals, openModal, closeModal } = useModal();
  const isVisible = modals.auth;
  const router = useRouter();
  const [activeForm, setActiveForm] = useState("signIn");

  const toggleForm = (form) => {
    setActiveForm(form);
  };

  const { minutes, isRunning, start, reset } = useStopwatch({
    autoStart: false,
  });

  const errorMessageTemplates = {
    required: "Обов'язкове поле",
    email: "Введіть E-mail у форматі name@example.com",
    unspecifiedError: "E-mail або пароль вказані некоректно",
    rateError: (sec) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `Дуже багато запитів. Спробуйте пізніше через ${m} хв ${s} сек`;
    },
  };

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isValid, isSubmitting },
  } = useForm({ mode: "all" });

  const watchedEmail = watch("email");
  const watchedPassword = watch("password");
  const disabled = !isValid || isSubmitting || (isRunning && minutes < 1);

  useEffect(() => {
    clearErrors("unspecifiedError");
  }, [watchedEmail, watchedPassword, clearErrors]);

  const onSubmit = async (value) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/jwt/create/`,
        { email: value.email, password: value.password }
      );

      try {
        const syncResp = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cart/sync/`,
          { method: "POST" }
        );
        setCart(syncResp.items || []);
      } catch (syncError) {
        console.error("Cart sync failed:", syncError);
      }

      login();
      mutate();
      closeModal("auth");
      router.push("/profile/user-info");
    } catch (error) {
      if (error.response?.status === 401) {
        const resp = error.response.data;
        if (
          resp.email_not_verified &&
          resp.email_not_verified === "E-mail verification required"
        ) {
          closeModal("auth");
          openModal("signUpCompletion");
          return;
        }
        if (
          resp.detail &&
          resp.detail === "No active account found with the given credentials"
        ) {
          setError("unspecifiedError", {
            type: "manual",
            message: errorMessageTemplates.unspecifiedError,
          });
          return;
        }
      } else if (error.response?.status === 429) {
        const resp = error.response.data;
        let waitSeconds = 600;
        if (resp.detail) {
          const match = resp.detail.match(/(\d+)\s*seconds/);
          if (match) {
            waitSeconds = parseInt(match[1], 10);
          }
        }
        isRunning ? reset() : start();
        toast.error(errorMessageTemplates.rateError(waitSeconds));
        return;
      }
      console.error("Login failed:", error);
      toast.error("Під час авторизації сталася помилка. Спробуйте пізніше.");
    }
  };

  const {
    minutes: minutesSignUp,
    isRunning: isRunningSignUp,
    start: startSignUp,
    reset: resetSignUp,
  } = useStopwatch({
    autoStart: false,
  });

  const errorSignUpMessageTemplates = {
    required: "Обов'язкове поле",
    nameSurnameFieldLength: "Введіть від 2 до 50 символів",
    email: "Введіть E-mail у форматі name@example.com",
    password: "Пароль повинен бути 8+ символів, містити хоча б одну велику, одну маленьку літеру та одну цифру",
    confirmPassword: "Паролі не співпадають",
    notAllowedSymbols: "Поле містить недопустимі символи та/або цифри",
    maxLength: "Кількість символів перевищує максимально допустиму (128 символів)",
    rateError: (sec) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `Дуже багато запитів. Спробуйте пізніше через ${m} хв ${s} сек`;
    },
  };

  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    watch: watchSignUp,
    setError: setErrorSignUp,
    trigger: triggerSignUp,
    formState: { errors: errorsSignUp, isValid: isValidSignUp, isSubmitting: isSubmittingSignUp },
  } = useForm({ mode: "all", criteriaMode: "all" });

  const validateNameSurname = (value) => {
    const letterCount = (value.match(/[a-zA-Zа-щюяьА-ЩЮЯЬїЇіІєЄґҐ]/g) || [])
      .length;
    if (!ALLOWED_NAME_SURNAME_SYMBOLS_PATTERN.test(value)) {
      return errorSignUpMessageTemplates.notAllowedSymbols;
    }
    if (letterCount < 2) {
      return errorSignUpMessageTemplates.nameSurnameFieldLength;
    }
    return true;
  };

  const watchedSignUpPassword = watchSignUp("password");
  const watchedSignUpConfirmPassword = watchSignUp("confirmPassword");
  const disabledSignUp = !isValidSignUp || isSubmittingSignUp || (isRunningSignUp && minutesSignUp < 1);

  useEffect(() => {
    const handleValidation = async () => {
      await triggerSignUp(["password", "confirmPassword"]);
    };

    if (watchedSignUpPassword && watchedSignUpConfirmPassword) {
      handleValidation();
    }
  }, [watchedSignUpPassword, watchedSignUpConfirmPassword, triggerSignUp]);

  const onSubmitSignUp = async (value) => {
    const dataToSend = {
      surname: value.surname,
      name: value.name,
      email: value.email,
      password: value.password,
      re_password: value.confirmPassword,
    };

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/users/`,
        dataToSend
      );
      closeModal("auth");
      openModal("signUpCompletion");
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.email) {
        setErrorSignUp("email", {
          type: "manual",
          message: "Цей E-mail вже зареєстровано.",
        });
        return;
      } else if (error.response?.status === 429) {
        const resp = error.response.data;
        let waitSeconds = 600;
        if (resp.detail) {
          const match = resp.detail.match(/(\d+)\s*seconds/);
          if (match) {
            waitSeconds = parseInt(match[1], 10);
          }
        }
        isRunningSignUp ? resetSignUp() : startSignUp();
        toast.error(errorSignUpMessageTemplates.rateError(waitSeconds));
        return;
      }
      console.error("Sign up failed:", error);
      toast.error("Під час реєстрації сталася помилка. Спробуйте пізніше.");
    }
  };

  return ReactDOM.createPortal(
    <div
      className={`${css["modal"]} ${isVisible ? css["show"] : ""}`}
      onMouseDown={(e) => {
        if (!e.target.closest(`.${css["modal-content"]}`)) {
          closeModal("auth");
        }
      }}
    >
      <div className={css["modal-dialog"]}>
        <div className={css["modal-content"]}>
          <img
            src={`${process.env.NEXT_PUBLIC_URL}/svg/delete.svg`}
            className={css["modal-close-button"]}
            alt="Close"
            onClick={() => closeModal("auth")}
          />
          <div className={css["modal-body"]}>
            <div className={css["choose-tabs"]}>
              <ul className={css["choose-tabs__wrap"]}>
                <li className={css["nav-item"]}>
                  <button
                    className={`${css["choose-tabs__item"]} ${
                      activeForm === "signIn" ? css["active"] : ""
                    }`}
                    onClick={() => toggleForm("signIn")}
                    type="button"
                  >
                    <div className={css["choose-tabs__title"]}>Вхід</div>
                  </button>
                </li>
                <li className={css["nav-item"]}>
                  <button
                    className={`${css["choose-tabs__item"]} ${
                      activeForm === "signUp" ? css["active"] : ""
                    }`}
                    onClick={() => toggleForm("signUp")}
                    type="button"
                  >
                    <div className={css["choose-tabs__title"]}>Реєстрація</div>
                  </button>
                </li>
              </ul>
            </div>
            <div className={css["tab-content"]}>
              <div
                className={`${css["tab-pane"]} ${
                  activeForm === "signIn" ? css["active"] : ""
                }`}
              >
                <fieldset disabled={activeForm !== "signIn"}>
                  <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className={css["forms__item"]}>
                      <div
                        className={classnames(css["form-floating"], {
                          [css["has-error"]]: errors.email,
                        })}
                      >
                        <input
                          id="loginform-email"
                          type="email"
                          autoComplete="username"
                          {...register("email", {
                            required: errorMessageTemplates.required,
                            validate: (value) =>
                              validator.isEmail(value) ||
                              errorMessageTemplates.email,
                          })}
                        />
                        <label htmlFor="loginform-email">E-mail</label>
                        <p className={css["error-message"]}>
                          {errors.email && errors.email.message}
                        </p>
                      </div>
                    </div>
                    <div className={css["forms__item"]}>
                      <div
                        className={classnames(css["form-floating"], {
                          [css["has-error"]]: errors.password,
                        })}
                      >
                        <input
                          id="loginform-password"
                          type="password"
                          autoComplete="current-password"
                          {...register("password", {
                            required: errorMessageTemplates.required,
                          })}
                        />
                        <label htmlFor="loginform-password">Пароль</label>
                        <p className={css["error-message"]}>
                          {errors.password && errors.password.message}
                          {errors.unspecifiedError &&
                            errors.unspecifiedError.message}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`${css["forms__item"]} ${css["forgot-password-wrap"]}`}
                    >
                      <button
                        type="button"
                        className={css["forgot-password"]}
                        onClick={() => {
                          closeModal("auth");
                          openModal("restorePasswordSendEmail");
                        }}
                      >
                        Забув пароль
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={disabled}
                      className={css["signin-form__btn"]}
                    >
                      Увійти
                    </button>
                  </form>
                </fieldset>
              </div>
              <div
                className={`${css["tab-pane"]} ${
                  activeForm === "signUp" ? css["active"] : ""
                }`}
              >
                <fieldset disabled={activeForm !== "signUp"}>
                  <form onSubmit={handleSubmitSignUp(onSubmitSignUp)} noValidate>
                    <div className={css["forms__item"]}>
                      <div
                        className={classnames(css["form-floating"], {
                          [css["has-error"]]: errorsSignUp.surname,
                        })}
                      >
                        <input
                          id="signupform-surname"
                          type="text"
                          {...registerSignUp("surname", {
                            required: errorSignUpMessageTemplates.required,
                            validate: validateNameSurname,
                          })}
                          maxLength={50}
                        />
                        <label htmlFor="signupform-surname">Прізвище</label>
                        <p className={css["error-message"]}>
                          {errorsSignUp.surname && errorsSignUp.surname.message}
                        </p>
                      </div>
                    </div>
                    <div className={css["forms__item"]}>
                      <div
                        className={classnames(css["form-floating"], {
                          [css["has-error"]]: errorsSignUp.name,
                        })}
                      >
                        <input
                          id="signupform-name"
                          type="text"
                          {...registerSignUp("name", {
                            required: errorSignUpMessageTemplates.required,
                            validate: validateNameSurname,
                          })}
                          maxLength={50}
                        />
                        <label htmlFor="signupform-name">Ім'я</label>
                        <p className={css["error-message"]}>
                          {errorsSignUp.name && errorsSignUp.name.message}
                        </p>
                      </div>
                    </div>
                    <div className={css["forms__item"]}>
                      <div
                        className={classnames(css["form-floating"], {
                          [css["has-error"]]: errorsSignUp.email,
                        })}
                      >
                        <input
                          id="signupform-email"
                          type="email"
                          {...registerSignUp("email", {
                            required: errorSignUpMessageTemplates.required,
                            pattern: {
                              value: EMAIL_PATTERN,
                              message: errorSignUpMessageTemplates.email,
                            },
                          })}
                        />
                        <label htmlFor="signupform-email">E-mail</label>
                        <p className={css["error-message"]}>
                          {errorsSignUp.email && errorsSignUp.email.message}
                        </p>
                      </div>
                    </div>
                    <div className={css["forms__item"]}>
                      <div
                        className={classnames(css["form-floating"], {
                          [css["has-error"]]: errorsSignUp.password,
                        })}
                      >
                        <input
                          id="signupform-password"
                          type="password"
                          {...registerSignUp("password", {
                            required: errorSignUpMessageTemplates.required,
                            pattern: {
                              value: PASSWORD_PATTERN,
                              message: errorSignUpMessageTemplates.password,
                            },
                            maxLength: {
                              value: 128,
                              message: errorSignUpMessageTemplates.maxLength,
                            },
                          })}
                        />
                        <label htmlFor="signupform-password">Пароль</label>
                        <div className={css["error-message"]}>
                          <ErrorMessage
                            errors={errorsSignUp}
                            name={"password"}
                            render={({ messages }) =>
                              messages &&
                              Object.entries(messages).map(([type, message]) => (
                                <p key={type}>{message}</p>
                              ))
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className={css["forms__item"]}>
                      <div
                        className={classnames(css["form-floating"], {
                          [css["has-error"]]: errorsSignUp.confirmPassword,
                        })}
                      >
                        <input
                          id="signupform-password_confirm"
                          type="password"
                          {...registerSignUp("confirmPassword", {
                            required: errorSignUpMessageTemplates.required,
                            maxLength: {
                              value: 128,
                              message: errorSignUpMessageTemplates.maxLength,
                            },
                            validate: (value) =>
                              watchSignUp("password") !== value
                                ? errorSignUpMessageTemplates.confirmPassword
                                : null,
                          })}
                        />
                        <label htmlFor="signupform-password_confirm">
                          Підтвердження паролю
                        </label>
                        <div className={css["error-message"]}>
                          <ErrorMessage
                            errors={errorsSignUp}
                            name={"confirmPassword"}
                            render={({ messages }) =>
                              messages &&
                              Object.entries(messages).map(([type, message]) => (
                                <p key={type}>{message}</p>
                              ))
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={disabledSignUp}
                      className={css["signup-form__btn"]}
                    >
                      Зареєструватися
                    </button>
                  </form>
                </fieldset>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
