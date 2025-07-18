import { useEffect, useState } from "react";
import { useModal } from "../../../hooks/useModal";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { EMAIL_PATTERN } from "../../../constants/constants";
import classnames from "classnames";
import axios from "axios";
import ReactDOM from "react-dom";
import css from "./SignUpResendActivationModal.module.css";

export function SignUpResendActivationModal({
  show,
  handleClose,
  handleOpenAuth,
}) {
  const { setOverlayVisible } = useModal();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(show);
    setOverlayVisible(show);
  }, [show, setOverlayVisible]);

  const errorMessageTemplates = {
    required: "Field is required",
    email: "Enter E-mail in format name@example.com",
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
      url: `${process.env.REACT_APP_BASE_API_URL}/api/auth/users/resend_activation/`,
      data: { email: value.email },
    })
      .then(() => {
        handleClose();
        setTimeout(() => handleOpenAuth(), 1);
      })
      .catch(() => {
        toast.error(
          "Failed to resend activation link. Please try again later."
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
            <p className={css["modal-title"]}>Resend activation link</p>
            <img
              src={`${process.env.REACT_APP_PUBLIC_URL}/svg/delete.svg`}
              className={css["modal-close-button"]}
              alt="Close"
              onClick={handleClose}
            />
          </div>
          <div className={css["modal-body"]}>
            <p className={css["modal-body-text"]}>
              Enter the email address you provided during sign-up to resend the
              activation link. <br /> The activation link will be sent to this
              email address.
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
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
