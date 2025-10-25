import ReactDOM from "react-dom";
import css from "./BackdropModal.module.css";

export function BackdropModal({ isVisible, handleHide }) {
  return ReactDOM.createPortal(
    <div
      className={`${css["overlay"]} ${isVisible ? css["show"] : ""}`}
      onClick={() => {
        isVisible && handleHide();
      }}
    ></div>,
    document.body
  );
}
