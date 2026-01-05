"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { useStopwatch } from "react-timer-hook";
import { PASSWORD_PATTERN } from "../../../constants/constants";
import { useAuth } from "../../../hooks/useAuth";
import { fetchWithAuth } from "../../../lib/fetchWithAuth";
import { ALLOWED_NAME_SURNAME_SYMBOLS_PATTERN } from "../../../constants/constants";
import { DateInput } from "../../../components/Inputs/DateInput/DateInput";
import { PhoneInput } from "../../../components/Inputs/IntlPhoneInput/IntlPhoneInput";
import ua from "../../../components/Inputs/IntlPhoneInput/IntlPhoneComponents/lang/ua";
import classnames from "classnames";
import css from "./MyCabinet.module.css";

export function MyCabinet() {
  const [activeEditUser, setActiveEditUser] = useState(false);
  const [activeEditPassword, setActiveEditPassword] = useState(false);
  const { user, setUser } = useAuth();

  const {
    minutes: minutesEditUser,
    isRunning: isRunningEditUser,
    start: startEditUser,
    reset: resetRateEditUser,
  } = useStopwatch({
    autoStart: false,
  });

  const errorEditUserMessageTemplates = {
    required: "Обов'язкове поле",
    nameSurnameFieldLength: "Введіть від 2 до 50 символів",
    notAllowedSymbols: "Поле містить недопустимі символи та/або цифри",
    date_of_birth: "Невірний формат",
    phone: "Невірний формат",
    rateError: (sec) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `Дуже багато запитів. Спробуйте пізніше через ${m} хв ${s} сек`;
    },
  };

  const {
    register: registerEditUser,
    control: controlEditUser,
    handleSubmit: handleSubmitEditUser,
    reset: resetEditUser,
    formState: {
      errors: errorsEditUser,
      isValid: isValidEditUser,
      isSubmitting: isSubmittingEditUser,
    },
  } = useForm({
    mode: "all",
    criteriaMode: "all",
    defaultValues: {
      surname: user.surname,
      name: user.name,
      date_of_birth: user.date_of_birth,
      phone: user.phone,
    },
  });

  const validateNameSurname = (value) => {
    const letterCount = (value.match(/[a-zA-Zа-щюяьА-ЩЮЯЬїЇіІєЄґҐ]/g) || [])
      .length;
    if (!ALLOWED_NAME_SURNAME_SYMBOLS_PATTERN.test(value)) {
      return errorEditUserMessageTemplates.notAllowedSymbols;
    }
    if (letterCount < 2) {
      return errorEditUserMessageTemplates.nameSurnameFieldLength;
    }
    return true;
  };

  const disabledEditUser =
    !isValidEditUser ||
    isSubmittingEditUser ||
    (isRunningEditUser && minutesEditUser < 1);

  useEffect(() => {
    if (user) {
      resetEditUser({
        surname: user.surname,
        name: user.name,
        date_of_birth: user.date_of_birth,
        phone: user.phone,
      });
    }
  }, [user, resetEditUser]);

  const onSubmitEditUser = async (value) => {
    const dataToSend = {
      surname: value.surname,
      name: value.name,
      date_of_birth: value.date_of_birth,
      phone: value.phone,
    };

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/users/me/`,
        {
          method: "PATCH",
          data: dataToSend,
        }
      );
      toast.success("Акаунт успішно оновлено.");
      setUser(response);
      setActiveEditUser(false);
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
        isRunningEditUser ? resetRateEditUser() : startEditUser();
        toast.error(errorEditUserMessageTemplates.rateError(waitSeconds));
        return;
      }
      toast.error("Під час оновлення акаунту сталася помилка. Спробуйте пізніше.");
    }
  };

  const {
    minutes: minutesSetPassword,
    isRunning: isRunningSetPassword,
    start: startSetPassword,
    reset: resetRateSetPassword,
  } = useStopwatch({
    autoStart: false,
  });

  const errorSetPasswordMessageTemplates = {
    required: "Обов'язкове поле",
    password: "Пароль повинен бути 8+ символів, містити хоча б одну велику, одну маленьку літеру та одну цифру",
    confirmPassword: "Паролі не співпадають",
    maxLength: "Кількість символів перевищує максимально допустиму (128 символів)",
    rateError: (sec) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `Дуже багато запитів. Спробуйте пізніше через ${m} хв ${s} сек`;
    },
  };

  const {
    register: registerSetPassword,
    handleSubmit: handleSubmitSetPassword,
    watch: watchSetPassword,
    setError: setErrorSetPassword,
    trigger: triggerSetPassword,
    reset: resetSetPassword,
    formState: {
      errors: errorsSetPassword,
      isValid: isValidSetPassword,
      isSubmitting: isSubmittingSetPassword,
    },
  } = useForm({ mode: "all", criteriaMode: "all" });

  const watchedOldPassword = watchSetPassword("oldPassword");
  const watchedPassword = watchSetPassword("password");
  const watchedConfirmPassword = watchSetPassword("confirmPassword");
  const disabledSetPassword =
    !isValidSetPassword ||
    isSubmittingSetPassword ||
    (isRunningSetPassword && minutesSetPassword < 1);

  useEffect(() => {
    const handleValidation = async () => {
      await triggerSetPassword(["oldPassword", "password", "confirmPassword"]);
    };

    if (watchedOldPassword && watchedPassword && watchedConfirmPassword) {
      handleValidation();
    }
  }, [watchedOldPassword, watchedPassword, watchedConfirmPassword, triggerSetPassword]);

  const onSubmitSetPassword = async (value) => {
    const dataToSend = {
      current_password: value.oldPassword,
      new_password: value.password,
      re_new_password: value.confirmPassword,
    };

    try {
      await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/auth/users/set_password/`,
        {
          method: "POST",
          data: dataToSend,
        }
      );
      toast.success("Пароль успішно змінено.");
      setActiveEditPassword(false);
      resetSetPassword();
    } catch (error) {
      const currentPasswordError = error.response?.data?.current_password?.[0];
      const newPasswordError = error.response?.data?.new_password?.[0];

      if (currentPasswordError === "Invalid password.") {
        setErrorSetPassword("oldPassword", {
          type: "manual",
          message: "Невірний поточний пароль.",
        });
        return;
      }
      if (newPasswordError) {
        if (newPasswordError === "This password is too common.") {
          setErrorSetPassword("confirmPassword", {
            type: "manual",
            message: "Пароль занадто поширений.",
          });
          return;
        }
        if (newPasswordError.startsWith("The password is too similar")) {
          setErrorSetPassword("confirmPassword", {
            type: "manual",
            message: "Пароль подібний до персональної інформації акаунту.",
          });
          return;
        }
      }
      if (error.response?.status === 429) {
        const resp = error.response.data;
        let waitSeconds = 600;
        if (resp.detail) {
          const match = resp.detail.match(/(\d+)\s*seconds/);
          if (match) {
            waitSeconds = parseInt(match[1], 10);
          }
        }
        isRunningSetPassword ? resetRateSetPassword() : startSetPassword();
        toast.error(errorSetPasswordMessageTemplates.rateError(waitSeconds));
        return;
      }
      toast.error("Під час зміни паролю сталася помилка. Спробуйте пізніше.");
    }
  };

  return (
    <>
      <div className={css["cabinet__header"]}>Особистий кабінет</div>
      <div className={css["cabinet__section"]}>
        <div className={css["cabinet__section-title"]}>Особисті дані</div>
        <div className={css["cabinet__section-my-data-box"]}>
          <div className={css["tab-content"]}>
            <div
              className={`${css["tab-pane"]} ${
                activeEditUser ? "" : css["active"]
              }`}
            >
              <div className={css["my-data-box__row"]}>
                <div className={css["my-data-box__item"]}>
                  <div className={css["my-data-box__item-label"]}>Прізвище:</div>
                  <div className={css["my-data-box__item-value"]}>{user.surname}</div>
                </div>
                <div className={css["my-data-box__item"]}>
                  <div className={css["my-data-box__item-label"]}>Ім'я:</div>
                  <div className={css["my-data-box__item-value"]}>{user.name}</div>
                </div>
                <div className={css["my-data-box__item"]}>
                  <div className={css["my-data-box__item-label"]}>Дата народження:</div>
                  <div className={css["my-data-box__item-value"]}>{user.date_of_birth || "-"}</div>
                </div>
                <div className={css["my-data-box__item"]}>
                  <div className={css["my-data-box__item-label"]}>Телефон:</div>
                  <div className={css["my-data-box__item-value"]}>{user.phone || "-"}</div>
                </div>
                <div className={css["my-data-box__item"]}>
                  <div className={css["my-data-box__item-label"]}>Email:</div>
                  <div className={css["my-data-box__item-value"]}>{user.email}</div>
                </div>
              </div>
              <div className={css["my-data__btn-wrapper"]}>
                <button
                  className={css["my-data__btn-edit"]}
                  onClick={() => setActiveEditUser(true)}
                >
                  Редагувати
                </button>
              </div>
            </div>
            <div
              className={`${css["tab-pane"]} ${
                activeEditUser ? css["active"] : ""
              }`}
            >
              <fieldset disabled={!activeEditUser}>
                <form onSubmit={handleSubmitEditUser(onSubmitEditUser)} noValidate>
                  <div className={css["forms__item"]}>
                    <div
                      className={classnames(css["form-floating"], {
                        [css["has-error"]]: errorsEditUser.surname,
                      })}
                    >
                      <input
                        id="userform-surname"
                        type="text"
                        className={css["form-input"]}
                        {...registerEditUser("surname", {
                          required: errorEditUserMessageTemplates.required,
                          validate: validateNameSurname,
                        })}
                        maxLength={50}
                      />
                      <label htmlFor="userform-surname">Прізвище</label>
                      <p className={css["error-message"]}>
                        {errorsEditUser.surname && errorsEditUser.surname.message}
                      </p>
                    </div>
                  </div>
                  <div className={css["forms__item"]}>
                    <div
                      className={classnames(css["form-floating"], {
                        [css["has-error"]]: errorsEditUser.name,
                      })}
                    >
                      <input
                        id="userform-name"
                        type="text"
                        className={css["form-input"]}
                        {...registerEditUser("name", {
                          required: errorEditUserMessageTemplates.required,
                          validate: validateNameSurname,
                        })}
                        maxLength={50}
                      />
                      <label htmlFor="userform-name">Ім'я</label>
                      <p className={css["error-message"]}>
                        {errorsEditUser.name && errorsEditUser.name.message}
                      </p>
                    </div>
                  </div>
                  <div className={css["forms__item"]}>
                    <div
                      className={classnames(css["form-floating"], {
                        [css["has-error"]]: errorsEditUser.date_of_birth,
                      })}
                    >
                      <DateInput
                        id="userform-date_of_birth"
                        name="date_of_birth"
                        control={controlEditUser}
                        rules={{
                          validate: (value) => {
                            if (!value) return true;
                            if (value.includes("y") || value.includes("m") || value.includes("d")) {
                              return errorEditUserMessageTemplates.date_of_birth;
                            }
                            return true;
                          },
                        }}
                        className={css["form-input"]}
                      />
                      <label htmlFor="userform-date_of_birth">Дата народження</label>
                      <p className={css["error-message"]}>
                        {errorsEditUser.date_of_birth && errorsEditUser.date_of_birth.message}
                      </p>
                    </div>
                  </div>
                  <div className={css["forms__item"]}>
                    <div className={css["form-floating"]}>
                      <PhoneInput
                        name="phone"
                        control={controlEditUser}
                        rules={{
                          required: false,
                        }}
                        country="ua"
                        localization={ua}
                        preferredCountries={["ua"]}
                        excludeCountries={["ru"]}
                        enableSearch={true}
                        enableTerritories={true}
                        enableAreaCodes={true}
                        inputProps={{
                          id: "userform-phone",
                        }}
                      />
                      <label htmlFor="userform-phone">Телефон</label>
                      <p className={css["error-message"]}>
                        {errorsEditUser.phone && errorsEditUser.phone.message}
                      </p>
                    </div>
                  </div>
                  <div className={css["forms__item"]}>
                    <div
                      className={classnames(css["form-floating"], css["disabled"])}
                    >
                      <input
                        id="userform-email"
                        type="email"
                        className={css["form-input"]}
                        value={user.email}
                        disabled
                      />
                      <label htmlFor="userform-email">E-mail</label>
                    </div>
                  </div>
                  <div className={css["my-data__buttons"]}>
                    <div className={css["my-data__btn-wrapper"]}>
                      <button
                        type="submit"
                        disabled={disabledEditUser}
                        className={css["my-data__btn-save"]}
                      >
                        Зберегти
                      </button>
                    </div>
                    <div className={css["my-data__btn-wrapper"]}>
                      <button
                        className={css["my-data__btn-cancel"]}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveEditUser(false);
                          resetEditUser();
                        }}
                      >
                        Відмінити
                      </button>
                    </div>
                  </div>
                </form>
              </fieldset>
            </div>
          </div>
        </div>
      </div>
      <div className={css["cabinet__section"]}>
        <div className={css["cabinet__section-title"]}>Зміна паролю</div>
        <div className={css["cabinet__section-my-data-box"]}>
          <div className={css["tab-content"]}>
            <div
              className={`${css["tab-pane"]} ${
                activeEditPassword ? "" : css["active"]
              }`}
            >
              <div className={css["my-data-box__row"]}>
                <div className={css["my-data-box__item"]}>
                  <div className={css["my-data-box__item-label"]}>Пароль:</div>
                  <div className={css["my-data-box__item-value"]}>******</div>
                </div>
              </div>
              <div className={css["my-data__btn-wrapper"]}>
                <button
                  className={css["my-data__btn-edit"]}
                  onClick={() => setActiveEditPassword(true)}
                >
                  Редагувати
                </button>
              </div>
            </div>
            <div
              className={`${css["tab-pane"]} ${
                activeEditPassword ? css["active"] : ""
              }`}
            >
              <fieldset disabled={!activeEditPassword}>
                <form onSubmit={handleSubmitSetPassword(onSubmitSetPassword)} noValidate>
                  <div className={css["forms__item"]}>
                    <div
                      className={classnames(css["form-floating"], {
                        [css["has-error"]]: errorsSetPassword.oldPassword,
                      })}
                    >
                      <input
                        id="passwordform-old-password"
                        type="password"
                        className={css["form-input"]}
                        {...registerSetPassword("oldPassword", {
                          required: errorSetPasswordMessageTemplates.required,
                          pattern: {
                            value: PASSWORD_PATTERN,
                            message: errorSetPasswordMessageTemplates.password,
                          },
                          maxLength: {
                            value: 128,
                            message: errorSetPasswordMessageTemplates.maxLength,
                          },
                        })}
                      />
                      <label htmlFor="passwordform-old-password">Поточний пароль</label>
                      <div className={css["error-message"]}>
                        <ErrorMessage
                          errors={errorsSetPassword}
                          name={"oldPassword"}
                          render={({ message, messages }) =>
                            messages
                              ? Object.entries(messages).map(([type, msg]) => <p key={type}>{msg}</p>)
                              : message && <p>{message}</p>
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className={css["forms__item"]}>
                    <div
                      className={classnames(css["form-floating"], {
                        [css["has-error"]]: errorsSetPassword.password,
                      })}
                    >
                      <input
                        id="passwordform-password"
                        type="password"
                        className={css["form-input"]}
                        {...registerSetPassword("password", {
                          required: errorSetPasswordMessageTemplates.required,
                          pattern: {
                            value: PASSWORD_PATTERN,
                            message: errorSetPasswordMessageTemplates.password,
                          },
                          maxLength: {
                            value: 128,
                            message: errorSetPasswordMessageTemplates.maxLength,
                          },
                        })}
                      />
                      <label htmlFor="passwordform-password">Новий пароль</label>
                      <div className={css["error-message"]}>
                        <ErrorMessage
                          errors={errorsSetPassword}
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
                        [css["has-error"]]: errorsSetPassword.confirmPassword,
                      })}
                    >
                      <input
                        id="passwordform-password-confirm"
                        type="password"
                        className={css["form-input"]}
                        {...registerSetPassword("confirmPassword", {
                          required: errorSetPasswordMessageTemplates.required,
                          maxLength: {
                            value: 128,
                            message: errorSetPasswordMessageTemplates.maxLength,
                          },
                          validate: (value) =>
                            watchSetPassword("password") !== value
                              ? errorSetPasswordMessageTemplates.confirmPassword
                              : null,
                        })}
                      />
                      <label htmlFor="passwordform-password-confirm">Повторіть новий пароль</label>
                      <div className={css["error-message"]}>
                        <ErrorMessage
                          errors={errorsSetPassword}
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
                  <div className={css["my-data__buttons"]}>
                    <div className={css["my-data__btn-wrapper"]}>
                      <button
                        type="submit"
                        disabled={disabledSetPassword}
                        className={css["my-data__btn-save"]}
                      >
                        Зберегти
                      </button>
                    </div>
                    <div className={css["my-data__btn-wrapper"]}>
                      <button
                        className={css["my-data__btn-cancel"]}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveEditPassword(false);
                          resetSetPassword();
                        }}
                      >
                        Відмінити
                      </button>
                    </div>
                  </div>
                </form>
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
