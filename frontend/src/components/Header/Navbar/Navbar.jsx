import { useState, useEffect } from "react";
import { CartModal } from "../../Cart/CartModal";
import { AuthModal } from "../../Auth/AuthModal";
import { useCart } from "../../../hooks/useCart";
import { Link, useNavigate } from "react-router-dom";
import { CompleteSignUpModal } from "../../Auth/SignUp/CompleteSignUpModal";
import { ResendActivationSignUpModal } from "../../Auth/SignUp/ResendActivationSignUpModal";
import css from "./Navbar.module.css";

export function Navbar(props) {
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showCompleteSignUp, setShowCompleteSignUp] = useState(false);
  const [showResendActivationSignUp, setShowResendActivationSignUp] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && menuOpen) {
        setMenuOpen(false);
        document.body.classList.remove(css.noScroll);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add(css.noScroll);
    } else {
      document.body.classList.remove(css.noScroll);
    }
  }, [menuOpen]);

  return (
    <>
      <nav className={css["navbar-wrapper"]}>
        <div className={css["navbar-content"]}>
          <div className={css["navbar-logo"]}>
            <Link to="/" reloadDocument>
              Shop
            </Link>
          </div>
          <div
            className={`${css["navbar-utility-bar"]} ${
              menuOpen ? css.open : ""
            }`}
          >
            <div
              id="user-button"
              className={css["navbar-user-button"]}
              onClick={() =>
                props.isAuthorized
                  ? (() => {
                      setMenuOpen(false);
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
              <span className={css["show-info-on-mobile"]}>
                {props.isAuthorized ? "Profile" : "Sign in/up"}
              </span>
            </div>
            <div
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
              <span className={css["show-info-on-mobile"]}>Cart</span>
            </div>
          </div>
          <div
            className={`${css["overlay"]} ${menuOpen ? css["open"] : ""}`}
            onClick={toggleMenu}
          ></div>
          <div
            className={`${css["burger-menu"]} ${menuOpen ? css["active"] : ""}`}
            onClick={toggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>
      <AuthModal
        show={showAuth}
        handleClose={() => setShowAuth(false)}
        successAuth={() => setMenuOpen(false)}
        handleOpenCompleteSignUp={() => setShowCompleteSignUp(true)}
      />
      <CompleteSignUpModal
        show={showCompleteSignUp}
        handleClose={() => setShowCompleteSignUp(false)}
        handleOpenAuth={() => setShowAuth(true)}
        handleOpenResendActivationSignUp={() => {
          setShowResendActivationSignUp(true);
        }}
      />
      <ResendActivationSignUpModal
        show={showResendActivationSignUp}
        handleClose={() => setShowResendActivationSignUp(false)}
        handleOpenAuth={() => setShowAuth(true)}
      />
      <CartModal show={showCart} handleClose={() => setShowCart(false)} />
    </>
  );
}
