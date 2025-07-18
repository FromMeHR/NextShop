import ReactDOM from "react-dom";
import css from "./ModalBackdrop.module.css";

export function ModalBackdrop({ isVisible, handleHide }) {
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
