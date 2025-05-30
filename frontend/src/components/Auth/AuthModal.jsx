import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import validator from "validator";
import classnames from "classnames";
import axios from "axios";
import css from "./AuthModal.module.css";

export function AuthModal({ show, handleClose, successAuth }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [activeForm, setActiveForm] = useState("signIn");

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const toggleForm = (form) => {
    setActiveForm(form);
  };

  const errorMessageTemplates = {
    required: "Field is required",
    email: "Enter E-mail in format name@example.com",
    unspecifiedError: "E-mail or password is incorrect",
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
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_API_URL}/api/auth/token/login/`,
        {
          email: value.email,
          password: value.password,
        }
      );
      const authToken = response.data.auth_token;
      login(authToken);
      handleClose();
      successAuth();
      navigate("/profile/user-info");
    } catch (error) {
      console.error(error);
      if (error.response.status === 400) {
        const resp = error.response.data.non_field_errors[0];
        if (resp === "Unable to log in with provided credentials.") {
          setError("unspecifiedError", {
            type: "manual",
            message: errorMessageTemplates.unspecifiedError,
          });
        }
      }
    }
  };

  return (
    <>
      <div
        className={`${css["overlay"]} ${isVisible ? css["show"] : ""}`}
        onClick={handleClose}
      ></div>
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
                      <div className={css["choose-tabs__title"]}>Sign in</div>
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
                      <div className={css["choose-tabs__title"]}>Sign up</div>
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
                          [css["has-error"]]: errors.email || errors.required,
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
                          {errors.required && errors.required.message}
                        </p>
                      </div>
                    </div>
                    <div className={css["forms__item"]}>
                      <div
                        className={classnames(css["form-floating"], {
                          [css["has-error"]]:
                            errors.password || errors.required,
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
                        <label htmlFor="loginform-password">Password</label>
                        <p className={css["error-message"]}>
                          {errors.password && errors.password.message}
                          {errors.required && errors.required.message}
                          {errors.unspecifiedError &&
                            errors.unspecifiedError.message}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`${css["forms__item"]} ${css["forgot-password-wrap"]}`}
                    >
                      <button className={css["forgot-password"]} type="button">
                        Forgot password
                      </button>
                    </div>
                    <button disabled={disabled} className={css["signin-form__btn"]} type="submit">
                      Sign in
                    </button>
                  </form>
                </div>
                <div
                  className={`${css["tab-pane"]} ${
                    activeForm === "signUp" ? css["active"] : ""
                  }`}
                >
                  <form noValidate>
                    <div className={css["forms__item"]}>
                      <div className={css["form-floating"]}>
                        <input type="text" id="signupform-surname" />
                        <label htmlFor="signupform-surname">Last name</label>
                      </div>
                    </div>
                    <div className={css["forms__item"]}>
                      <div className={css["form-floating"]}>
                        <input type="text" id="signupform-name" />
                        <label htmlFor="signupform-name">First name</label>
                      </div>
                    </div>
                    <div className={css["forms__item"]}>
                      <div className={css["form-floating"]}>
                        <input type="text" id="signupform-email" />
                        <label htmlFor="signupform-email">E-mail</label>
                      </div>
                    </div>
                    <div className={css["forms__item"]}>
                      <div className={css["form-floating"]}>
                        <input type="password" id="signupform-password" />
                        <label htmlFor="signupform-password">Password</label>
                      </div>
                    </div>
                    <div className={css["forms__item"]}>
                      <div className={css["form-floating"]}>
                        <input
                          type="password"
                          id="signupform-password_confirm"
                        />
                        <label htmlFor="signupform-password_confirm">
                          Repeat password
                        </label>
                      </div>
                    </div>
                    <button className={css["signup-form__btn"]} type="submit">
                      Sign up
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
