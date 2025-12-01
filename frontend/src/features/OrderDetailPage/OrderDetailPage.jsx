"use client";

import { useEffect, useState } from "react";
import { Loader } from "../../components/Loader/Loader";
import { ErrorPage404 } from "../ErrorPage/ErrorPage404";
import {
  ORDER_STATUS,
  PAYMENT_NAME_LABELS,
  PAYMENT_STATUS,
} from "../../constants/constants";
import useSWR from "swr";
import axios from "axios";
import css from "./OrderDetailPage.module.css";

export function OrderDetailPage({ orderCode }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const fetchOrder = async (url) => {
    const resp = await axios.get(url);
    return resp.data;
  };

  const {
    data: order,
    error,
    isLoading,
  } = useSWR(
    `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/order/${orderCode}/`,
    fetchOrder
  );

  const totalPrice = order?.items.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0
  );
  const totalQuantity = order?.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  useEffect(() => {
    const forwardUrl = localStorage.getItem("forwardUrl");
    if (forwardUrl) {
      localStorage.removeItem("forwardUrl");
      window.location.href = forwardUrl;
    }
  }, []);

  useEffect(() => {
    if (
      order &&
      order.payment.expires_at &&
      order.status === ORDER_STATUS.AWAITING_PAYMENT
    ) {
      const expiresAt = new Date(order.payment.expires_at).getTime();
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = Math.max(0, expiresAt - now);
        if (diff === 0) {
          clearInterval(interval);
          setTimeLeft(null);
        } else {
          const minutes = Math.floor(diff / 1000 / 60);
          const seconds = Math.floor((diff / 1000) % 60);
          setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
        }
      });
      return () => clearInterval(interval);
    }
  }, [order]);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.id.toString()).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return error ? (
    <ErrorPage404 />
  ) : (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className={css["order-detail__main"]}>
          <div className={css["order-detail__content"]}>
            <div className={css["order-detail__row"]}>
              <div className={css["order-detail__left"]}>
                <div className={css["order-detail__block"]}>
                  <div className={css["order-detail__robot-card"]}>
                    <img
                      src={`${process.env.NEXT_PUBLIC_URL}/img/robot-watching-right.png`}
                      alt="Robot watching right"
                    />
                    <div className={css["order-detail__robot-card-content"]}>
                      <p className={css["order-detail__robot-card-title"]}>
                        Ваше замовлення успішно оформлене!
                      </p>
                      <p className={css["order-detail__robot-card-subtitle"]}>
                        Номер замовлення:
                        <span className={css["order-number"]}>{order.id}</span>
                        <img
                          src={`${process.env.NEXT_PUBLIC_URL}/svg/copy.svg`}
                          alt="Copy icon"
                          className={isCopied ? css["copied"] : ""}
                          onClick={handleCopyOrderNumber}
                        />
                      </p>
                    </div>
                  </div>
                  <div className={css["order-detail__order-info-box"]}>
                    <div className={css["order-detail__row-order-info"]}>
                      <p className={css["order-detail__row-order-info--title"]}>
                        Отримувач:
                      </p>
                      <p className={css["order-detail__row-order-info--desc"]}>
                        {order.delivery_user_name} {order.delivery_user_surname}
                      </p>
                    </div>
                    <div className={css["order-detail__row-order-info--hr"]} />
                    <div className={css["order-detail__row-order-info"]}>
                      <p className={css["order-detail__row-order-info--title"]}>
                        Телефон:
                      </p>
                      <p className={css["order-detail__row-order-info--desc"]}>
                        {order.delivery_user_phone}
                      </p>
                    </div>
                    <div className={css["order-detail__row-order-info--hr"]} />
                    <div className={css["order-detail__row-order-info"]}>
                      <p className={css["order-detail__row-order-info--title"]}>
                        Email:
                      </p>
                      <p className={css["order-detail__row-order-info--desc"]}>
                        {order.delivery_user_email}
                      </p>
                    </div>
                    <div className={css["order-detail__row-order-info--hr"]} />
                    <div className={css["order-detail__row-order-info"]}>
                      <p className={css["order-detail__row-order-info--title"]}>
                        Доставка:
                      </p>
                      <p className={css["order-detail__row-order-info--desc"]}>
                        {order.delivery_warehouse_type && (
                          <>
                            <img
                              src={order.delivery_warehouse_type.image}
                              alt="Delivery warehouse type icon"
                              className={css["order-detail__delivery-warehouse-type-image"]}
                            />
                            {order.delivery_warehouse_type.name} <br />
                          </>
                        )}
                        {order.delivery_warehouse}
                        {order.delivery_street &&
                          `${order.delivery_street}, ${order.delivery_house}, ${order.delivery_apartment}`}
                      </p>
                    </div>
                    <div className={css["order-detail__row-order-info--hr"]} />
                    <div className={css["order-detail__row-order-info"]}>
                      <p className={css["order-detail__row-order-info--title"]}>
                        Оплата:
                      </p>
                      <p className={css["order-detail__row-order-info--desc"]}>
                        {PAYMENT_NAME_LABELS[order.payment.name]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={css["order-detail__right"]}>
                <div className={css["order-detail__block"]}>
                  <div className={css["order-detail__summary-header"]}>
                    <div className={css["order-detail__summary-title"]}>
                      Моє замовлення
                    </div>
                  </div>
                  <div className={css["cart-wrapper"]}>
                    <div className={css["cart-custom-scroll"]}>
                      {order.items.map((item) => (
                        <div key={item.id} className={css["cart__product"]}>
                          <div className={css["cart__product-row"]}>
                            <div className={css["cart__product-image-wrapper"]}>
                              <img
                                className={css["cart__product-image"]}
                                src={item.product_image}
                                alt={item.product_name}
                              />
                            </div>
                            <div className={css["cart__product-col-wrapper"]}>
                              <div className={css["cart__product-col-info"]}>
                                <div className={css["cart__product-title"]}>
                                  {item.product_name}
                                </div>
                              </div>
                              <div className={css["cart__product-col-price"]}>
                                <div className={css["cart__product-price-wnum"]}>
                                  <span>{item.quantity} x </span>
                                  {item.product_price}
                                  <span> ₴</span>
                                </div>
                                <div className={css["cart__product-price-total"]}>
                                  <span>
                                    {item.product_price * item.quantity} ₴
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={css["order-detail__cart-total-info"]}>
                    <div className={css["order-detail__cart-total-info-row"]}>
                      <div className={css["order-detail__cart-total-info-column-left"]}>
                        {totalQuantity > 1
                          ? `${totalQuantity} товарів`
                          : `${totalQuantity} товар`} на суму
                      </div>
                      <div className={css["order-detail__cart-total-info-column-right"]}>
                        {totalPrice} ₴
                      </div>
                    </div>
                    <div className={css["order-detail__cart-total-info-row"]}>
                      <div className={css["order-detail__cart-total-info-column-left"]}>
                        Вартість доставки:
                      </div>
                      <div className={css["order-detail__cart-total-info-column-right"]}>
                        від {order.delivery_warehouse_type.min_delivery_price} ₴
                      </div>
                    </div>
                    <div className={css["order-detail__cart-total-info-row"]}>
                      <div className={css["order-detail__cart-total-info-column-left"]}>
                        Сума до оплати без доставки:
                      </div>
                      <div className={css["order-detail__cart-total-info-column-right"]}>
                        <div className={css["corder-detail__cart-total-amount"]}>
                          {totalPrice} ₴
                        </div>
                      </div>
                    </div>
                    {timeLeft &&
                      order.payment.status !== PAYMENT_STATUS.SUCCESS && (
                      <>
                        <div className={css["order-detail__cart-total-info-row"]}>
                          <div className={css["order-detail__cart-total-info-column-left"]}>
                            Очікується оплата:
                          </div>
                          <div className={css["order-detail__cart-total-info-column-right"]}>
                            {timeLeft}
                          </div>
                        </div>
                        <div className={css["order-detail__btn-wrapper"]}>
                          <button
                            onClick={() => {
                              window.location.href = order.payment.forward_url;
                            }}
                            className={css["order-detail__btn-pay"]}
                          >
                            ОПЛАТИТИ
                          </button>
                        </div>
                      </>
                    )}
                    {order.payment.status === PAYMENT_STATUS.SUCCESS ? (
                      <div className={`${css["order-detail__payment-status"]} ${css["paid"]}`}>
                        Cплачено
                      </div>
                    ) : (
                      !timeLeft &&
                      <div className={`${css["order-detail__payment-status"]} ${css["cancelled"]}`}>
                        Скасовано
                      </div>
                    )}
                  </div>
                  <a href="/">
                    <div className={css["order-detail__btn-wrapper"]}>
                      <button className={css["order-detail__btn-back"]}>
                        Перейти на головну
                      </button>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
