import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { debounce } from "lodash";
import { useCart } from "../../../hooks/useCart";
import { useBodyScrollLock } from "../../../hooks/useBodyScrollLock";
import { useModal } from "../../../hooks/useModal";
import { formatPrice } from "../../../utils/formatPrice";
import { PRODUCT_STOCK_STATUS } from "../../../constants/constants";
import ReactDOM from "react-dom";
import css from "./CartModal.module.css";

export function CartModal({ isActive, modalRef }) {
  const {
    cart,
    isLoading,
    outOfStockItems,
    inStockItems,
    totalPrice,
    updateCartItem,
    deleteCartItem,
    totalQuantity,
  } = useCart();
  const { lock, unlock } = useBodyScrollLock();
  const [quantities, setQuantities] = useState({});
  const debouncedMap = useRef(new Map());
  const updateQueue = useRef(Promise.resolve());

  const { closeModal } = useModal();

  useEffect(() => {
    if (!isLoading && cart.length === 0) {
      closeModal("cart");
    }
  }, [isLoading, cart, closeModal]);

  useEffect(() => {
    const newQuantities = {};
    cart.forEach((item) => {
      newQuantities[item.id] = item.quantity;
    });
    setQuantities(newQuantities);
  }, [cart]);

  const enqueueUpdate = useCallback((itemId, quantity, prevQuantity) => {
    updateQueue.current = updateQueue.current.then(() =>
      updateCartItem(itemId, quantity, prevQuantity)
    );
  }, [updateCartItem]);

  const handleQuantityChange = useCallback((itemId, newQuantity, prevQuantity) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: newQuantity,
    }));

    if (!debouncedMap.current.has(itemId)) {
      const debouncedFn = debounce((qty, prevQty) => {
        enqueueUpdate(itemId, qty, prevQty);
      }, 500);
      debouncedMap.current.set(itemId, debouncedFn);
    }

    debouncedMap.current.get(itemId)(newQuantity, prevQuantity);
  }, [enqueueUpdate]);

  useEffect(() => {
    const handleResize = () => {
      if (isActive && window.innerWidth <= 768)   {
        lock("cart");
      } else {
        unlock("cart");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isActive, lock, unlock]);

  useEffect(() => {
    if (isActive && window.innerWidth <= 768) {
      lock("cart");
    } else {
      unlock("cart");
    }
  }, [isActive, lock, unlock]);

  return ReactDOM.createPortal(
    <div className={`${css["side-modal"]} ${isActive ? css["show"] : ""}`}>
      <div ref={modalRef} className={css["modal-dialog"]}>
        <div className={css["modal-content"]}>
          <div className={css["modal-header"]}>
            <div className={css["modal-title"]}>
              Кошик
              <span className={css["cart-products-count"]}>
                {totalQuantity > 1
                  ? totalQuantity < 5
                    ? `${totalQuantity} товари`
                    : `${totalQuantity} товарів`
                  : `${totalQuantity} товар`}
              </span>
              <button
                type="button"
                className={css["modal-close-button"]}
                onClick={() => closeModal("cart")}
                aria-label="Закрити модальне вікно"
              ></button>
            </div>
          </div>
          <div className={css["modal-body"]}>
            <div className={css["cart-wrapper"]}>
              <div className={css["cart-custom-scroll"]}>
                {outOfStockItems.length > 0 && (
                  <div className={css["cart-page__msg-attention"]}>
                    <div className={css["warning-icon-wrapper"]}></div>
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
                  <div key={item.id} className={css["cart-page__product"]}>
                    <div className={css["cart-page__product-row"]}>
                      <div className={css["cart-page__product-image-wrapper"]}>
                        <img
                          className={css["cart-page__product-image"]}
                          src={item.product_image}
                          alt={item.product_name}
                        />
                      </div>
                      <div className={css["cart-page__product-column-wrapper"]}>
                        <div className={css["cart-page__product-column"]}>
                          <Link
                            href={`/product-detail/${item.product_slug}`}
                            className={css["cart-page__product-title"]}
                            onClick = {() => closeModal("cart")}
                            prefetch={false}
                          >
                            {item.product_name}
                          </Link>
                        </div>
                        <div className={css["cart-page__product-column__row"]}>
                          <div className={css["product-counter"]}>
                            <button
                              type="button"
                              className={css["product-counter__btn_subtract"]}
                              onClick={() => {
                                const newQty = Math.max((quantities[item.id] || item.quantity) - 1, 1);
                                handleQuantityChange(item.id, newQty, item.quantity);
                              }}
                            ></button>
                            <input
                              className={css["product-counter__input"]}
                              type="text"
                              readOnly
                              value={quantities[item.id] ?? item.quantity}
                              aria-label={`Кількість товару ${item.product_name}`}
                            />
                            <button
                              type="button"
                              className={css["product-counter__btn_add"]}
                              onClick={() => {
                                const newQty = (quantities[item.id] || item.quantity) + 1;
                                handleQuantityChange(item.id, newQty, item.quantity);
                              }}
                            ></button>
                          </div>
                          <div className={css["cart-page__product-price"]}>
                            <span>
                              {item.product_stock_status !== PRODUCT_STOCK_STATUS.OUT_OF_STOCK
                                ? `${formatPrice(item.product_price)} ₴`
                                : "- ₴"}
                            </span>
                          </div>
                          <button
                            type="button"
                            className={css["cart-page__product-btn_delete"]}
                            onClick={() => deleteCartItem(item.id)}
                          ></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={css["cart-total"]}>
              <div className={css["cart-total__column"]}>
                <div className={css["cart-total__row"]}>
                  <span className={css["cart-total__label"]}>Разом:</span>
                  <span className={css["cart-total__value"]}>
                    {totalPrice > 0 ? `${formatPrice(totalPrice)} ₴` : "- ₴"}
                  </span>
                </div>
              </div>
              {inStockItems.length > 0 && (
                <div className={css["cart-total__column"]}>
                  <Link
                    href="/order"
                    onClick={() => closeModal("cart")}
                    prefetch={false}
                  >
                    <button className={css["cart-total__btn"]}>
                      Оформити замовлення
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
