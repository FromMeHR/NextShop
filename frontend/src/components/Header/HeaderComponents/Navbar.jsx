import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchBox } from "./SearchBox";
import { useCart } from "../../../hooks/useCart";
import { useBurgerMenu } from "../../../hooks/useBurgerMenu";
import { CartModal } from "../../Cart/CartModal";
import { AuthModal } from "../../Auth/AuthModal";
import { SignUpCompletionModal } from "../../Auth/SignUp/SignUpCompletionModal";
import { SignUpResendActivationModal } from "../../Auth/SignUp/SignUpResendActivationModal";
import { RestorePasswordSendEmailModal } from "../../Auth/RestorePassword/RestorePasswordSendEmailModal";
import { RestorePasswordCompletionModal } from "../../Auth/RestorePassword/RestorePasswordCompletionModal";
import css from "./Navbar.module.css";

export function Navbar(props) {
  const { cart } = useCart();
  const { setIsOpen } = useBurgerMenu();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();
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
            <Link to="/" reloadDocument>
              Shop
            </Link>
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
                props.isAuthorized
                  ? (() => {
                      setIsOpen(false);
                      navigate("/profile/user-info");
                    })()
                  : setShowAuth(true)
              }
            >
              <div className={css["user-icon-wrapper"]}>
                <img
                  src={`${process.env.REACT_APP_PUBLIC_URL}/svg/user.svg`}
                  alt="User icon"
                />
                {props.isAuthorized && (
                  <img
                    src={`${process.env.REACT_APP_PUBLIC_URL}/svg/check-circle.svg`}
                    alt="Authorized check icon"
                    className={css["authorized-check-icon"]}
                  />
                )}
              </div>
            </div>
            <div
              id="cart-button"
              className={css["navbar-cart-button"]}
              onClick={() => cart.length > 0 && setShowCart(true)}
            >
              <div className={css["cart-icon-wrapper"]}>
                <img
                  src={`${process.env.REACT_APP_PUBLIC_URL}/svg/cart.svg`}
                  alt="Cart icon"
                />
                {totalItems > 0 && (
                  <span className={css["navbar-cart-badge"]}>{totalItems}</span>
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
