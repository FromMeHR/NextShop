import { createContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

export const BurgerMenuContext = createContext();

export const BurgerMenuProvider = ({ children }) => {
  const { lock, unlock } = useBodyScrollLock();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (isOpen && window.innerWidth <= 768)   {
        lock("burger-menu");
      } else {
        unlock("burger-menu");
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, lock, unlock]);

  useEffect(() => {
    if (isOpen && window.innerWidth <= 768) {
      lock("burger-menu");
    } else {
      unlock("burger-menu");
    }
  }, [isOpen, lock, unlock]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <BurgerMenuContext.Provider value={{ isOpen, toggleMenu, setIsOpen }}>
      {children}
    </BurgerMenuContext.Provider>
  );
};
