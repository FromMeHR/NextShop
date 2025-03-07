import { Link } from 'react-router-dom';
import { FaCartShopping } from 'react-icons/fa6';
import css from './Navbar.module.css';
import Navlink from './Navlink';

function Navbar() {
  return (
    <nav className={`navbar navbar-expand-lg navbar-dark fixed-top ${css['navbar-wrapper']}`}>
        <div className="container">
            <Link className="navbar-brand fw-bold text-uppercase" to="/">Shop</Link>
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
                <Link to="/cart" className={`btn btn-dark ms-2 rounded-pill position-relative ${css['navbar-cart-button']}`}>
                  <FaCartShopping />
                  <span className={`position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger ${css['navbar-cart-badge']}`}>12</span>
                </Link>
            </div>
        </div>
    </nav>
  );
}

export default Navbar;
