import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import css from "./BackdropModal.module.css";

export function BackdropModal({ isVisible, handleHide }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isVisible) setIsMounted(true);
    else setIsActive(false);
  }, [isVisible]);

  useEffect(() => {
    if (isMounted && isVisible) {
      const raf = requestAnimationFrame(() => setIsActive(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [isMounted, isVisible]);

  useEffect(() => {
    const node = modalRef.current;
    if (!node) return;

    const handleTransitionEnd = (e) => {
      if (e.target !== node) return;
      if (!isVisible && !isActive) setIsMounted(false);
    };

    node.addEventListener("transitionend", handleTransitionEnd);
    return () => node.removeEventListener("transitionend", handleTransitionEnd);
  }, [isVisible, isActive]);

  return isMounted && ReactDOM.createPortal(
    <div
      ref={modalRef}
      className={`${css["overlay"]} ${isActive ? css["show"] : ""}`}
      onClick={() => {
        isVisible && handleHide();
      }}
    ></div>,
    document.body
  );
}
