import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { debounce, memoize, reduce, startsWith } from "lodash";
import classNames from "classnames";
import css from "./IntlPhoneInput.module.css";

import CountryData from "./IntlPhoneComponents/CountryData.js";

class PhoneInput extends React.Component {
  static propTypes = {
    country: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value: PropTypes.string,
    localStorageNumberData: PropTypes.object,

    onlyCountries: PropTypes.arrayOf(PropTypes.string),
    preferredCountries: PropTypes.arrayOf(PropTypes.string),
    excludeCountries: PropTypes.arrayOf(PropTypes.string),

    placeholder: PropTypes.string,
    searchPlaceholder: PropTypes.string,
    searchNotFound: PropTypes.string,
    disabled: PropTypes.bool,

    inputError: PropTypes.string,

    autoFormat: PropTypes.bool,

    enableAreaCodes: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    enableTerritories: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.arrayOf(PropTypes.string),
    ]),

    disableCountryCode: PropTypes.bool,
    disableDropdown: PropTypes.bool,
    enableLongNumbers: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    countryCodeEditable: PropTypes.bool,
    enableSearch: PropTypes.bool,
    disableInitialCountryGuess: PropTypes.bool,
    disableCountryGuess: PropTypes.bool,

    regions: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),

    inputProps: PropTypes.object,
    localization: PropTypes.object,
    masks: PropTypes.object,
    areaCodes: PropTypes.object,

    preserveOrder: PropTypes.arrayOf(PropTypes.string),

    defaultMask: PropTypes.string,
    alwaysDefaultMask: PropTypes.bool,
    prefix: PropTypes.string,
    copyNumbersOnly: PropTypes.bool,
    autocompleteSearch: PropTypes.bool,
    jumpCursorToEnd: PropTypes.bool,
    priority: PropTypes.object,
    enableAreaCodeStretch: PropTypes.bool,
    showDropdown: PropTypes.bool,

    onChange: PropTypes.func,
    onChangeValidity: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onClick: PropTypes.func,
    onKeyDown: PropTypes.func,
    onEnterKeyPress: PropTypes.func,
    onMount: PropTypes.func,
  };

  static defaultProps = {
    country: "ua",
    value: "",
    localStorageNumberData: {},

    onlyCountries: [],
    preferredCountries: [],
    excludeCountries: [],

    placeholder: "__ ___ __ __",
    searchPlaceholder: "Пошук",
    searchNotFound: "Не знайдено",
    disabled: false,

    inputError: false,

    autoFormat: true,
    enableAreaCodes: false,
    enableTerritories: false,
    disableCountryCode: false,
    disableDropdown: false,
    enableLongNumbers: false,
    countryCodeEditable: true,
    enableSearch: false,
    disableInitialCountryGuess: false,
    disableCountryGuess: true,

    regions: "",

    inputProps: {},
    localization: {},

    masks: null,
    priority: null,
    areaCodes: null,

    preserveOrder: [],

    defaultMask: "... ... ... ...", // prefix+dialCode+' '+defaultMask
    alwaysDefaultMask: false,
    prefix: "+",
    copyNumbersOnly: true,
    autocompleteSearch: false,
    jumpCursorToEnd: true,
    enableAreaCodeStretch: false,
    showDropdown: false,

    onEnterKeyPress: null, // null or function

    keys: {
      UP: 38,
      DOWN: 40,
      RIGHT: 39,
      LEFT: 37,
      ENTER: 13,
      ESC: 27,
      PLUS: 43,
      A: 65,
      Z: 90,
      SPACE: 32,
      TAB: 9,
    },
  };

  constructor(props) {
    super(props);
    const { onlyCountries, preferredCountries, hiddenAreaCodes } =
      new CountryData(
        props.enableAreaCodes,
        props.enableTerritories,
        props.regions,
        props.onlyCountries,
        props.preferredCountries,
        props.excludeCountries,
        props.preserveOrder,
        props.masks,
        props.priority,
        props.areaCodes,
        props.localization,
        props.prefix,
        props.defaultMask,
        props.alwaysDefaultMask
      );

    const localStorageNumberData = props.localStorageNumberData || {};
    let countryGuess;
    let formattedNumber = "";

    if (localStorageNumberData && localStorageNumberData.countryData) {
      countryGuess = onlyCountries.find(
        (o) =>
          o.iso2 === localStorageNumberData.countryData.countryCode &&
          o.dialCode === localStorageNumberData.countryData.dialCode
      );
      formattedNumber = localStorageNumberData.formattedNumber;
    }
    if (!localStorageNumberData || !countryGuess) {
      const inputNumber = props.value ? props.value.replace(/\D/g, "") : "";

      if (props.disableInitialCountryGuess) {
        countryGuess = 0;
      } else if (inputNumber.length > 1) {
        // Country detect by phone
        countryGuess =
          this.guessSelectedCountry(
            inputNumber.substring(0, 6),
            props.country,
            onlyCountries,
            hiddenAreaCodes
          ) || 0;
      } else if (props.country) {
        // Default country
        countryGuess = onlyCountries.find((o) => o.iso2 === props.country) || 0;
      } else {
        // Empty params
        countryGuess = 0;
      }

      const dialCode =
        inputNumber.length < 2 &&
        countryGuess &&
        !startsWith(inputNumber, countryGuess.dialCode)
          ? countryGuess.dialCode
          : "";

      formattedNumber =
        inputNumber === "" && countryGuess === 0
          ? ""
          : this.formatNumber(
              (props.disableCountryCode ? "" : dialCode) + inputNumber,
              countryGuess.name ? countryGuess : undefined
            );
    }

    const highlightCountryIndex = onlyCountries.findIndex(
      (o) => o === countryGuess
    );

    this.state = {
      showDropdown: props.showDropdown,

      formattedNumber,
      onlyCountries,
      preferredCountries,
      hiddenAreaCodes,
      selectedCountry: countryGuess,
      highlightCountryIndex,

      queryString: "",
      inputNumberField: (() => {
        const dialCode = countryGuess.dialCode;
        const isTwoSegmentDialCode = dialCode.split(" ").length === 2;
        if (isTwoSegmentDialCode) {
          const parts = formattedNumber.split(" ");
          if (parts.length >= 2) {
            return parts.slice(2).join(" ");
          }
        }
        return formattedNumber.replace(/^\+\d+\s?/, "");
      })(),
      inputFocused: false,
      freezeSelection: false,
      debouncedQueryStingSearcher: debounce(this.searchCountry, 250),
      searchValue: "",
    };
  }

  updateDropdownPosition = ({ scrollY = window.scrollY, scrollX = window.scrollX }) => {
    if (!this.internationalPhoneRef || !this.dropdownRef) return;

    const rect = this.internationalPhoneRef.getBoundingClientRect();
    const dropdownHeight = this.dropdownRef.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const shouldOpenBelow =
      spaceAbove < dropdownHeight && spaceBelow > dropdownHeight;

    const dropdownPosition = shouldOpenBelow ? "below" : "above";

    const top =
      dropdownPosition === "below"
        ? rect.bottom
        : rect.top - dropdownHeight - 7;

    Object.assign(this.dropdownRef.style, {
      top: `${top + scrollY}px`,
      left: `${rect.left + scrollX}px`,
      width: `${rect.width}px`,
    });
  };

  componentDidMount() {
    if (this.props.onChangeValidity) {
      this.props.onChangeValidity(this.validateNumber(this.state.formattedNumber));
    }
    if (document.addEventListener) {
      document.addEventListener("mousedown", this.handleClickOutside);
      if (this.state.showDropdown) {
        this.updateDropdownPosition({});
        window.addEventListener("resize", this.updateDropdownPosition);
        window.addEventListener("scroll", this.updateDropdownPosition);
      }
    }
    if (this.props.onMount) {
      this.props.onMount(
        this.state.formattedNumber.replace(/[^0-9]+/g, ""),
        this.getCountryData(),
        this.state.formattedNumber
      );
    }
  }

  componentWillUnmount() {
    if (document.removeEventListener) {
      window.removeEventListener("resize", this.updateDropdownPosition);
      window.removeEventListener("scroll", this.updateDropdownPosition);
      document.removeEventListener("mousedown", this.handleClickOutside);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.country !== this.props.country) {
      this.updateCountry(this.props.country);
    } else if (prevProps.value !== this.props.value) {
      this.updateFormattedNumber(this.props.value);
    }

    if (this.state.showDropdown && !prevState.showDropdown) {
      this.updateDropdownPosition({});
      window.addEventListener("resize", this.updateDropdownPosition);
      window.addEventListener("scroll", this.updateDropdownPosition);
    } else if (!this.state.showDropdown && prevState.showDropdown) {
      this.updateDropdownPosition({ scrollY: 0, scrollX: 0 });
      window.removeEventListener("resize", this.updateDropdownPosition);
      window.removeEventListener("scroll", this.updateDropdownPosition);
    }

    if (this.state.searchValue !== prevState.searchValue) {
      this.updateDropdownPosition({});
    }
  }

  getProbableCandidate = memoize((queryString) => {
    if (!queryString || queryString.length === 0) {
      return null;
    }
    // don't include the preferred countries in search
    const probableCountries = this.state.onlyCountries.filter((country) => {
      return startsWith(country.name.toLowerCase(), queryString.toLowerCase());
    }, this);
    return probableCountries[0];
  });

  guessSelectedCountry = memoize(
    (inputNumber, country, onlyCountries, hiddenAreaCodes) => {
      // if enableAreaCodes == false, try to search in hidden area codes to detect area code correctly
      // then search and insert main country which has this area code
      if (this.props.enableAreaCodes === false) {
        let mainCode;
        hiddenAreaCodes.some((country) => {
          if (startsWith(inputNumber, country.dialCode)) {
            onlyCountries.some((o) => {
              if (country.iso2 === o.iso2 && o.mainCode) {
                mainCode = o;
                return true;
              }
              return false;
            });
            return true;
          }
          return false;
        });
        if (mainCode) return mainCode;
      }

      const secondBestGuess = onlyCountries.find((o) => o.iso2 === country);
      if (inputNumber.trim() === "") return secondBestGuess;

      const bestGuess = onlyCountries.reduce(
        (selectedCountry, country) => {
          if (startsWith(inputNumber, country.dialCode)) {
            if (country.dialCode.length > selectedCountry.dialCode.length) {
              return country;
            }
            if (
              country.dialCode.length === selectedCountry.dialCode.length &&
              country.priority < selectedCountry.priority
            ) {
              return country;
            }
          }
          return selectedCountry;
        },
        { dialCode: "", priority: 10001 },
        this
      );

      if (!bestGuess.name) return secondBestGuess;
      return bestGuess;
    }
  );

  // Hooks for updated props
  updateCountry = (country) => {
    const { onlyCountries } = this.state;
    let newSelectedCountry;
    if (country.indexOf(0) >= "0" && country.indexOf(0) <= "9") {
      // digit
      newSelectedCountry = onlyCountries.find((o) => o.dialCode === +country);
    } else {
      newSelectedCountry = onlyCountries.find((o) => o.iso2 === country);
    }
    if (newSelectedCountry && newSelectedCountry.dialCode) {
      this.setState({
        selectedCountry: newSelectedCountry,
        formattedNumber: this.props.disableCountryCode
          ? ""
          : this.formatNumber(newSelectedCountry.dialCode, newSelectedCountry),
      });
    }
  };

  updateFormattedNumber(value) {
    if (value === null)
      return this.setState({ selectedCountry: 0, formattedNumber: "" });

    const { onlyCountries, selectedCountry, hiddenAreaCodes } = this.state;
    const { country, prefix } = this.props;

    if (value === "")
      return this.setState({ selectedCountry, formattedNumber: "" });

    let inputNumber = value.replace(/\D/g, "");
    let newSelectedCountry, formattedNumber;

    // if new value start with selectedCountry.dialCode, format number, otherwise find newSelectedCountry
    if (
      selectedCountry &&
      startsWith(value, prefix + selectedCountry.dialCode)
    ) {
      formattedNumber = this.formatNumber(inputNumber, selectedCountry);
      this.setState({ formattedNumber });
    } else {
      if (this.props.disableCountryGuess) {
        newSelectedCountry = selectedCountry;
      } else {
        newSelectedCountry =
          this.guessSelectedCountry(
            inputNumber.substring(0, 6),
            country,
            onlyCountries,
            hiddenAreaCodes
          ) || selectedCountry;
      }
      const dialCode =
        newSelectedCountry &&
        startsWith(inputNumber, prefix + newSelectedCountry.dialCode)
          ? newSelectedCountry.dialCode
          : "";

      formattedNumber = this.formatNumber(
        (this.props.disableCountryCode ? "" : dialCode) + inputNumber,
        newSelectedCountry ? newSelectedCountry : undefined
      );
      this.setState({ selectedCountry: newSelectedCountry, formattedNumber });
    }
  }

  // View methods
  scrollTo = (country, middle) => {
    if (!country) return;
    const container = this.dropdownRef;
    if (!container || !document.body) return;

    const containerHeight = container.offsetHeight;
    const containerOffset = container.getBoundingClientRect();
    const containerTop = containerOffset.top + document.body.scrollTop;
    const containerBottom = containerTop + containerHeight;

    const element = country;
    const elementOffset = element.getBoundingClientRect();

    const elementHeight = element.offsetHeight;
    const elementTop = elementOffset.top + document.body.scrollTop;
    const elementBottom = elementTop + elementHeight;

    let newScrollTop = elementTop - containerTop + container.scrollTop;
    const middleOffset = containerHeight / 2 - elementHeight / 2;

    if (
      this.props.enableSearch
        ? elementTop < containerTop + 32
        : elementTop < containerTop
    ) {
      // scroll up
      if (middle) {
        newScrollTop -= middleOffset;
      }
      container.scrollTop = newScrollTop;
    } else if (elementBottom > containerBottom) {
      // scroll down
      if (middle) {
        newScrollTop += middleOffset;
      }
      const heightDifference = containerHeight - elementHeight;
      container.scrollTop = newScrollTop - heightDifference;
    }
  };

  scrollToTop = () => {
    const container = this.dropdownRef;
    if (!container || !document.body) return;
    container.scrollTop = 0;
  };

  formatNumber = (text, country) => {
    if (!country) return text;

    const { format } = country;
    const {
      disableCountryCode,
      enableAreaCodeStretch,
      enableLongNumbers,
      autoFormat,
    } = this.props;

    let pattern;
    if (disableCountryCode) {
      pattern = format.split(" ");
      pattern.shift();
      pattern = pattern.join(" ");
    } else {
      if (enableAreaCodeStretch && country.isAreaCode) {
        pattern = format.split(" ");
        pattern[1] = pattern[1].replace(
          /\.+/,
          "".padEnd("", country.areaCodeLength, ".")
        );
        pattern = pattern.join(" ");
      } else {
        pattern = format;
      }
    }

    if (!text || text.length === 0) {
      return disableCountryCode ? "" : this.props.prefix;
    }

    // for all strings with length less than 3, just return it (1, 2 etc.)
    // also return the same text if the selected country has no fixed format
    if ((text && text.length < 2) || !pattern || !autoFormat) {
      return disableCountryCode ? text : this.props.prefix + text;
    }

    const formattedObject = reduce(
      pattern,
      (acc, character) => {
        if (acc.remainingText.length === 0) {
          return acc;
        }

        if (character !== ".") {
          return {
            formattedText: acc.formattedText + character,
            remainingText: acc.remainingText,
          };
        }

        const [head, ...tail] = acc.remainingText;

        return {
          formattedText: acc.formattedText + head,
          remainingText: tail,
        };
      },
      {
        formattedText: "",
        remainingText: text.split(""),
      }
    );

    let formattedNumber;
    if (enableLongNumbers) {
      formattedNumber =
        formattedObject.formattedText + formattedObject.remainingText.join("");
    } else {
      formattedNumber = formattedObject.formattedText;
    }

    // Always close brackets
    if (formattedNumber.includes("(") && !formattedNumber.includes(")"))
      formattedNumber += ")";
    return formattedNumber;
  };

  // Put the cursor to the end of the input (usually after a focus event)
  cursorToEnd = () => {
    const input = this.numberInputRef;
    if (document.activeElement !== input) return;
    input.focus();
    let len = input.value.length;
    if (input.value.charAt(len - 1) === ")") len = len - 1;
    input.setSelectionRange(len, len);
  };

  getElement = (index) => {
    return this[`flag_no_${index}`];
  };

  // return country data from state
  getCountryData = () => {
    if (!this.state.selectedCountry) return {};
    return {
      name: this.state.selectedCountry.name || "",
      dialCode: this.state.selectedCountry.dialCode || "",
      countryCode: this.state.selectedCountry.iso2 || "",
      format: this.state.selectedCountry.format || "",
    };
  };

  handleCountryDropdownClick = (e) => {
    e.preventDefault();
    if (!this.state.showDropdown && this.props.disabled) return;

    this.setState(
      (prevState) => ({
        showDropdown: !prevState.showDropdown,
        highlightCountryIndex: 0,
      }),
      () => {
        if (this.state.showDropdown) {
          this.scrollTo(this.getElement(0), true);
        }
      }
    );
  };

  handleInput = (e) => {
    this.setState({ inputFocused: true });
    const value =
      this.props.prefix +
      this.state.selectedCountry.dialCode +
      ` ${e.target.value || ""}`;
    const { prefix, onChange, onChangeValidity } = this.props;

    let formattedNumber = this.props.disableCountryCode ? "" : prefix;
    let newSelectedCountry = this.state.selectedCountry;
    let freezeSelection = this.state.freezeSelection;

    if (!this.props.countryCodeEditable) {
      const mainCode = newSelectedCountry.hasAreaCodes
        ? this.state.onlyCountries.find(
            (o) => o.iso2 === newSelectedCountry.iso2 && o.mainCode
          ).dialCode
        : newSelectedCountry.dialCode;

      const updatedInput = prefix + mainCode;
      if (value.slice(0, updatedInput.length) !== updatedInput) return;
    }

    if (value === prefix) {
      // we should handle change when we delete the last digit
      if (onChange) onChange(this.getCountryData(), e, "", false);
      if (onChangeValidity) onChangeValidity(false);
      return this.setState({ formattedNumber: "" });
    }

    // Does exceed default 15 digit phone number limit
    if (value.replace(/\D/g, "").length > 15) {
      if (this.props.enableLongNumbers === false) return;
      if (typeof this.props.enableLongNumbers === "number") {
        if (value.replace(/\D/g, "").length > this.props.enableLongNumbers)
          return;
      }
    }

    // if the input is the same as before, must be some special key like enter etc.
    if (value === this.state.formattedNumber) return;

    // ie hack
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }

    const { country } = this.props;
    const { onlyCountries, selectedCountry, hiddenAreaCodes } = this.state;

    if (onChange) e.persist();

    if (value.length > 0) {
      // before entering the number in new format, lets check if the dial code now matches some other country
      const inputNumber = value.replace(/\D/g, "");

      // we don't need to send the whole number to guess the country... only the first 6 characters are enough
      // the guess country function can then use memoization much more effectively since the set of input it
      // gets has drastically reduced
      if (
        !this.state.freezeSelection ||
        (!!selectedCountry &&
          selectedCountry.dialCode.replace(/\s/g, "").length >
            inputNumber.length)
      ) {
        if (this.props.disableCountryGuess) {
          newSelectedCountry = selectedCountry;
        } else {
          newSelectedCountry =
            this.guessSelectedCountry(
              inputNumber.substring(0, 6),
              country,
              onlyCountries,
              hiddenAreaCodes
            ) || selectedCountry;
        }
        freezeSelection = false;
      }
      formattedNumber = this.formatNumber(inputNumber, newSelectedCountry);
      newSelectedCountry = newSelectedCountry.dialCode
        ? newSelectedCountry
        : selectedCountry;
    }

    const oldCaretPosition = e.target.selectionStart;
    let caretPosition = e.target.selectionStart;
    const oldFormattedText = this.state.inputNumberField;
    const diff = this.state.inputNumberField.length - oldFormattedText.length;

    this.setState(
      {
        formattedNumber,
        inputNumberField: (() => {
          const dialCode = this.state.selectedCountry.dialCode;
          const isTwoSegmentDialCode = dialCode.split(" ").length === 2;
          if (isTwoSegmentDialCode) {
            const parts = formattedNumber.split(" ");
            if (parts.length >= 2) {
              return parts.slice(2).join(" ");
            }
          }
          return formattedNumber.replace(/^\+\d+\s?/, "");
        })(),
        freezeSelection,
        selectedCountry: newSelectedCountry,
      },
      () => {
        if (diff > 0) {
          caretPosition = caretPosition - diff;
        }

        const lastChar = formattedNumber.charAt(formattedNumber.length - 1);

        if (lastChar === ")") {
          this.numberInputRef.setSelectionRange(
            formattedNumber.length - 1,
            formattedNumber.length - 1
          );
        } else if (
          caretPosition > 0 &&
          oldFormattedText.length >= formattedNumber.length
        ) {
          this.numberInputRef.setSelectionRange(caretPosition, caretPosition);
        } else if (oldCaretPosition < oldFormattedText.length) {
          this.numberInputRef.setSelectionRange(
            oldCaretPosition,
            oldCaretPosition
          );
        }
        const isValid = this.validateNumber(formattedNumber);
        if (onChangeValidity) onChangeValidity(isValid);
        if (onChange)
          onChange(this.getCountryData(), e, formattedNumber, isValid);
      }
    );
  };

  validateNumber = (formattedNumber) => {
    const { selectedCountry } = this.state;
    if (!selectedCountry) return false;
    const regex = new RegExp(selectedCountry.format.replace(/^\+\./g, "\\d"));
    return regex.test(formattedNumber);
  };

  handleInputClick = (e) => {
    this.setState({ showDropdown: false, inputFocused: true });
    if (this.props.onClick) this.props.onClick(e, this.getCountryData());
  };

  handleDoubleClick = (e) => {
    const len = e.target.value.length;
    e.target.setSelectionRange(0, len);
  };

  handleFlagItemClick = (country, e) => {
    const currentSelectedCountry = this.state.selectedCountry;
    const newSelectedCountry = this.state.onlyCountries.find(
      (o) => o === country
    );
    if (!newSelectedCountry) return;

    const unformattedNumber = this.state.formattedNumber
      .replace(" ", "")
      .replace("(", "")
      .replace(")", "")
      .replace("-", "");
    const newNumber =
      unformattedNumber.length > 1
        ? unformattedNumber.replace(
            currentSelectedCountry.dialCode.replace(/\D/g, ""),
            newSelectedCountry.dialCode
          )
        : newSelectedCountry.dialCode;
    const formattedNumber = this.formatNumber(
      newNumber.replace(/\D/g, ""),
      newSelectedCountry
    );

    this.setState(
      {
        showDropdown: false,
        selectedCountry: newSelectedCountry,
        freezeSelection: true,
        formattedNumber,
        inputNumberField: (() => {
          const dialCode = newSelectedCountry.dialCode;
          const isTwoSegmentDialCode = dialCode.split(" ").length === 2;
          if (isTwoSegmentDialCode) {
            const parts = formattedNumber.split(" ");
            if (parts.length >= 2) {
              return parts.slice(2).join(" ");
            }
          }
          return formattedNumber.replace(/^\+\d+\s?/, "");
        })(),
        searchValue: "",
      },
      () => {
        this.cursorToEnd();
        const isValid = this.validateNumber(formattedNumber);
        if (this.props.onChangeValidity) this.props.onChangeValidity(isValid);
        if (this.props.onChange)
          this.props.onChange(
            this.getCountryData(),
            e,
            formattedNumber,
            isValid
          );
      }
    );
  };

  handleInputFocus = (e) => {
    // if the input is blank, insert dial code of the selected country
    if (this.numberInputRef) {
      if (this.props.onChangeValidity)
        this.props.onChangeValidity(
          this.validateNumber(this.state.formattedNumber)
        );
      if (
        this.numberInputRef.value === this.props.prefix &&
        this.state.selectedCountry &&
        !this.props.disableCountryCode
      ) {
        const formattedNumber =
          this.props.prefix + this.state.selectedCountry.dialCode;
        this.setState(
          {
            formattedNumber,
            inputNumberField: (() => {
              const dialCode = this.state.selectedCountry.dialCode;
              const isTwoSegmentDialCode = dialCode.split(" ").length === 2;
              if (isTwoSegmentDialCode) {
                const parts = formattedNumber.split(" ");
                if (parts.length >= 2) {
                  return parts.slice(2).join(" ");
                }
              }
              return formattedNumber.replace(/^\+\d+\s?/, "");
            })(),
          },
          () => {
            this.props.jumpCursorToEnd && setTimeout(this.cursorToEnd, 0);
          }
        );
      }
    }

    this.setState({ placeholder: "" });

    this.props.onFocus && this.props.onFocus(e, this.getCountryData());
    this.props.jumpCursorToEnd && setTimeout(this.cursorToEnd, 0);
  };

  handleInputBlur = (e) => {
    if (!e.target.value) this.setState({ placeholder: this.props.placeholder });
    this.props.onBlur && this.props.onBlur(e, this.getCountryData());
  };

  handleInputCopy = (e) => {
    if (!this.props.copyNumbersOnly) return;
    const text = window
      .getSelection()
      .toString()
      .replace(/[^0-9]+/g, "");
    e.clipboardData.setData("text/plain", text);
    e.preventDefault();
  };

  getHighlightCountryIndex = (direction) => {
    // had to write own function because underscore does not have findIndex. lodash has it
    const highlightCountryIndex = this.state.highlightCountryIndex + direction;

    if (
      highlightCountryIndex < 0 ||
      highlightCountryIndex >=
        this.state.onlyCountries.length + this.state.preferredCountries.length
    ) {
      return highlightCountryIndex - direction;
    }

    if (
      this.props.enableSearch &&
      highlightCountryIndex > this.getSearchFilteredCountries().length
    )
      return 0; // select first country
    return highlightCountryIndex;
  };

  searchCountry = () => {
    const probableCandidate =
      this.getProbableCandidate(this.state.queryString) ||
      this.state.onlyCountries[0];
    const probableCandidateIndex =
      this.state.onlyCountries.findIndex((o) => o === probableCandidate) +
      this.state.preferredCountries.length;

    this.scrollTo(this.getElement(probableCandidateIndex), true);

    this.setState({
      queryString: "",
      highlightCountryIndex: probableCandidateIndex,
    });
  };

  handleKeydown = (e) => {
    const { keys } = this.props;
    const {
      target: { className },
    } = e;

    if (
      className.includes(css["selected-country"]) &&
      e.which === keys.ENTER &&
      !this.state.showDropdown
    )
      return this.handleCountryDropdownClick(e);
    if (
      className.includes(css["form-control"]) &&
      (e.which === keys.ENTER || e.which === keys.ESC)
    )
      return e.target.blur();

    if (!this.state.showDropdown || this.props.disabled) return;
    if (className.includes(css["search-input"])) {
      if (
        e.which !== keys.UP &&
        e.which !== keys.DOWN &&
        e.which !== keys.ENTER
      ) {
        if (e.which === keys.ESC && e.target.value === "") {
          // do nothing // if search field is empty, pass event (close dropdown)
        } else {
          return; // don't process other events coming from the search field
        }
      }
    }

    // ie hack
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }

    const moveHighlight = (direction) => {
      this.setState(
        {
          highlightCountryIndex: this.getHighlightCountryIndex(direction),
        },
        () => {
          this.scrollTo(
            this.getElement(this.state.highlightCountryIndex),
            true
          );
        }
      );
    };

    switch (e.which) {
      case keys.DOWN:
        moveHighlight(1);
        break;
      case keys.UP:
        moveHighlight(-1);
        break;
      case keys.ENTER:
        if (this.props.enableSearch) {
          this.handleFlagItemClick(
            this.getSearchFilteredCountries()[
              this.state.highlightCountryIndex
            ] || this.getSearchFilteredCountries()[0],
            e
          );
        } else {
          this.handleFlagItemClick(
            [...this.state.preferredCountries, ...this.state.onlyCountries][
              this.state.highlightCountryIndex
            ],
            e
          );
        }
        break;
      case keys.ESC:
      case keys.TAB:
        this.setState(
          {
            showDropdown: false,
          },
          this.cursorToEnd
        );
        break;
      default:
        if (
          (e.which >= keys.A && e.which <= keys.Z) ||
          e.which === keys.SPACE
        ) {
          this.setState(
            {
              queryString:
                this.state.queryString + String.fromCharCode(e.which),
            },
            this.state.debouncedQueryStingSearcher
          );
        }
    }
  };

  handleInputKeyDown = (e) => {
    const { keys, onEnterKeyPress, onKeyDown } = this.props;
    if (e.which === keys.ENTER) {
      if (onEnterKeyPress) onEnterKeyPress(e);
    }
    if (onKeyDown) onKeyDown(e);
  };

  handleClickOutside = (e) => {
    if (!this.internationalPhoneRef.contains(e.target)) {
      this.setState({ inputFocused: false });
    }
    if (
      this.state.showDropdown &&
      !this.internationalPhoneRef?.contains(e.target) &&
      !this.dropdownRef?.contains(e.target)
    ) {
      this.setState({ showDropdown: false });
    }
  };

  handleSearchChange = (e) => {
    const {
      currentTarget: { value: searchValue },
    } = e;

    const { selectedCountry } = this.state;
    let highlightCountryIndex = null;

    if (searchValue === "" && selectedCountry) {
      highlightCountryIndex = 0;
      // wait asynchronous search results re-render, then scroll
      setTimeout(() => this.scrollTo(this.getElement(0)), 100);
    }
    this.setState({ searchValue, highlightCountryIndex });
  };

  concatPreferredCountries = (preferredCountries, onlyCountries) => {
    if (preferredCountries.length > 0) {
      return [...new Set(preferredCountries.concat(onlyCountries))];
    } else {
      return onlyCountries;
    }
  };

  getDropdownCountryName = (country) => {
    if (
      this.props.localization &&
      Object.keys(this.props.localization).length > 0 &&
      country.localName
    ) {
      return `${country.name} - ${country.localName}`;
    }
    return country.name;
  };

  getSearchFilteredCountries = () => {
    const { preferredCountries, onlyCountries, searchValue, selectedCountry } =
      this.state;
    const { enableSearch } = this.props;
    const allCountries = this.concatPreferredCountries(
      preferredCountries,
      onlyCountries
    );
    const sanitizedSearchValue = searchValue
      .trim()
      .toLowerCase()
      .replace("+", "");
    if (enableSearch && sanitizedSearchValue) {
      // [...new Set()] to get rid of duplicates
      // firstly search by iso2 code
      if (/^\d+$/.test(sanitizedSearchValue)) {
        // contains digits only
        // values wrapped in ${} to prevent undefined
        return allCountries.filter(({ dialCode }) =>
          [`${dialCode.replace(/\D/g, "")}`].some((field) =>
            field.toLowerCase().includes(sanitizedSearchValue)
          )
        );
      } else {
        const iso2countries = allCountries.filter(({ iso2 }) =>
          [`${iso2}`].some((field) =>
            field.toLowerCase().includes(sanitizedSearchValue)
          )
        );
        // || '' - is a fix to prevent search of 'undefined' strings
        // Since all the other values shouldn't be undefined, this fix was accepte
        // but the structure do not looks very good
        const searchedCountries = allCountries.filter(
          ({ name, localName, iso2 }) =>
            [`${name}`, `${localName || ""}`].some((field) =>
              field.toLowerCase().includes(sanitizedSearchValue)
            )
        );
        this.scrollToTop();
        return [...new Set([].concat(iso2countries, searchedCountries))];
      }
    } else {
      let combinedCountries = allCountries;
      if (selectedCountry) {
        combinedCountries = [
          selectedCountry,
          ...combinedCountries.filter(
            (country) => country.iso2 !== selectedCountry.iso2
          ),
        ];
      }
      return combinedCountries;
    }
  };

  getCountryDropdownList = () => {
    const { highlightCountryIndex, showDropdown, searchValue } = this.state;
    const { prefix } = this.props;
    const {
      enableSearch,
      searchNotFound,
      searchPlaceholder,
      autocompleteSearch,
    } = this.props;

    let searchedCountries = this.getSearchFilteredCountries();

    let countryDropdownList = searchedCountries.map((country, index) => {
      const highlight = highlightCountryIndex === index;

      return (
        <li
          ref={(el) => (this[`flag_no_${index}`] = el)}
          key={`flag_no_${index}`}
          data-flag-key={`flag_no_${index}`}
          className={classNames({
            [css["country"]]: true,
            [css["preferred"]]: country.iso2 === "us" || country.iso2 === "gb",
            [css["active"]]: country.iso2 === "us",
            [css["highlight"]]: highlight,
          })}
          data-country-code={country.iso2}
          onClick={(e) => this.handleFlagItemClick(country, e)}
          role="option"
          aria-selected="false"
          {...(highlight ? { "aria-selected": true } : {})}
        >
          <div className={`${css["flag"]} ${css[country.iso2]}`} />
          <div className={css["country-content"]}>
            {`${this.getDropdownCountryName(country)} (${
              prefix + country.dialCode
            })`}
          </div>
        </li>
      );
    });

    return ReactDOM.createPortal(
      <ul
        ref={(el) => {
          !enableSearch && el && el.focus();
          return (this.dropdownRef = el);
        }}
        className={classNames({
          [css["country-list"]]: true,
          [css["open"]]: showDropdown,
        })}
      >
        {enableSearch && (
          <li className={css["search-block"]}>
            <div className={css["search-img-wrapper"]}>
              <img
                src={`${process.env.NEXT_PUBLIC_URL}/svg/search.svg`}
                className={css["search-img"]}
                alt="Search icon"
              />
            </div>
            <input
              className={css["search-input"]}
              type="text"
              placeholder={searchPlaceholder}
              autoFocus={true}
              autoComplete={autocompleteSearch ? "on" : "off"}
              value={searchValue}
              onChange={this.handleSearchChange}
            />
          </li>
        )}
        {countryDropdownList.length > 0 ? (
          countryDropdownList
        ) : (
          <li className={css["search-no-entries-message"]}>
            <span>{searchNotFound}</span>
          </li>
        )}
      </ul>,
      document.body
    );
  };

  render() {
    const { selectedCountry, showDropdown, inputNumberField, inputFocused } =
      this.state;
    const { disableDropdown, inputError } = this.props;

    return (
      <div
        className={classNames({
          [css["international-phone"]]: true,
          [css["focus"]]: inputFocused,
          [css["open"]]: showDropdown,
          [css["has-error"]]: inputError,
        })}
        onKeyDown={this.handleKeydown}
        ref={(el) => (this.internationalPhoneRef = el)}
      >
        {this.getCountryDropdownList()}
        <button
          type="button"
          onClick={
            disableDropdown ? undefined : this.handleCountryDropdownClick
          }
          className={classNames({
            [css["selected-country-button"]]: true,
            [css["open"]]: showDropdown,
          })}
          title={
            selectedCountry
              ? `${selectedCountry.localName || selectedCountry.name}: +${
                  selectedCountry.dialCode
                }`
              : ""
          }
          tabIndex={disableDropdown ? "-1" : "0"}
          aria-expanded={showDropdown ? true : undefined}
        >
          {!disableDropdown && (
            <>
              <span className={css["dial-code"]}>
                {this.props.prefix + selectedCountry.dialCode}
              </span>
              <div
                className={classNames({
                  [css["arrow"]]: true,
                  [css["up"]]: showDropdown,
                })}
              ></div>
            </>
          )}
        </button>
        <input
          className={classNames({
            [css["phone-input"]]: true,
            [css["open"]]: showDropdown,
          })}
          onChange={this.handleInput}
          onClick={this.handleInputClick}
          onDoubleClick={this.handleDoubleClick}
          onFocus={this.handleInputFocus}
          onBlur={this.handleInputBlur}
          onCopy={this.handleInputCopy}
          value={inputNumberField}
          onKeyDown={this.handleInputKeyDown}
          placeholder={this.props.placeholder}
          disabled={this.props.disabled}
          autoComplete="off"
          type="tel"
          {...this.props.inputProps}
          ref={(el) => {
            this.numberInputRef = el;
            if (typeof this.props.inputProps.ref === "function") {
              this.props.inputProps.ref(el);
            } else if (typeof this.props.inputProps.ref === "object") {
              this.props.inputProps.ref.current = el;
            }
          }}
        />
      </div>
    );
  }
}

export default PhoneInput;
