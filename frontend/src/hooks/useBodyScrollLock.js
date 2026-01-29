const activeLocks = new Set();

export function useBodyScrollLock() {
  const lock = (key) => {
    activeLocks.add(key);
    if (activeLocks.size === 1) {
      document.body.style.overflow = "hidden";
    }
  };

  const unlock = (key) => {
    activeLocks.delete(key);
    if (activeLocks.size === 0) {
      document.body.style.overflow = "auto";
    }
  };

  return { lock, unlock };
}
