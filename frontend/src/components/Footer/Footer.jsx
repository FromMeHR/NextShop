import ScrollToTopButton from './FooterComponents/ScrollToTopButton';
import css from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={css['footer-main']}>
        <div className={`container text-center ${css['footer-content']}`}>
            <div className={css['footer-links']}>
                <a href="/" className="text-white text-decoration-none mx-2">Shop</a>
                <a href="!#" className="text-white text-decoration-none mx-2">About</a>
                <a href="!#" className="text-white text-decoration-none mx-2">Contact</a>
            </div>
            <div className={css['footer-social']}>
                <a href="!#" className="text-white mx-2">
                    <img src={`${process.env.REACT_APP_PUBLIC_URL}/svg/facebook.svg`} alt="Facebook icon link" />
                </a>
                <a href="!#" className="text-white mx-2">
                    <img src={`${process.env.REACT_APP_PUBLIC_URL}/svg/twitter.svg`} alt="Twitter icon link" />
                </a>
                <a href="!#" className="text-white mx-2">
                    <img src={`${process.env.REACT_APP_PUBLIC_URL}/svg/instagram.svg`} alt="Instagram icon link" />
                </a>
            </div>
            <div className={css['footer-credits']}>
                <p className="text-white small mb-0">Copyright &copy; 2025 Shop. All rights reserved.</p>
            </div>
        </div>
        <ScrollToTopButton />
    </footer>
  )
}

export default Footer;
