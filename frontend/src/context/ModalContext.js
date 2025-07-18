import { createContext, useState } from "react";
import { ModalBackdrop } from "../components/ModalBackdrop/ModalBackdrop";

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [isOverlayVisible, setOverlayVisible] = useState(false);

  return (
    <ModalContext.Provider value={{ setOverlayVisible }}>
      {children}
      <ModalBackdrop
        isVisible={isOverlayVisible}
        handleHide={() => setOverlayVisible(false)}
      />
    </ModalContext.Provider>
  );
};
