import { useRef, useState, useEffect } from "react";
import { useController } from "react-hook-form";

const MASK_TEMPLATE = "yyyy-mm-dd";
const NUMBERS = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);

const getDaysInMonth = (year, month) => {
  const y = parseInt(year) || 2026;
  const m = parseInt(month) || 1;
  return new Date(y, m, 0).getDate();
};

export const DateInput = ({ control, name, rules, ...props }) => {
  const {
    field: { onChange, onBlur, value, ref },
  } = useController({
    name,
    control,
    rules,
  });

  const inputRef = useRef(null);
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (value && value.length === 10) {
      setDisplayValue(value);
    } else if (!value) {
      setDisplayValue("");
    }
  }, [value]);

  // перша поява літер y, m або d
  const getFirstEmptyIndex = (val) => {
    return val.search(/[ymd]/);
  };

  // чи валідний поточний день для обраного року/місяця
  const validateDayAfterChange = (valArray) => {
    const dayStr = valArray.slice(8, 10).join("");
    if (dayStr.includes("d")) return valArray;

    const yearStr = valArray.slice(0, 4).join("");
    const monthStr = valArray.slice(5, 7).join("");

    const year = yearStr.includes("y") ? 2026 : parseInt(yearStr);
    const month = monthStr.includes("m") ? 1 : parseInt(monthStr);
    const day = parseInt(dayStr);

    const maxDays = getDaysInMonth(year, month);
    if (day > maxDays) {
      // якщо день став невалідним, скидаємо його в dd
      valArray[8] = MASK_TEMPLATE[8];
      valArray[9] = MASK_TEMPLATE[9];
    }
    return valArray;
  };

  const handleFocus = (e) => {
    if (!displayValue) {
      setDisplayValue(MASK_TEMPLATE);
      setTimeout(() => inputRef.current?.setSelectionRange(0, 0), 0);
    } else {
      const firstEmpty = getFirstEmptyIndex(displayValue);
      if (firstEmpty !== -1) {
        setTimeout(() => inputRef.current?.setSelectionRange(firstEmpty, firstEmpty), 0);
      }
    }
  };

  const handleClick = (e) => {
    const el = inputRef.current;
    if (!el) return;

    // якщо маска повертаємо на початок
    if (displayValue === MASK_TEMPLATE || !displayValue) {
      el.setSelectionRange(0, 0);
      return;
    }

    const currentCursorPosition = el.selectionStart;
    const firstEmptyIndex = getFirstEmptyIndex(displayValue);

    // якщо маска повністю заповнена (index === -1), клікати можна де завгодно для редагування
    // якщо ні, перевіряємо: чи клікнув юзер далі, ніж треба
    if (firstEmptyIndex !== -1 && currentCursorPosition > firstEmptyIndex) {
      // повертаємо курсор на перше вільне місце
      el.setSelectionRange(firstEmptyIndex, firstEmptyIndex);
    }
  };

  const handleBlur = (e) => {
    onBlur();
    if (displayValue === MASK_TEMPLATE) {
      setDisplayValue("");
      onChange(null);
    }
  };

  const handleKeyDown = (e) => {
    const key = e.key;
    const el = inputRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd; // кінець виділення

    if (
      ["ArrowLeft", "ArrowRight", "Tab", "Enter"].includes(key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    e.preventDefault();

    let nextValue = displayValue.split("");
    let nextCursor = start;

    if (key === "Backspace") {
      if (end > start) {
        // замінюємо все від start до кінця рядка на символи з MASK_TEMPLATE
        for (let i = start; i < nextValue.length; i++) {
          nextValue[i] = MASK_TEMPLATE[i];
        }
        nextCursor = start;
      }
      // логіка видалення одного символу
      else if (start > 0) {
        const deleteIndex = start - 1;
        if (nextValue[deleteIndex] === "-") {
          nextCursor = deleteIndex;
          if (deleteIndex > 0) {
            nextValue[deleteIndex - 1] = MASK_TEMPLATE[deleteIndex - 1];
            nextCursor = deleteIndex - 1;
          }
        } else {
          nextValue[deleteIndex] = MASK_TEMPLATE[deleteIndex];
          nextCursor = deleteIndex;
        }
      }
    }
    // логіка введення цифр
    else if (NUMBERS.has(key)) {
      let currentIdx = start;
      // Якщо вводимо поверх виділення
      if (end > start) {
        for (let i = start; i < nextValue.length; i++) {
          nextValue[i] = MASK_TEMPLATE[i];
        }
        currentIdx = start;
      } else {
        const firstEmpty = getFirstEmptyIndex(displayValue);
        if (firstEmpty !== -1 && start > firstEmpty) {
          currentIdx = firstEmpty;
        }
      }

      if (nextValue[currentIdx] === "-") {
        currentIdx += 1;
      }

      // оновлюємо current index, бо могли перестрибнути дефіс
      if (currentIdx >= 10) return;

      // логіка для РОКУ
      if (currentIdx <= 3) {
        nextValue[currentIdx] = key;
        nextCursor = currentIdx + 1;
        nextValue = validateDayAfterChange(nextValue);
      }
      // логіка для МІСЯЦЯ
      else if (currentIdx === 5) {
        if (parseInt(key) > 1) {
          nextValue[5] = "0";
          nextValue[6] = key;
          nextCursor = 8;
        } else {
          nextValue[5] = key;
          nextCursor = 6;
        }
        nextValue = validateDayAfterChange(nextValue);
      } else if (currentIdx === 6) {
        const potentialMonth = parseInt(nextValue[5] + key);
        if (potentialMonth === 0) return;
        if (potentialMonth <= 12) {
          nextValue[6] = key;
          nextCursor = 8;
          nextValue = validateDayAfterChange(nextValue);
        }
      }
      // логіка для ДНЯ
      else if (currentIdx === 8) {
        const mStr = nextValue.slice(5, 7).join("");
        const yStr = nextValue.slice(0, 4).join("");
        const maxDays = getDaysInMonth(yStr.includes("y") ? 2026 : yStr, mStr.includes("m") ? 1 : mStr);

        const nextDayNumber = nextValue[9] !== MASK_TEMPLATE[9] ? nextValue[9] : "0";
        if (parseInt(key) > 3) {
          nextValue[8] = "0";
          nextValue[9] = key;
          nextCursor = 10;
        } else if (parseInt(key + nextDayNumber) <= maxDays) {
            nextValue[8] = key;
            nextCursor = 9;
        } else {
            nextValue[8] = key;
            nextValue[9] = MASK_TEMPLATE[9];
            nextCursor = 9;
        }
      } else if (currentIdx === 9) {
        const mStr = nextValue.slice(5, 7).join("");
        const yStr = nextValue.slice(0, 4).join("");
        const maxDays = getDaysInMonth(yStr.includes("y") ? 2026 : yStr, mStr.includes("m") ? 1 : mStr);
        const potentialDay = parseInt(nextValue[8] + key);

        if (potentialDay > 0 && potentialDay <= maxDays) {
          nextValue[9] = key;
          nextCursor = 10;
        }
      }
    }

    const newStr = nextValue.join("");
    setDisplayValue(newStr);
    onChange(newStr || null); // оновлюємо значення в react-hook-form

    setTimeout(() => inputRef.current?.setSelectionRange(nextCursor, nextCursor), 0);
  };

  return (
    <>
      <input
        {...props}
        ref={(e) => { ref(e); inputRef.current = e; }}
        value={displayValue}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onChange={() => {}}
        autoComplete="off"
        type="text"
        inputMode="numeric"
        placeholder={displayValue ? "" : MASK_TEMPLATE}
      />
    </>
  );
};
