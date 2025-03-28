import { useState } from "react";
import Navlink from './Navlink';
import CartModal from "../../Cart/CartModal";
import { useCart } from '../../../context/CartContext';
import css from './Navbar.module.css';

function Navbar() {
  const { cart } = useCart();
  const [showCart, setShowCart] = useState(false);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <nav className={`navbar navbar-expand-lg navbar-dark fixed-top ${css['navbar-wrapper']}`}>
          <div className="container">
              <a href="/" className="navbar-brand fw-bold text-uppercase">Shop</a>
              <button
                  className="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarContent"
                  aria-controls="navbarContent"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
              > 
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarContent">
                  <Navlink/>
                  <div className={`btn btn-dark ms-2 rounded-pill position-relative ${css['navbar-cart-button']}`} onClick={() => setShowCart(true)}>
                    <img src={`${process.env.REACT_APP_PUBLIC_URL}/svg/cart.svg`} alt="Cart icon link" />
                    <span className={`position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger ${css['navbar-cart-badge']}`}>
                      {totalItems}
                    </span>
                  </div>
              </div>
          </div>
      </nav>
      <CartModal show={showCart} handleClose={() => setShowCart(false)} />
    </>
  );
}

export default Navbar;
