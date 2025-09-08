import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useModal } from "../../hooks/useModal";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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
} from "../../constants/constants";
import css from "./AuthModal.module.css";

export function AuthModal({
  show,
  handleClose,
  handleOpenSignUpCompletion,
  handleOpenRestorePasswordSendEmail,
}) {
  const { login } = useAuth();
  const { setCart } = useCart();
  const { showOverlay, hideOverlay } = useModal();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [activeForm, setActiveForm] = useState("signIn");

  useEffect(() => {
    setIsVisible(show);
    show ? showOverlay() : hideOverlay();
  }, [show, showOverlay, hideOverlay]);

  const toggleForm = (form) => {
    setActiveForm(form);
  };

  const errorMessageTemplates = {
    required: "Обов'язкове поле",
    email: "Введіть E-mail у форматі name@example.com",
    unspecifiedError: "E-mail або пароль вказані некоректно",
  };

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm({ mode: "all" });

  const watchedEmail = watch("email");
  const watchedPassword = watch("password");
  const disabled = !isValid;

  useEffect(() => {
    clearErrors("unspecifiedError");
  }, [watchedEmail, watchedPassword, clearErrors]);

  const onSubmit = async (value) => {
    await axios({
      method: "post",
      url: `${process.env.REACT_APP_BASE_API_URL}/api/auth/token/login/`,
      data: { email: value.email, password: value.password },
    })
      .then(async (resp) => {
        const authToken = resp.data.auth_token;
        await axios({
          method: "post",
          url: `${process.env.REACT_APP_BASE_API_URL}/api/cart/sync/`,
          headers: { Authorization: `Token ${authToken}` },
          withCredentials: true,
        })
          .then((syncResp) => {
            setCart(syncResp.data.items || []);
          })
          .catch((error) => {
            console.error("Cart sync failed:", error);
          });
        login(authToken);
        handleClose();
        navigate("/profile/user-info");
      })
      .catch((error) => {
        if (error.response.status === 400) {
          const resp = error.response.data;
          if (
            resp.email_not_verified &&
            resp.email_not_verified[0] === "E-mail verification required"
          ) {
            handleClose();
            handleOpenSignUpCompletion();
          }
          if (
            resp.non_field_errors &&
            resp.non_field_errors[0] ===
              "Unable to log in with provided credentials."
          ) {
            setError("unspecifiedError", {
              type: "manual",
              message: errorMessageTemplates.unspecifiedError,
            });
          }
        }
      });
  };

  const errorSignUpMessageTemplates = {
    required: "Обов'язкове поле",
    nameSurnameFieldLength: "Введіть від 2 до 50 символів",
    email: "Введіть E-mail у форматі name@example.com",
    password: "Пароль повинен бути 8+ символів, містити хоча б одну велику, одну маленьку літеру та одну цифру",
    confirmPassword: "Паролі не співпадають",
    notAllowedSymbols: "Поле містить недопустимі символи та/або цифри",
    maxLength: "Кількість символів перевищує максимально допустиму (128 символів)",
  };

  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    watch: watchSignUp,
    setError: setErrorSignUp,
    trigger: triggerSignUp,
    formState: { errors: errorsSignUp, isValid: isValidSignUp },
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
  const disabledSignUp = !isValidSignUp;

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

    await axios({
      method: "post",
      url: `${process.env.REACT_APP_BASE_API_URL}/api/auth/users/`,
      data: dataToSend,
    })
      .then(() => {
        handleClose();
        handleOpenSignUpCompletion();
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          if (error.response.data.email) {
            setErrorSignUp("email", {
              type: "manual",
              message: "E-mail already exists",
            });
          } else {
            toast.error(
              "Під час реєстрації сталася помилка. Спробуйте пізніше."
            );
          }
        }
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
          <img
            src={`${process.env.REACT_APP_PUBLIC_URL}/svg/delete.svg`}
            className={css["modal-close-button"]}
            alt="Close"
            onClick={handleClose}
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
                        handleClose();
                        handleOpenRestorePasswordSendEmail();
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
              </div>
              <div
                className={`${css["tab-pane"]} ${
                  activeForm === "signUp" ? css["active"] : ""
                }`}
              >
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
