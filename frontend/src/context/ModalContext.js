import { createContext, useState, useRef, useCallback } from "react";
import { ModalBackdrop } from "../components/ModalBackdrop/ModalBackdrop";

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const countRef = useRef(0);

  const showOverlay = useCallback(() => {
    countRef.current += 1;
    setIsOverlayVisible(true);
  }, []);

  const hideOverlay = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1);
    if (countRef.current === 0) setIsOverlayVisible(false);
  }, []);

  return (
    <ModalContext.Provider value={{ showOverlay, hideOverlay }}>
      {children}
      <ModalBackdrop
        isVisible={isOverlayVisible}
        handleHide={() => {
          setIsOverlayVisible(false);
          countRef.current = 0;
        }}
      />
    </ModalContext.Provider>
  );
};
