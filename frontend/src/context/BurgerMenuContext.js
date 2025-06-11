import { createContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export const BurgerMenuContext = createContext();

export const BurgerMenuProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
        document.body.style.overflow = "auto";
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <BurgerMenuContext.Provider value={{ isOpen, toggleMenu, setIsOpen }}>
      {children}
    </BurgerMenuContext.Provider>
  );
};
