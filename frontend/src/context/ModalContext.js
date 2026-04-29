import { createContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthModal } from "../components/Modals/Auth/AuthModal";
import { CartModal } from "../components/Modals/Cart/CartModal";
import { SignUpCompletionModal } from "../components/Modals/Auth/SignUp/SignUpCompletionModal";
import { SignUpResendActivationModal } from "../components/Modals/Auth/SignUp/SignUpResendActivationModal";
import { RestorePasswordSendEmailModal } from "../components/Modals/Auth/RestorePassword/RestorePasswordSendEmailModal";
import { RestorePasswordCompletionModal } from "../components/Modals/Auth/RestorePassword/RestorePasswordCompletionModal";
import { RestorePasswordResultModal } from "../components/Modals/Auth/RestorePassword/RestorePasswordResultModal";
import { BackdropModal } from "../components/Modals/Backdrop/BackdropModal";
import { toast } from "react-toastify";

export const ModalContext = createContext();

const MODAL_REGISTRY = {
  cart: CartModal,
  auth: AuthModal,
  signUpResendActivation: SignUpResendActivationModal,
  signUpCompletion: SignUpCompletionModal,
  restorePasswordSendEmail: RestorePasswordSendEmailModal,
  restorePasswordCompletion: RestorePasswordCompletionModal,
  restorePasswordResult: RestorePasswordResultModal,
};

const AnimatedModalWrapper = ({ component: Component, isVisible, props }) => {
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
    const modal = modalRef.current;
    if (!modal) return;

    const handleTransitionEnd = (e) => {
      if (e.target !== modal) return;
      if (!isVisible && !isActive) {
        setIsMounted(false);
      }
    };

    modal.addEventListener("transitionend", handleTransitionEnd);
    return () => modal.removeEventListener("transitionend", handleTransitionEnd);
  }, [isVisible, isActive]);
  return isMounted && <Component isActive={isActive} modalRef={modalRef} {...props} />;
};

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
  const searchParams = useSearchParams();
  const router = useRouter();

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
        if (Object.values(modals).some(Boolean)) closeAllModals();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modals, closeAllModals]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("showAuthModal") === "1") {
      params.delete("showAuthModal");
      openModal("auth");
      router.replace(`/?${params.toString()}`);
      toast.info("Сесія закінчилась. Будь ласка, увійдіть ще раз.", {
        toastId: "auth-expired",
      });
    }
  }, [searchParams, router, openModal]);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <BackdropModal
        isVisible={isOverlayVisible}
        handleHide={closeAllModals}
      />
      {Object.entries(MODAL_REGISTRY).map(([key, Component]) => (
        <AnimatedModalWrapper
          key={key}
          component={Component}
          isVisible={modals[key]}
          props={modalProps[key] || {}}
        />
      ))}
    </ModalContext.Provider>
  );
};
