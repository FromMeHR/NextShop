import css from './Footer.module.css';
import { FaInstagram, FaTwitter, FaFacebook } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer className={css['footer-main']}>
        <div className={`container text-center ${css['footer-content']}`}>
            <div className={css['footer-links']}>
                <a href="#!" className="text-white text-decoration-none mx-2">Home</a>
                <a href="#!" className="text-white text-decoration-none mx-2">Shop</a>
                <a href="#!" className="text-white text-decoration-none mx-2">About</a>
                <a href="#!" className="text-white text-decoration-none mx-2">Contact</a>
            </div>
            <div className={css['footer-social']}>
                <a href="#!" className="text-white mx-2"><FaFacebook/></a>
                <a href="#!" className="text-white mx-2"><FaTwitter/></a>
                <a href="#!" className="text-white mx-2"><FaInstagram/></a>
            </div>
            <div className={css['footer-credits']}>
                <p className="text-white small mb-0">Copyright &copy; 2025 Shop. All rights reserved.</p>
            </div>
        </div>
    </footer>
  )
}

export default Footer;
