"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchBox } from "./SearchBox";
import { useCart } from "../../../hooks/useCart";
import { useAuth } from "../../../hooks/useAuth";
import { useBurgerMenu } from "../../../hooks/useBurgerMenu";
import { CartModal } from "../../Cart/CartModal";
import { AuthModal } from "../../Auth/AuthModal";
import { SignUpCompletionModal } from "../../Auth/SignUp/SignUpCompletionModal";
import { SignUpResendActivationModal } from "../../Auth/SignUp/SignUpResendActivationModal";
import { RestorePasswordSendEmailModal } from "../../Auth/RestorePassword/RestorePasswordSendEmailModal";
import { RestorePasswordCompletionModal } from "../../Auth/RestorePassword/RestorePasswordCompletionModal";
import css from "./Navbar.module.css";

export function Navbar() {
  const { totalQuantity } = useCart();
  const { isAuth } = useAuth();
  const { setIsOpen } = useBurgerMenu();
  const router = useRouter();
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showSignUpCompletion, setShowSignUpCompletion] = useState(false);
  const [showSignUpResendActivation, setShowSignUpResendActivation] = useState(false);
  const [showRestorePasswordSendEmail, setShowRestorePasswordSendEmail] = useState(false);
  const [showRestorePasswordCompletion, setShowRestorePasswordCompletion] = useState(false);

  return (
    <>
      <nav className={css["navbar-wrapper"]}>
        <div className={css["navbar-content"]}>
          <div className={css["navbar-logo"]}>
            <a href="/">
              Shop
            </a>
          </div>
          <div className={`${css["search-wrapper"]}`}>
            <SearchBox />
          </div>
          <div
            className={`${css["navbar-utility-bar"]}`}
          >
            <div
              id="user-button"
              className={css["navbar-user-button"]}
              onClick={() =>
                isAuth
                  ? (() => {
                      setIsOpen(false);
                      router.push("/profile/user-info");
                    })()
                  : setShowAuth(true)
              }
            >
              <div className={css["user-icon-wrapper"]}>
                <img
                  src={`${process.env.NEXT_PUBLIC_URL}/svg/user.svg`}
                  alt="User icon"
                />
                {isAuth && (
                  <img
                    src={`${process.env.NEXT_PUBLIC_URL}/svg/check-circle.svg`}
                    alt="Authorized check icon"
                    className={css["authorized-check-icon"]}
                  />
                )}
              </div>
            </div>
            <div
              id="cart-button"
              className={css["navbar-cart-button"]}
              onClick={() => setShowCart(true)}
            >
              <div className={css["cart-icon-wrapper"]}>
                <img
                  src={`${process.env.NEXT_PUBLIC_URL}/svg/cart.svg`}
                  alt="Cart icon"
                />
                {totalQuantity > 0 && (
                  <span className={css["navbar-cart-badge"]}>{totalQuantity}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <AuthModal
        show={showAuth}
        handleClose={() => setShowAuth(false)}
        handleOpenSignUpCompletion={() => setShowSignUpCompletion(true)}
        handleOpenRestorePasswordSendEmail={() => setShowRestorePasswordSendEmail(true)}
      />
      <SignUpCompletionModal
        show={showSignUpCompletion}
        handleClose={() => setShowSignUpCompletion(false)}
        handleOpenAuth={() => setShowAuth(true)}
        handleOpenSignUpResendActivation={() => setShowSignUpResendActivation(true)}
      />
      <SignUpResendActivationModal
        show={showSignUpResendActivation}
        handleClose={() => setShowSignUpResendActivation(false)}
        handleOpenAuth={() => setShowAuth(true)}
      />
      <RestorePasswordSendEmailModal
        show={showRestorePasswordSendEmail}
        handleClose={() => setShowRestorePasswordSendEmail(false)}
        handleOpenRestorePasswordCompletion={() => setShowRestorePasswordCompletion(true)}
      />
      <RestorePasswordCompletionModal
        show={showRestorePasswordCompletion}
        handleClose={() => setShowRestorePasswordCompletion(false)}
        handleOpenAuth={() => setShowAuth(true)}
      />
      <CartModal show={showCart} handleClose={() => setShowCart(false)} />
    </>
  );
}
