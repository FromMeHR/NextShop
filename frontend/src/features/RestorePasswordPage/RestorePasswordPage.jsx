"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { PASSWORD_PATTERN } from "../../constants/constants";
import { useModal } from "../../hooks/useModal";
import axios from "axios";
import classnames from "classnames";
import css from "./RestorePasswordPage.module.css";

export function RestorePasswordPage({ uid, token }) {
  const { openModal } = useModal();

  const errorMessageTemplates = {
    required: "Обов'язкове поле",
    password: "Пароль повинен бути 8+ символів, містити хоча б одну велику, одну маленьку літеру та одну цифру",
    confirmPassword: "Паролі не співпадають",
    maxLength: "Кількість символів перевищує максимально допустиму (128 символів)",
  };

  const {
    register,
    handleSubmit,
    watch,
    setError,
    trigger,
    formState: { errors, isValid, isSubmitting },
  } = useForm({ mode: "all", criteriaMode: "all" });

  const watchedPassword = watch("password");
  const watchedConfirmPassword = watch("confirmPassword");
  const disabled = !isValid || isSubmitting;

  useEffect(() => {
    const handleValidation = async () => {
      await trigger(["password", "confirmPassword"]);
    };

    if (watchedPassword && watchedConfirmPassword) {
      handleValidation();
    }
  }, [watchedPassword, watchedConfirmPassword, trigger]);

  const onSubmit = async (value) => {
    const dataToSend = {
      uid: uid,
      token: token,
      new_password: value.password,
      re_new_password: value.confirmPassword,
    };

    try {
      const resp = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/users/reset_password_confirm/`,
        dataToSend
      );
      openModal("restorePasswordResult", { restorePasswordStatus: resp.data.message });
    } catch (error) {
      const newPasswordError = error.response?.data?.new_password?.[0];
      if (newPasswordError) {
        if (newPasswordError === "This password is too common.") {
          setError("confirmPassword", {
            type: "manual",
            message: "Пароль занадто поширений.",
          });
        } else if (newPasswordError.startsWith("The password is too similar to the")) {
          setError("confirmPassword", {
            type: "manual",
            message: "Пароль подібний до персональної інформації акаунту.",
          });
        }
      } else {
        openModal("restorePasswordResult", { restorePasswordStatus: "Restore password error" });
      }
    }
  };

  return (
    <div className={css["container"]}>
      <div className={css["container__body"]}>
        <p className={css["title"]}>Відновлення паролю</p>
        <div className={css["content"]}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={css["forms__item"]}>
              <div
                className={classnames(css["form-floating"], {
                  [css["has-error"]]: errors.password,
                })}
              >
                <input
                  id="form-password"
                  type="password"
                  {...register("password", {
                    required: errorMessageTemplates.required,
                    pattern: {
                      value: PASSWORD_PATTERN,
                      message: errorMessageTemplates.password,
                    },
                    maxLength: {
                      value: 128,
                      message: errorMessageTemplates.maxLength,
                    },
                  })}
                />
                <label htmlFor="form-password">Новий пароль</label>
                <div className={css["error-message"]}>
                  <ErrorMessage
                    errors={errors}
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
                  [css["has-error"]]: errors.confirmPassword,
                })}
              >
                <input
                  id="form-password_confirm"
                  type="password"
                  {...register("confirmPassword", {
                    required: errorMessageTemplates.required,
                    maxLength: {
                      value: 128,
                      message: errorMessageTemplates.maxLength,
                    },
                    validate: (value) =>
                      watch("password") !== value
                        ? errorMessageTemplates.confirmPassword
                        : null,
                  })}
                />
                <label htmlFor="form-password_confirm">Повторіть новий пароль</label>
                <div className={css["error-message"]}>
                  <ErrorMessage
                    errors={errors}
                    name={"confirmPassword"}
                    render={({ message, messages }) =>
                      messages
                        ? Object.entries(messages).map(([type, msg]) => <p key={type}>{msg}</p>)
                        : message && <p>{message}</p>
                    }
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={disabled}
              className={css["save-password-form__btn"]}
            >
              Зберегти пароль
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
