import { createContext, useState, useEffect, useCallback } from "react";
import { AuthModal } from "../components/Modals/Auth/AuthModal";
import { CartModal } from "../components/Modals/Cart/CartModal";
import { SignUpCompletionModal } from "../components/Modals/Auth/SignUp/SignUpCompletionModal";
import { SignUpResendActivationModal } from "../components/Modals/Auth/SignUp/SignUpResendActivationModal";
import { RestorePasswordSendEmailModal } from "../components/Modals/Auth/RestorePassword/RestorePasswordSendEmailModal";
import { RestorePasswordCompletionModal } from "../components/Modals/Auth/RestorePassword/RestorePasswordCompletionModal";
import { RestorePasswordResultModal } from "../components/Modals/Auth/RestorePassword/RestorePasswordResultModal";
import { BackdropModal } from "../components/Modals/Backdrop/BackdropModal";

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState({
    cart: false,
    auth: false,
    signUpResendActivation: false,
    signUpCompletion: false,
    restorePasswordSendEmail: false,
    restorePasswordCompletion: false,
    restorePasswordResult: false,
  });
  const [modalProps, setModalProps] = useState({});
  const isOverlayVisible = Object.values(modals).some(Boolean);

  const openModal = useCallback((key, props = {}) => {
    setModals((prev) => ({ ...prev, [key]: true }));
    setModalProps((prev) => ({ ...prev, [key]: props }));
  }, []);

  const closeModal = useCallback((key) => {
    setModals((prev) => ({ ...prev, [key]: false }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals((prev) =>
      Object.fromEntries(Object.keys(prev).map((k) => [k, false]))
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        const hasOpenModal = Object.values(modals).some(Boolean);
        if (hasOpenModal) closeAllModals();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modals, closeAllModals]);

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal }}>
      {children}
      <BackdropModal
        isVisible={isOverlayVisible}
        handleHide={closeAllModals}
      />
      <CartModal />
      <AuthModal />
      <SignUpResendActivationModal />
      <SignUpCompletionModal />
      <RestorePasswordSendEmailModal />
      <RestorePasswordCompletionModal />
      <RestorePasswordResultModal
        restorePasswordStatus={modalProps.restorePasswordResult?.restorePasswordStatus}
      />
    </ModalContext.Provider>
  );
};
