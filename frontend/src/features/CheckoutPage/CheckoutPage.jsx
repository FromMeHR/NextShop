"use client";

import React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  EMAIL_PATTERN,
  ALLOWED_NAME_SURNAME_SYMBOLS_PATTERN,
  PRODUCT_STOCK_STATUS,
} from "../../constants/constants";
import { useCart } from "../../hooks/useCart";
import { useDropdownPosition } from "../../hooks/useDropdownPosition";
import { Loader } from "../../components/Loader/Loader";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { PAYMENT_NAME } from "../../constants/constants";
import useSWR from "swr";
import axios from "axios";
import classnames from "classnames";
import PhoneInput from "../../components/IntlPhoneInput/IntlPhoneInput";
import ua from "../../components/IntlPhoneInput/IntlPhoneComponents/lang/ua";
import ReactDOM from "react-dom";
import css from "./CheckoutPage.module.css";

export function CheckoutPage() {
  const [openedSections, setOpenedSections] = useState(["contact"]);
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [phoneUnhovered, setPhoneUnhovered] = useState(false);
  const [phoneData, setPhoneData] = useState(
    (localStorage.getItem("checkoutData") &&
      JSON.parse(localStorage.getItem("checkoutData")).phoneData) ||
      null
  );
  const { cart, outOfStockItems, totalPrice, totalWeight, totalQuantity, isLoading } = useCart();

  const router = useRouter();

  const [cities, setCities] = useState([]);
  const [searchCity, setSearchCity] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);

  const [warehouseTypes, setWarehouseTypes] = useState([]);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState(null);
  const [selectedWarehouseType, setSelectedWarehouseType] = useState(null);

  const [warehouses, setWarehouses] = useState([]);
  const [searchWarehouse, setSearchWarehouse] = useState("");
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  const [streets, setStreets] = useState([]);
  const [searchStreet, setSearchStreet] = useState("");
  const [filteredStreets, setFilteredStreets] = useState([]);
  const [selectedStreet, setSelectedStreet] = useState(null);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  const errorMessageTemplates = {
    requiredContact: "Заповніть правильно ваші контактні дані",
    requiredDelivery: "Заповніть правильно спосіб доставки",
    requiredPayment: "Заповніть правильно спосіб оплати",
  };

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    clearErrors,
    watch,
    trigger,
    formState: { errors, isSubmitted, isSubmitting },
  } = useForm({ mode: "all" });

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("checkoutData")) || {};
    if (savedData.surname) setValue("surname", savedData.surname);
    if (savedData.name) setValue("name", savedData.name);
    if (savedData.email) setValue("email", savedData.email);
    if (savedData.selectedCity) setSelectedCity(savedData.selectedCity);
  }, [setValue]);

  const saveToLocalStorage = async (field, value) => {
    const isValid = await trigger(field);
    if (!isValid) return;

    const savedData = JSON.parse(localStorage.getItem("checkoutData")) || {};
    savedData[field] = value;
    localStorage.setItem("checkoutData", JSON.stringify(savedData));
  };

  const handlePhoneChange = (countryData, e, formattedNumber, isValid) => {
    setPhoneData({ countryData, formattedNumber });

    if (isValid) {
      saveToLocalStorage("phoneData", { countryData, formattedNumber });
    }
  };

  const toggleSection = (sectionId) => {
    setOpenedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );

    if (openedSections.includes(sectionId) || sectionId === "contact") {
      const sectionEl = document.getElementById(`section-${sectionId}`);
      if (sectionEl) {
        const rect = sectionEl.getBoundingClientRect();
        const scrollTop = window.scrollY;
        const offsetTop = rect.top + scrollTop - 74;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    }
  };

  const isValidSection = (sectionId) => {
    let fieldsToValidate = [];

    if (sectionId === "contact") {
      fieldsToValidate = ["surname", "name", "email"];
      const isValid = trigger(fieldsToValidate);
      const isPhoneValid = validatePhone();
      if (!isPhoneValid) setPhoneUnhovered(true);
      return isValid && isPhoneValid;
    } else if (sectionId === "delivery") {
      if (selectedCity && selectedDeliveryType && selectedWarehouseType &&
        (selectedWarehouse || selectedStreet)) {
        if (selectedStreet) {
          if (watchedHouse?.trim() !== "" && /^\d+$/.test(watchedApartment?.trim())) {
            clearErrors("delivery");
            return true;
          } else {
            setError("delivery", {
              type: "manual",
              message: errorMessageTemplates.requiredDelivery,
            });
            return false;
          }
        }
        clearErrors("delivery");
        return true;
      } else {
        setError("delivery", {
          type: "manual",
          message: errorMessageTemplates.requiredDelivery,
        });
        return false;
      }
    } else if (sectionId === "payment") {
      if (selectedPaymentMethod) {
        clearErrors("payment");
        return true;
      } else {
        setError("payment", {
          type: "manual",
          message: errorMessageTemplates.requiredPayment,
        });
        return false;
      }
    }
  };

  const handleToggleSection = async (sectionId) => {
    if (sectionId === "contact") {
      if (isValidSection("contact")) toggleSection(sectionId);
    } else if (sectionId === "delivery") {
      if (!openedSections.includes("delivery") || isValidSection("delivery")) {
        toggleSection(sectionId);
      }
    } else if (sectionId === "payment") {
      if (!openedSections.includes("payment") || isValidSection("payment")) {
        toggleSection(sectionId);
      }
    }
  };

  const validateNameSurname = (value) => {
    const letterCount = (value.match(/[a-zA-Zа-щюяьА-ЩЮЯЬїЇіІєЄґҐ]/g) || [])
      .length;
    if (!ALLOWED_NAME_SURNAME_SYMBOLS_PATTERN.test(value) || letterCount < 2) {
      return errorMessageTemplates.requiredContact;
    }
    return true;
  };

  const validatePhone = useCallback(() => {
    if (!isValidPhone) {
      setError("phone", {
        type: "manual",
        message: errorMessageTemplates.requiredContact,
      });
    } else {
      clearErrors("phone");
    }
    return isValidPhone;
  }, [
    isValidPhone,
    setError,
    clearErrors,
    errorMessageTemplates.requiredContact,
  ]);

  useEffect(() => {
    if (!phoneUnhovered) return;
    validatePhone();
  }, [isValidPhone, phoneUnhovered, validatePhone]);

  const debouncedSetSearch = useMemo(() => {
    return debounce((value) => {
      setDebouncedSearch(value);
    }, 500);
  }, []);

  useEffect(() => {
    debouncedSetSearch(searchCity);
  }, [searchCity, debouncedSetSearch]);

  const fetchCities = async ([url, city]) => {
    const { data } = await axios.get(`${url}/api/search-city/`, {
      params: { name: city },
    });
    return data || [];
  };

  const { error: citiesError, isLoading: citiesLoading } = useSWR(
    debouncedSearch && debouncedSearch.length >= 2
      ? [process.env.NEXT_PUBLIC_BASE_API_URL, debouncedSearch]
      : null,
    fetchCities,
    { onSuccess: (data) => setCities(data) }
  );

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    saveToLocalStorage("selectedCity", city);
    setIsDropdownCityOpen(false);
    setSearchCity("");
  };

  const {
    isOpen: isDropdownCityOpen,
    setIsOpen: setIsDropdownCityOpen,
    position: dropdownCityPosition,
    selectBoxRef: selectCityBoxRef,
    dropdownRef: dropdownCityRef,
  } = useDropdownPosition({
    dependencies: [cities, searchCity.length < 2],
  });

  const fetchWarehouseTypes = async ([url, city]) => {
    try {
      const { data } = await axios.get(`${url}/api/warehouse-types/`, {
        params: { city_ref: city.ref },
      });
      return data || [];
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const savedData =
          JSON.parse(localStorage.getItem("checkoutData")) || {};
        delete savedData.selectedCity;
        localStorage.setItem("checkoutData", JSON.stringify(savedData));
        setSelectedCity(null);
      }
      throw error;
    }
  };

  const { error: warehouseTypesError, isLoading: warehouseTypesLoading } =
    useSWR(
      selectedCity?.ref
        ? [process.env.NEXT_PUBLIC_BASE_API_URL, selectedCity]
        : null,
      fetchWarehouseTypes,
      {
        onSuccess: (data) => setWarehouseTypes(data),
        revalidateOnFocus: false,
      }
    );

  const handleDeliveryItemClick = (deliveryTypeId) => {
    setSelectedDeliveryType(deliveryTypeId);
    setSelectedWarehouseType(null);
    setSelectedWarehouse(null);
    setSearchWarehouse("");
    setSelectedStreet(null);
    setSearchStreet("");
  };

  const handleWarehouseTypeClick = async (warehouseType) => {
    setSelectedWarehouseType(warehouseType);
  };

  const fetchWarehouses = async ([url, city, warehouseType]) => {
    try {
      const { data } = await axios.get(`${url}/api/warehouses/`, {
        params: {
          city_ref: city.ref,
          warehouse_type_ref: warehouseType.ref,
        },
      });
      return data || [];
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const savedData =
          JSON.parse(localStorage.getItem("checkoutData")) || {};
        delete savedData.selectedCity;
        localStorage.setItem("checkoutData", JSON.stringify(savedData));
        setSelectedCity(null);
        setSelectedWarehouseType(null);
      }
      throw error;
    }
  };

  useSWR(selectedDeliveryType === 1 && selectedCity?.ref && selectedWarehouseType?.ref
    ? [process.env.NEXT_PUBLIC_BASE_API_URL, selectedCity, selectedWarehouseType]
      : null,
    fetchWarehouses,
    {
      onSuccess: (data) => {
        setWarehouses(data);
        setFilteredWarehouses(data);
        setSelectedWarehouse(null);
        setSearchWarehouse("");
      },
      revalidateOnFocus: false,
    }
  );

  const handleWarehouseSelect = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsDropdownWarehouseOpen(false);
    setSearchWarehouse("");
    clearErrors("delivery");
  };

  const handleWarehouseSearch = (searchQuery) => {
    const filteredWarehouses = warehouses.filter((warehouse) =>
      warehouse.name_ukr.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredWarehouses(filteredWarehouses);
    setSearchWarehouse(searchQuery);
  };

  const {
    isOpen: isDropdownWarehouseOpen,
    setIsOpen: setIsDropdownWarehouseOpen,
    position: dropdownWarehousePosition,
    selectBoxRef: selectWarehouseBoxRef,
    dropdownRef: dropdownWarehouseRef,
  } = useDropdownPosition({
    dependencies: [filteredWarehouses],
  });

  const fetchStreets = async ([url, cityRef]) => {
    try {
      const { data } = await axios.get(`${url}/api/streets/`, {
        params: {
          city_ref: cityRef
        },
      });
      return data || [];
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const savedData =
          JSON.parse(localStorage.getItem("checkoutData")) || {};
        delete savedData.selectedCity;
        localStorage.setItem("checkoutData", JSON.stringify(savedData));
        setSelectedCity(null);
        setSelectedWarehouseType(null);
      }
      throw error;
    }
  };

  useSWR(selectedDeliveryType === 2 && selectedCity?.ref
    ? [process.env.NEXT_PUBLIC_BASE_API_URL, selectedCity.ref]
      : null,
    fetchStreets,
    {
      onSuccess: (data) => {
        setStreets(data);
        setFilteredStreets(data);
        setSelectedStreet(null);
        setSearchStreet("");
      },
      revalidateOnFocus: false,
    }
  );

  const handleStreetSelect = (street) => {
    setSelectedStreet(street);
    setIsDropdownStreetOpen(false);
    setSearchStreet("");
    if (watchedHouse?.trim() !== "" && /^\d+$/.test(watchedApartment?.trim())) {
      clearErrors("delivery");
    }
  };

  const handleStreetSearch = (searchQuery) => {
    const filteredStreets = streets.filter((street) =>
      street.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStreets(filteredStreets);
    setSearchStreet(searchQuery);
  };

  const {
    isOpen: isDropdownStreetOpen,
    setIsOpen: setIsDropdownStreetOpen,
    position: dropdownStreetPosition,
    selectBoxRef: selectStreetBoxRef,
    dropdownRef: dropdownStreetRef,
  } = useDropdownPosition({
    dependencies: [filteredStreets],
  });

  const watchedHouse = watch("house");
  const watchedApartment = watch("apartment");

  useEffect(() => {
    if (selectedStreet &&
      watchedHouse?.trim() !== "" &&
      /^\d+$/.test(watchedApartment?.trim())) {
      clearErrors("delivery");
    }
  }, [watchedHouse, watchedApartment, selectedStreet, clearErrors]);

  const onSubmit = async (value) => {
    const sections = ["contact", "delivery", "payment"];
    let isValid = true;
    sections.forEach((section) => {
      if (!isValidSection(section)) {
        !openedSections.includes(section) && toggleSection(section);
        isValid = false;
        return;
      }
    });
    if (!isValid || outOfStockItems.length > 0) return;

    const dataToSend = {
      surname: value.surname.trim(),
      name: value.name.trim(),
      email: value.email.trim(),
      formatted_number: phoneData.formattedNumber,
      selected_city_ref: selectedCity?.ref,
      selected_warehouse_type_id: selectedWarehouseType?.id,
      selected_warehouse_ref: selectedWarehouse?.ref,
      selected_street_ref: selectedStreet?.ref,
      house: value.house.trim(),
      apartment: value.apartment.trim(),
      comment: value.comment.trim(),
      selected_payment_method: selectedPaymentMethod.name,
    };

    await axios({
      method: "post",
      url: `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/create-order/`,
      data: dataToSend,
      withCredentials: true,
    })
      .then((resp) => {
        const forwardUrl = resp.data?.forward_url;
        const redirectUrl = resp.data?.redirect_url;
        if (redirectUrl && forwardUrl) {
          localStorage.setItem("forwardUrl", forwardUrl);
          router.push(new URL(redirectUrl).pathname);
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          const errorMessage = error.response.data[0];
          if (errorMessage) {
            toast.error(errorMessage);
          }
          console.error(error);
        } else {
          console.error(error);
          toast.error("Сталася помилка. Будь ласка, спробуйте пізніше.");
        }
      });
  };

  return (
    <div className={css["checkout__main"]}>
      <div className={css["checkout__content"]}>
        {cart && cart.length === 0 ? (
        <>
          {isLoading ? <Loader /> :
            <div className={css["cart-empty"]}>
              <div
                className={css["cart-empty__robot-image-wrapper"]}
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_URL}/img/robot.png`}
                  alt="Robot"
                  className={css["cart-empty__robot-image"]}
                />
              </div>
              <div className={css["cart-empty__content"]}>
                <div className={css["cart-empty__title"]}>
                  Ваш кошик порожній
                </div>
                <ul className={css["cart-empty__list"]}>
                  <li>Перейдіть на головну сторінку або скористайтеся пошуком,
                    щоб знайти все, що вам потрібно
                  </li>
                </ul>
                <a href="/">
                  <div className={css["cart-empty__btn-wrapper"]}>
                    <button className={css["cart-empty__btn-back"]}>
                      Перейти на головну
                    </button>
                  </div>
                </a>
              </div>
            </div>
          }
        </>
        ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.tagName === "INPUT") {
              e.preventDefault();
            }
          }}
        >
          <div className={css["checkout__row"]}>
            <div className={css["checkout__left"]}>
              <div className={css["checkout__block"]}>
                <div
                  id="section-contact"
                  className={`${css["checkout__section"]} ${
                    openedSections.includes("contact") ? css["open"] : ""
                  }`}
                >
                  <div
                    className={css["checkout__header-wrapper"]}
                    onClick={() => handleToggleSection("contact")}
                  >
                    <div className={css["checkout__header"]}>
                      <div className={css["checkout__number"]}>01</div>
                      <div className={css["checkout__title"]}>
                        Контактні дані
                      </div>
                    </div>
                    <div
                      className={`${css["checkout__header-selected-items"]} ${
                        !(
                          errors.surname ||
                          errors.name ||
                          errors.email ||
                          ((phoneUnhovered || isSubmitted) && !isValidPhone)
                        ) && !openedSections.includes("contact")
                          ? css["show"]
                          : ""
                      }`}
                    >
                      <div className={css["checkout__header-selected-item"]}>
                        {getValues("surname")} {getValues("name")}
                      </div>
                      <div className={css["checkout__header-selected-item"]}>
                        {phoneData && phoneData.formattedNumber}
                      </div>
                      <div className={css["checkout__header-selected-item"]}>
                        {getValues("email")}
                      </div>
                    </div>
                  </div>
                  <div className={css["checkout__section--content-wrapper"]}>
                    <div className={css["checkout__section--content"]}>
                      <div className={css["checkout__section--content-body"]}>
                        {(errors.surname ||
                          errors.name ||
                          errors.email ||
                          ((phoneUnhovered || isSubmitted) && !isValidPhone)) && (
                          <div className={css["checkout__msg-error"]}>
                            {errorMessageTemplates.requiredContact}
                          </div>
                        )}
                        <div className={css["checkout__content-subtitle"]}>
                          Особисті дані
                        </div>
                        <div className={css["checkout__content-item"]}>
                          <div
                            className={classnames(css["form-floating"], {
                              [css["has-error"]]: errors.surname,
                            })}
                          >
                            <input
                              id="form-surname"
                              type="text"
                              className={css["form-input"]}
                              placeholder=""
                              {...register("surname", {
                                required: errorMessageTemplates.requiredContact,
                                validate: validateNameSurname,
                                onChange: (e) =>
                                  saveToLocalStorage("surname", e.target.value),
                              })}
                              maxLength={50}
                            />
                            <label htmlFor="form-surname">Прізвище</label>
                          </div>
                        </div>
                        <div className={css["checkout__content-item"]}>
                          <div
                            className={classnames(css["form-floating"], {
                              [css["has-error"]]: errors.name,
                            })}
                          >
                            <input
                              id="form-name"
                              type="text"
                              className={css["form-input"]}
                              placeholder=""
                              {...register("name", {
                                required: errorMessageTemplates.requiredContact,
                                validate: validateNameSurname,
                                onChange: (e) =>
                                  saveToLocalStorage("name", e.target.value),
                              })}
                              maxLength={50}
                            />
                            <label htmlFor="form-name">Ім'я</label>
                          </div>
                        </div>
                        <div className={css["checkout__content-subtitle"]}>
                          Ваші контакти
                        </div>
                        <div className={css["checkout__content-item"]}>
                          <div className={css["form-floating"]}>
                            <PhoneInput
                              onChange={handlePhoneChange}
                              onChangeValidity={setIsValidPhone}
                              localStorageNumberData={phoneData}
                              country="ua"
                              localization={ua}
                              preferredCountries={["ua"]}
                              excludeCountries={["ru"]}
                              countryCodeEditable={false}
                              enableSearch={true}
                              enableTerritories={true}
                              enableAreaCodes={true}
                              inputError={
                                (phoneUnhovered || isSubmitted) && !isValidPhone
                              }
                              inputProps={{
                                id: "form-phone",
                                onBlur: () => setPhoneUnhovered(true),
                              }}
                            />
                            <label
                              htmlFor="form-phone"
                              className={css["form-phone-label"]}
                            >
                              Номер телефону
                            </label>
                            <div className={css["forms__row-text"]}>
                              Номер для зв'язку з менеджером
                            </div>
                          </div>
                        </div>
                        <div className={css["checkout__content-item"]}>
                          <div
                            className={classnames(css["form-floating"], {
                              [css["has-error"]]: errors.email,
                            })}
                          >
                            <input
                              id="form-email"
                              type="email"
                              className={css["form-input"]}
                              placeholder=""
                              {...register("email", {
                                required: errorMessageTemplates.requiredContact,
                                pattern: {
                                  value: EMAIL_PATTERN,
                                  message: errorMessageTemplates.requiredContact,
                                },
                                onChange: (e) =>
                                  saveToLocalStorage("email", e.target.value),
                              })}
                            />
                            <label htmlFor="form-email">E-mail</label>
                            <div className={css["forms__row-text"]}>
                              E-mail для відстеження статусу замовлення
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={css["checkout__content-button"]}
                          disabled={
                            errors.surname ||
                            errors.name ||
                            errors.email ||
                            !isValidPhone
                          }
                          onClick={() =>
                            handleToggleSection("contact") &&
                            isValidSection("contact") &&
                            !openedSections.includes("delivery") &&
                            handleToggleSection("delivery")
                          }
                        >
                          Обрати спосіб доставки
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  id="section-delivery"
                  className={`${css["checkout__section"]} ${
                    openedSections.includes("delivery") ? css["open"] : ""
                  }`}
                >
                  <div
                    className={css["checkout__header-wrapper"]}
                    onClick={() => handleToggleSection("delivery")}
                  >
                    <div className={css["checkout__header"]}>
                      <div className={css["checkout__number"]}>02</div>
                      <div className={css["checkout__title"]}>Доставка</div>
                    </div>
                    <div
                      className={`${css["checkout__header-selected-items"]} ${
                        selectedCity && !openedSections.includes("delivery")
                          ? css["show"]
                          : ""
                      }`}
                    >
                      {selectedCity && (
                        <div className={css["checkout__header-selected-item"]}>
                          {selectedCity.name_ukr}
                        </div>
                      )}
                      {selectedWarehouseType && (
                        <div className={css["checkout__header-selected-item"]}>
                          {selectedWarehouseType.name}
                        </div>
                      )}
                      {selectedWarehouse && (
                        <div className={css["checkout__header-selected-item"]}>
                          {selectedWarehouse.name_ukr}
                        </div>
                      )}
                      {selectedStreet && getValues("house") && getValues("apartment") && (
                        <div className={css["checkout__header-selected-item"]}>
                          {`${selectedStreet.name}, ${getValues("house")}, 
                            ${getValues("apartment")}`}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={css["checkout__section--content-wrapper"]}>
                    <div className={css["checkout__section--content"]}>
                      <div className={css["checkout__section--content-body"]}>
                        {errors.delivery && (
                          <div className={css["checkout__msg-error"]}>
                            {errorMessageTemplates.requiredDelivery}
                          </div>
                        )}
                        <div className={css["checkout__content-item"]}>
                          <div
                            className={`${css["checkout__select-box"]} ${
                              dropdownCityPosition === "above"
                                ? css["open-above"]
                                : css["open-below"]
                            } ${isDropdownCityOpen ? css["open"] : ""}`}
                            onClick={() => setIsDropdownCityOpen((prev) => !prev)}
                            ref={selectCityBoxRef}
                          >
                            <div className={css["checkout__selected-item"]}>
                              {selectedCity
                                ? selectedCity.name_ukr
                                : "Виберіть місто"}
                            </div>
                            <div
                              className={`${css["checkout__select-arrow"]} ${
                                isDropdownCityOpen ? css["open"] : ""
                              }`}
                            >
                              <img
                                src={`${process.env.NEXT_PUBLIC_URL}/svg/caret-down.svg`}
                                alt="Arrow"
                              />
                            </div>
                          </div>
                          {ReactDOM.createPortal(
                            <div
                              className={`${css["checkout__dropdown"]} ${
                                dropdownCityPosition === "above"
                                  ? css["open-above"]
                                  : css["open-below"]
                              } ${isDropdownCityOpen ? css["open"] : ""}`}
                              ref={dropdownCityRef}
                            >
                              <ul className={css["checkout__dropdown-results"]}>
                                <li className={css["checkout__search-block"]}>
                                  <div
                                    className={
                                      css["checkout__search-img-wrapper"]
                                    }
                                  >
                                    <img
                                      src={`${process.env.NEXT_PUBLIC_URL}/svg/search.svg`}
                                      className="checkout__search-img"
                                      alt="Search icon"
                                    />
                                  </div>
                                  <input
                                    className={css["checkout__search-input"]}
                                    type="text"
                                    placeholder="Пошук"
                                    value={searchCity}
                                    onChange={(e) =>
                                      setSearchCity(e.target.value)
                                    }
                                  />
                                </li>
                                {searchCity.length < 2 ? (
                                  <li className={css["search-results-message"]}>
                                    Введіть два або більше символів
                                  </li>
                                ) : (
                                  <>
                                    {cities && cities.length > 0 ? (
                                      <>
                                        {citiesLoading && !citiesError && (
                                          <li
                                            className={
                                              css["search-results-message"]
                                            }
                                          >
                                            Пошук...
                                          </li>
                                        )}
                                        {cities.map((city) => (
                                          <li
                                            key={city.ref}
                                            className={css["search-results-item"]}
                                            onClick={() => handleCitySelect(city)}
                                          >
                                            {city.name_ukr}
                                          </li>
                                        ))}
                                      </>
                                    ) : (
                                      <li className={css["search-results-message"]}>
                                        Не знайдено
                                      </li>
                                    )}
                                  </>
                                )}
                              </ul>
                            </div>,
                            document.body
                          )}
                          {!warehouseTypesLoading && !warehouseTypesError ? (
                            <>
                              <div className={css["checkout__content-subtitle"]}>
                                Спосіб доставки
                              </div>
                              {warehouseTypes &&
                                warehouseTypes.length > 0 &&
                                [
                                  ...new Map(
                                    warehouseTypes.map((item) => [
                                      item.delivery_type.id,
                                      item.delivery_type,
                                    ])
                                  ).values(),
                                ].map((deliveryType) => (
                                  <React.Fragment key={deliveryType.id}>
                                    <div
                                      className={`${
                                        css["checkout__delivery-item"]
                                      } ${
                                        selectedDeliveryType === deliveryType.id
                                          ? css["open"]
                                          : ""
                                      }`}
                                    >
                                      <div
                                        className={css["checkout__delivery-item-header"]}
                                        onClick={() =>
                                          handleDeliveryItemClick(deliveryType.id)
                                        }
                                      >
                                        <div className={css["checkout__delivery-item-column"]}>
                                          <div className={css["checkout__delivery-item-title"]}>
                                            {deliveryType.name}.
                                            {deliveryType.id === 1 &&
                                              ` Об'ємна вага: ${totalWeight.toFixed(2)} кг`}
                                          </div>
                                        </div>
                                      </div>
                                      <div className={css["checkout__delivery-item--content-wrapper"]}>
                                        <div className={css["checkout__delivery-item--content"]}>
                                          {deliveryType.id === 1 && (
                                            <div className={css["checkout__delivery-item--content-body"]}>
                                              <div className={css["checkout__content-subtitle"]}>
                                                Виберіть оператора
                                              </div>
                                              <div className={css["checkout__delivery-box"]}>
                                              {warehouseTypes
                                                .filter((wt) => wt.delivery_type.id === deliveryType.id)
                                                .map((warehouseType) => (
                                                  <div
                                                    key={warehouseType.ref}
                                                    className={css["checkout__delivery-operator-wrapper"]}
                                                  >
                                                    <div
                                                      key={warehouseType.ref}
                                                      className={`${css["checkout__delivery-operator"]} ${
                                                        selectedWarehouseType?.ref ===
                                                        warehouseType.ref
                                                          ? css["active"]
                                                          : ""
                                                      }`}
                                                      onClick={() =>
                                                        handleWarehouseTypeClick(warehouseType)
                                                      }
                                                    >
                                                      {warehouseType.image && (
                                                        <div
                                                          className={css["checkout__delivery-operator-icon"]}
                                                        >
                                                          <img
                                                            src={warehouseType.image}
                                                            alt={warehouseType.name}
                                                          />
                                                        </div>
                                                      )}
                                                      <div
                                                        className={css["checkout__delivery-operator-title"]}
                                                      >
                                                        {warehouseType.name}
                                                      </div>
                                                      <div className={css["checkout__delivery-operator-row"]}>
                                                        <span
                                                          className={css["checkout__delivery-operator-subtitle"]}
                                                        >
                                                          Ціна:
                                                        </span>
                                                        <span> від {warehouseType.min_delivery_price} грн</span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                              {selectedWarehouseType && (
                                                <>
                                                <div className={css["checkout__content-subtitle"]}>
                                                  Виберіть відділення/поштомат
                                                </div>
                                                <div
                                                  className={`${css["checkout__select-box"]} ${
                                                    dropdownWarehousePosition === "above"
                                                      ? css["open-above"]
                                                      : css["open-below"]
                                                  } ${isDropdownWarehouseOpen ? css["open"] : ""}`}
                                                  onClick={() => setIsDropdownWarehouseOpen((prev) => !prev)}
                                                  ref={selectWarehouseBoxRef}
                                                >
                                                  <div className={css["checkout__selected-item"]}>
                                                    {selectedWarehouse
                                                      ? selectedWarehouse.name_ukr
                                                      : "Не обрано"}
                                                  </div>
                                                  <div
                                                    className={`${css["checkout__select-arrow"]} ${
                                                      isDropdownWarehouseOpen ? css["open"] : ""
                                                    }`}
                                                  >
                                                    <img
                                                      src={`${process.env.NEXT_PUBLIC_URL}/svg/caret-down.svg`}
                                                      alt="Arrow"
                                                    />
                                                  </div>
                                                </div>
                                                {ReactDOM.createPortal(
                                                  <div
                                                    className={`${css["checkout__dropdown"]} ${
                                                      dropdownWarehousePosition === "above"
                                                        ? css["open-above"]
                                                        : css["open-below"]
                                                    } ${isDropdownWarehouseOpen ? css["open"] : ""}`}
                                                    ref={dropdownWarehouseRef}
                                                  >
                                                    <ul className={css["checkout__dropdown-results"]}>
                                                      <li className={css["checkout__search-block"]}>
                                                        <div
                                                          className={
                                                            css["checkout__search-img-wrapper"]
                                                          }
                                                        >
                                                          <img
                                                            src={`${process.env.NEXT_PUBLIC_URL}/svg/search.svg`}
                                                            className="checkout__search-img"
                                                            alt="Search icon"
                                                          />
                                                        </div>
                                                        <input
                                                          className={css["checkout__search-input"]}
                                                          type="text"
                                                          placeholder="Пошук"
                                                          value={searchWarehouse}
                                                          onChange={(e) =>
                                                            handleWarehouseSearch(e.target.value)
                                                          }
                                                        />
                                                      </li>
                                                      {filteredWarehouses && filteredWarehouses.length > 0 ? (
                                                        <>
                                                          {filteredWarehouses.map((warehouse) => (
                                                            <li
                                                              key={warehouse.ref}
                                                              className={css["search-results-item"]}
                                                              onClick={() => handleWarehouseSelect(warehouse)}
                                                            >
                                                              {warehouse.name_ukr} <br/>
                                                              {totalWeight > warehouse.max_weight_allowed && (
                                                                <span className={css["search-results-item-error"]}>
                                                                  вага замовлення більше ліміту видачі
                                                                </span>
                                                              )}
                                                            </li>
                                                          ))}
                                                        </>
                                                      ) : (
                                                        <li className={css["search-results-message"]}>
                                                          Не знайдено
                                                        </li>
                                                      )}
                                                    </ul>
                                                  </div>,
                                                  document.body
                                                )}
                                                </>
                                              )}
                                              <button
                                                type="button"
                                                className={css["checkout__content-button"]}
                                                disabled={errors.delivery}
                                                onClick={() =>
                                                  handleToggleSection("delivery") &&
                                                  isValidSection("delivery") &&
                                                  !openedSections.includes("payment") &&
                                                  handleToggleSection("payment")
                                                }
                                              >
                                                Обрати спосіб оплати
                                              </button>
                                            </div>
                                          )}
                                          {deliveryType.id === 2 && (
                                            <div className={css["checkout__delivery-item--content-body"]}>
                                              <div className={css["checkout__content-subtitle"]}>
                                                Виберіть оператора
                                              </div>
                                              <div className={css["checkout__delivery-box"]}>
                                              {warehouseTypes
                                                .filter((wt) => wt.delivery_type.id === deliveryType.id)
                                                .map((warehouseType) => (
                                                  <div
                                                    key={warehouseType.ref}
                                                    className={css["checkout__delivery-operator-wrapper"]}
                                                  >
                                                    <div
                                                      key={warehouseType.ref}
                                                      className={`${css["checkout__delivery-operator"]} ${
                                                        selectedWarehouseType?.ref ===
                                                        warehouseType.ref
                                                          ? css["active"]
                                                          : ""
                                                      }`}
                                                      onClick={() =>
                                                        handleWarehouseTypeClick(warehouseType)
                                                      }
                                                    >
                                                      {warehouseType.image && (
                                                        <div
                                                          className={css["checkout__delivery-operator-icon"]}
                                                        >
                                                          <img
                                                            src={warehouseType.image}
                                                            alt={warehouseType.name}
                                                          />
                                                        </div>
                                                      )}
                                                      <div
                                                        className={css["checkout__delivery-operator-title"]}
                                                      >
                                                        {warehouseType.name}
                                                      </div>
                                                      <div className={css["checkout__delivery-operator-row"]}>
                                                        <span
                                                          className={css["checkout__delivery-operator-subtitle"]}
                                                        >
                                                          Ціна:
                                                        </span>
                                                        <span> від {warehouseType.min_delivery_price} грн</span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                              {selectedWarehouseType && (
                                                <>
                                                <div className={css["checkout__content-subtitle"]}>
                                                  Адреса доставки
                                                </div>
                                                <div
                                                  className={`${css["checkout__select-box"]} ${
                                                    dropdownStreetPosition === "above"
                                                      ? css["open-above"]
                                                      : css["open-below"]
                                                  } ${isDropdownStreetOpen ? css["open"] : ""}`}
                                                  onClick={() => setIsDropdownStreetOpen((prev) => !prev)}
                                                  ref={selectStreetBoxRef}
                                                >
                                                  <div className={css["checkout__selected-item"]}>
                                                    {selectedStreet
                                                      ? selectedStreet.name
                                                      : "Не обрано"}
                                                  </div>
                                                  <div
                                                    className={`${css["checkout__select-arrow"]} ${
                                                      isDropdownStreetOpen ? css["open"] : ""
                                                    }`}
                                                  >
                                                    <img
                                                      src={`${process.env.NEXT_PUBLIC_URL}/svg/caret-down.svg`}
                                                      alt="Arrow"
                                                    />
                                                  </div>
                                                  <label className={css["select-street-label"]}>Вулиця</label>
                                                </div>
                                                {ReactDOM.createPortal(
                                                  <div
                                                    className={`${css["checkout__dropdown"]} ${
                                                      dropdownStreetPosition === "above"
                                                        ? css["open-above"]
                                                        : css["open-below"]
                                                    } ${isDropdownStreetOpen ? css["open"] : ""}`}
                                                    ref={dropdownStreetRef}
                                                  >
                                                    <ul className={css["checkout__dropdown-results"]}>
                                                      <li className={css["checkout__search-block"]}>
                                                        <div
                                                          className={
                                                            css["checkout__search-img-wrapper"]
                                                          }
                                                        >
                                                          <img
                                                            src={`${process.env.NEXT_PUBLIC_URL}/svg/search.svg`}
                                                            className="checkout__search-img"
                                                            alt="Search icon"
                                                          />
                                                        </div>
                                                        <input
                                                          className={css["checkout__search-input"]}
                                                          type="text"
                                                          placeholder="Пошук"
                                                          value={searchStreet}
                                                          onChange={(e) =>
                                                            handleStreetSearch(e.target.value)
                                                          }
                                                        />
                                                      </li>
                                                      {filteredStreets && filteredStreets.length > 0 ? (
                                                        <>
                                                          {filteredStreets.map((street) => (
                                                            <li
                                                              key={street.ref}
                                                              className={css["search-results-item"]}
                                                              onClick={() => handleStreetSelect(street)}
                                                            >
                                                              {street.name}
                                                            </li>
                                                          ))}
                                                        </>
                                                      ) : (
                                                        <li className={css["search-results-message"]}>
                                                          Не знайдено
                                                        </li>
                                                      )}
                                                    </ul>
                                                  </div>,
                                                  document.body
                                                )}
                                                <div className={css["checkout__content-item"]}>
                                                  <div className={css["checkout__street-subitems"]}>
                                                    <div className={css["form-floating"]}>
                                                      <input
                                                        id="form-house"
                                                        type="text"
                                                        className={css["form-input"]}
                                                        placeholder=""
                                                        {...register("house")}
                                                        maxLength={50}
                                                      />
                                                      <label htmlFor="form-house">Будинок</label>
                                                    </div>
                                                    <div className={css["form-floating"]}>
                                                      <input
                                                        id="form-apartment"
                                                        type="text"
                                                        className={css["form-input"]}
                                                        placeholder=""
                                                        {...register("apartment")}
                                                        maxLength={50}
                                                      />
                                                      <label htmlFor="form-apartment">Квартира</label>
                                                    </div>
                                                  </div>
                                                </div>
                                                </>
                                              )}
                                              <button
                                                type="button"
                                                className={css["checkout__content-button"]}
                                                disabled={errors.delivery}
                                                onClick={() => {
                                                  handleToggleSection("delivery") &&
                                                  isValidSection("delivery") &&
                                                  !openedSections.includes("payment") &&
                                                  handleToggleSection("payment");
                                                }}
                                              >
                                                Обрати спосіб оплати
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      className={
                                        css["checkout__delivery-item-line"]
                                      }
                                    ></div>
                                  </React.Fragment>
                                ))}
                            </>
                          ) : (
                            <div>Завантаження...</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  id="section-payment"
                  className={`${css["checkout__section"]} ${
                    openedSections.includes("payment") ? css["open"] : ""
                  }`}
                >
                  <div
                    className={css["checkout__header-wrapper"]}
                    onClick={() => handleToggleSection("payment")}
                  >
                    <div className={css["checkout__header"]}>
                      <div className={css["checkout__number"]}>03</div>
                      <div className={css["checkout__title"]}>Оплата</div>
                    </div>
                    <div
                      className={`${css["checkout__header-selected-items"]} ${
                        selectedPaymentMethod && !openedSections.includes("payment")
                          ? css["show"]
                          : ""
                      }`}
                    >
                      {selectedPaymentMethod && (
                        <div className={css["checkout__header-selected-item"]}>
                          {selectedPaymentMethod.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={css["checkout__section--content-wrapper"]}>
                    <div className={css["checkout__section--content"]}>
                      <div className={css["checkout__section--content-body"]}>
                        {errors.payment && (
                          <div className={css["checkout__msg-error"]}>
                            {errorMessageTemplates.requiredPayment}
                          </div>
                        )}
                        <div className={css["checkout__content-subtitle"]}>
                          Спосіб оплати
                        </div>
                        <div
                          className={`${css["checkout__payment-item"]} ${
                            selectedPaymentMethod?.name === PAYMENT_NAME.EASYPAY ? css["open"] : ""
                          }`}
                        >
                          <div
                            className={css["checkout__payment-item-header"]}
                            onClick={() => {
                              setSelectedPaymentMethod({
                                name: PAYMENT_NAME.EASYPAY,
                                description: "EasyPay (тільки картки українських банків)"
                              });
                              clearErrors("payment");
                            }}
                          >
                            <div className={css["checkout__payment-item-column"]}>
                              <div className={css["checkout__payment-item-title"]}>
                                EasyPay (тільки картки українських банків)
                              </div>
                              <div className={css["checkout__payment-item-subtitle"]}>
                                Оплата картами MasterCard, Visa, ApplePay, GooglePay
                                онлайн у EasyPay
                              </div>
                            </div>
                          </div>
                          <div className={css["checkout__payment-item--content-wrapper"]}>
                            <div className={css["checkout__payment-item--content"]}>
                              <div className={css["checkout__payment-item--content-body"]}>
                                <button
                                  type="button"
                                  className={css["checkout__content-button"]}
                                  disabled={errors.payment}
                                  onClick={() => handleToggleSection("payment")}
                                >
                                  Далі
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={css["checkout__payment-item-line"]}></div>
                        <div
                          className={`${css["checkout__payment-item"]} ${
                            selectedPaymentMethod?.name === PAYMENT_NAME.PLATA_BY_MONO ? css["open"] : ""
                          }`}
                        >
                          <div
                            className={css["checkout__payment-item-header"]}
                            onClick={() => {
                              setSelectedPaymentMethod({
                                name: PAYMENT_NAME.PLATA_BY_MONO,
                                description: "plata by mono"
                              });
                              clearErrors("payment");
                            }}
                          >
                            <div className={css["checkout__payment-item-column"]}>
                              <div className={css["checkout__payment-item-title"]}>
                                plata by mono
                              </div>
                              <div className={css["checkout__payment-item-subtitle"]}>
                                Оплата картами MasterCard, Visa, ApplePay, GooglePay
                                онлайн у Mono
                              </div>
                            </div>
                          </div>
                          <div className={css["checkout__payment-item--content-wrapper"]}>
                            <div className={css["checkout__payment-item--content"]}>
                              <div className={css["checkout__payment-item--content-body"]}>
                                <button
                                  type="button"
                                  className={css["checkout__content-button"]}
                                  disabled={errors.payment}
                                  onClick={() =>
                                    handleToggleSection("payment")
                                  }
                                >
                                  Далі
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={css["checkout__payment-item-line"]}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={css["checkout__section--content-body"]}>
                  <div className={css["form-floating"]}>
                    <textarea
                      id="checkout-comment"
                      className={css["checkout__comment"]}
                      placeholder=""
                      {...register("comment")}
                    ></textarea>
                    <label htmlFor="checkout-comment">
                      Коментар до замовлення
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className={css["checkout__right"]}>
              <div className={css["checkout__block"]}>
                <div className={css["checkout__summary"]}>
                  <div className={css["checkout__summary-header"]}>
                    <div className={css["checkout__summary-title"]}>
                      Моє замовлення
                    </div>
                    <button
                      type="button"
                      className={css["checkout__summary-edit-cart-button"]}
                      onClick={() => {
                        document.getElementById("cart-button").click();
                      }}
                    >
                      Редагувати
                    </button>
                  </div>
                  <div className={css["cart-wrapper"]}>
                    <div className={css["cart-custom-scroll"]}>
                      {outOfStockItems.length > 0 && (
                        <div className={css["cart__msg-attention"]}>
                          <img
                            src={`${process.env.NEXT_PUBLIC_URL}/svg/warning.svg`}
                            alt="Warning icon"
                          />
                          <p>
                            <strong>Зверніть увагу!</strong>
                          </p>
                          {outOfStockItems.map((item) => (
                            <p key={item.id}>
                              Товар <strong>{item.product_name}</strong> зараз
                              відсутній в наявності.
                            </p>
                          ))}
                        </div>
                      )}
                      {cart.map((item) => (
                        <div key={item.id} className={css["cart__product"]}>
                          <div className={css["cart__product-row"]}>
                            <div className={css["cart__product-image-wrapper"]}>
                              <img
                                className={css["cart__product-image"]}
                                src={item.product_image}
                                alt={item.product_name}
                              />
                            </div>
                            <div className={css["cart__product-column-wrapper"]}>
                              <div className={css["cart__product-column"]}>
                                <div className={css["cart__product-title"]}>
                                  {item.product_name}
                                </div>
                              </div>
                              <div className={css["cart__product-column__row"]}>
                                <div className={css["cart__product-price"]}>
                                  <span>
                                    {item.product_stock_status !== PRODUCT_STOCK_STATUS.OUT_OF_STOCK
                                      ? `${item.quantity > 1 ? `${item.quantity} x` : ""} ${item.product_price} ₴`
                                      : "- ₴"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={css["checkout__cart-total-info"]}>
                    <div className={css["checkout__cart-total-info-row"]}>
                      <div className={css["checkout__cart-total-info-column-left"]}>
                        {totalQuantity > 1 ?
                          `${totalQuantity} товарів`
                          : `${totalQuantity} товар`} на суму
                      </div>
                      <div className={css["checkout__cart-total-info-column-right"]}>
                        {totalPrice} ₴
                      </div>
                    </div>
                    <div className={css["checkout__cart-total-info-row"]}>
                      <div className={css["checkout__cart-total-info-column-left"]}>
                        Об'ємна вага
                      </div>
                      <div className={css["checkout__cart-total-info-column-right"]}>
                        {totalWeight.toFixed(2)} кг
                      </div>
                    </div>
                    <div className={css["checkout__cart-total-info-row"]}>
                      <div className={css["checkout__cart-total-info-column-left"]}>
                        Вартість доставки
                      </div>
                      <div className={css["checkout__cart-total-info-column-right"]}>
                        {selectedWarehouseType
                          ? `від ${selectedWarehouseType.min_delivery_price} ₴`
                          : "Безкоштовно"}
                      </div>
                    </div>
                    <div className={css["checkout__cart-total-info-row"]}>
                      <div className={css["checkout__cart-total-info-column-left"]}>
                        Сума до оплати без доставки
                      </div>
                      <div className={css["checkout__cart-total-info-column-right"]}>
                        <div className={css["checkout__cart-total-amount"]}>
                          {totalPrice} <span>₴</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || outOfStockItems.length > 0}
                    className={`${css["checkout__content-button"]} ${css["full"]}`}
                  >
                    Підтвердити замовлення
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
