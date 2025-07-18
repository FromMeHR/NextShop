import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useModal } from "../../hooks/useModal";
import ReactDOM from "react-dom";
import css from "./CartModal.module.css";

export function CartModal({ show, handleClose }) {
  const {
    cart,
    outOfStockItems,
    inStockItems,
    totalPrice,
    updateCartItem,
    deleteCartItem,
    totalQuantity,
  } = useCart();
  const { setOverlayVisible } = useModal();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(show);
    setOverlayVisible(show);
  }, [show, setOverlayVisible]);

  if (cart.length === 0) {
    return null;
  }

  return ReactDOM.createPortal(
    <div
      className={`${css["side-modal"]} ${isVisible ? css["show"] : ""}`}
      onClick={handleClose}
    >
      <div className={css["modal-dialog"]}>
        <div
          className={css["modal-content"]}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={css["modal-header"]}>
            <div className={css["modal-title"]}>
              Кошик
              <span className={css["cart-products-count"]}>
                {totalQuantity > 1
                  ? `${totalQuantity} товарів`
                  : `${totalQuantity} товар`}
              </span>
              <img
                src={`${process.env.REACT_APP_PUBLIC_URL}/svg/delete.svg`}
                className={css["modal-close-button"]}
                alt="Close"
                onClick={handleClose}
              />
            </div>
          </div>
          <div className={css["modal-body"]}>
            <div className={css["cart-wrapper"]}>
              <div className={css["cart-custom-scroll"]}>
                {outOfStockItems.length > 0 && (
                  <div className={css["cart-page__msg-attention"]}>
                    <img
                      src={`${process.env.REACT_APP_PUBLIC_URL}/svg/warning.svg`}
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
                  <div key={item.id} className={css["cart-page__product"]}>
                    <div className={css["cart-page__product-row"]}>
                      <div className={css["cart-page__product-image-wrapper"]}>
                        <img
                          className={css["cart-page__product-image"]}
                          src={`${process.env.REACT_APP_BASE_API_URL}${item.product_image}`}
                          alt={item.product_name}
                        />
                      </div>
                      <div className={css["cart-page__product-column-wrapper"]}>
                        <div className={css["cart-page__product-column"]}>
                          <a
                            href={`/product-detail/${item.product_slug}`}
                            className={css["cart-page__product-title"]}
                          >
                            {item.product_name}
                          </a>
                        </div>
                        <div className={css["cart-page__product-column__row"]}>
                          <div className={css["product-counter"]}>
                            <img
                              src={`${process.env.REACT_APP_PUBLIC_URL}/svg/minus.svg`}
                              className={css["product-counter__btn_subtract"]}
                              alt="Minus"
                              onClick={() => {
                                updateCartItem(
                                  item.id,
                                  Math.max(item.quantity - 1, 1),
                                  item.quantity
                                );
                              }}
                            />
                            <input
                              className={css["product-counter__input"]}
                              type="text"
                              readOnly
                              value={item.quantity}
                            />
                            <img
                              src={`${process.env.REACT_APP_PUBLIC_URL}/svg/plus.svg`}
                              className={css["product-counter__btn_add"]}
                              alt="Plus"
                              onClick={() => {
                                updateCartItem(item.id, item.quantity + 1);
                              }}
                            />
                          </div>
                          <div className={css["cart-page__product-price"]}>
                            <span>
                              {item.product_quantity > 0
                                ? `${item.product_price * item.quantity} ₴`
                                : "- ₴"}
                            </span>
                          </div>
                          <img
                            src={`${process.env.REACT_APP_PUBLIC_URL}/svg/delete.svg`}
                            className={css["cart-page__product-btn_delete"]}
                            alt="Delete"
                            onClick={() => deleteCartItem(item.id)}
                          />
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
                    {totalPrice > 0 ? `${totalPrice} ₴` : "- ₴"}
                  </span>
                </div>
              </div>
              {inStockItems.length > 0 && (
                <div className={css["cart-total__column"]}>
                  <Link to="/order" onClick={handleClose}>
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
