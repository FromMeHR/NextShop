import { useState, useRef, useCallback, useEffect } from "react";

export const useDropdownPosition = ({ dependencies = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState("below");
  const selectBoxRef = useRef(null);
  const dropdownRef = useRef(null);

  const updatePosition = useCallback(({ scrollY = window.scrollY, scrollX = window.scrollX }) => {
    if (!selectBoxRef.current || !dropdownRef.current) return;

    const rect = selectBoxRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const shouldOpenAbove =
      spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;
    const dropdownPosition = shouldOpenAbove ? "above" : "below";
    setPosition(dropdownPosition);

    const top =
      dropdownPosition === "above" ? rect.top - dropdownHeight : rect.bottom;
    Object.assign(dropdownRef.current.style, {
      top: `${top + scrollY}px`,
      left: `${rect.left + scrollX}px`,
      width: `${rect.width}px`,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      updatePosition({ scrollY: 0, scrollX: 0 });
    }

    const handleClickOutside = (event) => {
      if (
        isOpen &&
        !selectBoxRef.current?.contains(event.target) &&
        !dropdownRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      updatePosition({});
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, updatePosition, ...dependencies]);

  return {
    isOpen,
    setIsOpen,
    position,
    selectBoxRef,
    dropdownRef,
  };
};
