import React from 'react'
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import css from './Footer.module.css';
import { FaInstagram, FaTwitter, FaFacebook } from 'react-icons/fa6';

const Footer = () => {
  const [isFixed, setIsFixed] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const checkFooterPosition = () => {
      const shouldBeFixed = window.innerHeight >= document.body.scrollHeight;
      setIsFixed(shouldBeFixed);
    };

    checkFooterPosition();
    window.addEventListener('resize', checkFooterPosition);
    
    return () => {
      window.removeEventListener('resize', checkFooterPosition);
    };
  }, [pathname]);
  
  return (
    <footer className={`py-3 ${css['footer-main']} ${isFixed ? `${css['fixed-bottom']}` : ''}`}>
        <div className={`container text-center ${css['footer-content']}`}>
            <div className="mb-2">
                <a href="#!" className="text-white text-decoration-none mx-2">Home</a>
                <a href="#!" className="text-white text-decoration-none mx-2">Shop</a>
                <a href="#!" className="text-white text-decoration-none mx-2">About</a>
                <a href="#!" className="text-white text-decoration-none mx-2">Contact</a>
            </div>

            <div className="mb-2">
                <a href="#!" className="text-white mx-2"><FaFacebook/></a>
                <a href="#!" className="text-white mx-2"><FaTwitter/></a>
                <a href="#!" className="text-white mx-2"><FaInstagram/></a>
            </div>

            <div className="mb-2">
                <p className="text-white small mb-0">Copyright &copy; 2025 Shop. All rights reserved.</p>
            </div>
        </div>
    </footer>
  )
}

export default Footer;
