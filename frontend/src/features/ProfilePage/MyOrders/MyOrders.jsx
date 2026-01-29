"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchWithAuth } from "../../../lib/fetchWithAuth";
import { Loader } from "../../../components/Loader/Loader";
import { formatPrice } from "../../../utils/formatPrice";
import {
  PAYMENT_NAME_LABELS,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_CLASSES,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_CLASSES,
} from "../../../constants/constants";
import Link from "next/link";
import useSWR from "swr";
import css from "./MyOrders.module.css";

export function MyOrders() {
  const [openedSections, setOpenedSections] = useState(new Set());
  const [now, setNow] = useState(Date.now());

  const { data : orders, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/orders/`,
    fetchWithAuth
  );

  const handleToggleSection = (orderId) => {
    setOpenedSections((prev) => {
      const next = new Set(prev);
      next.has(orderId) ? next.delete(orderId) : next.add(orderId);
      return next;
    });
  };

  useEffect(() => {
    if (!orders || orders.length === 0) return;
    const hasAwaitingPayment = orders.some((order) => {
      if (
        order.status !== ORDER_STATUS.AWAITING_PAYMENT ||
        !order.payment?.expires_at
      ) {
        return false;
      }
      return true;
    });
    if (!hasAwaitingPayment) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [orders]);

  const timeLeftByOrderId = useMemo(() => {
    if (!orders || orders.length === 0) return {};
    const result = {};
    for (const order of orders) {
      if (
        order.status !== ORDER_STATUS.AWAITING_PAYMENT ||
        !order.payment?.expires_at
      ) {
        result[order.id] = null;
        continue;
      }

      const expiresAt = new Date(order.payment.expires_at).getTime();
      const diff = Math.max(0, expiresAt - now);
      if (diff === 0) {
        result[order.id] = null;
        continue;
      }

      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);
      result[order.id] = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
    return result;
  }, [orders, now]);

  const canPayOrder = (order, timeLeft) =>
    order.status === ORDER_STATUS.AWAITING_PAYMENT &&
    order.payment.status === PAYMENT_STATUS.CREATED &&
    timeLeft;

  return (
    <>
      <div className={css["orders__header"]}>Мої замовлення</div>
      {!error ? (
        isLoading ? (
          <Loader />
        ) : (
          <div className={css["orders__block"]}>
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <div key={order.id} className={css["order-item"]}>
                  <div
                    className={`${css["orders__section"]} ${
                      openedSections.has(order.id) ? css["open"] : ""
                    }`}
                  >
                    <div
                      className={css["orders__section--header"]}
                      onClick={() => handleToggleSection(order.id)}
                    >
                      <div
                        className={css["order-item__delivery-status-wrapper"]}
                      >
                        <div
                          className={css["order-item__delivery-status--row"]}
                        >
                          <div
                            className={`${css["order-item__delivery-status"]} ${
                              css[ORDER_STATUS_CLASSES[order.status]]
                            }`}
                          >
                            {ORDER_STATUS_LABELS[order.status]}
                          </div>
                          <div
                            className={css["order-item__delivery-created-at"]}
                          >
                            {new Intl.DateTimeFormat("uk-UA", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }).format(new Date(order.created_at))}
                          </div>
                        </div>
                        <div className={css["order-item__number"]}>
                          №{order.id}
                        </div>
                      </div>
                      {order.status !== ORDER_STATUS.AWAITING_PAYMENT && (
                        <div className={css["order-item__delivery_warehouse"]}>
                          <div className={css["order-item__delivery_warehouse_type"]}>
                            {order.delivery_warehouse_type.name}
                          </div>
                          <div className={css["order-item__delivery_warehouse_name"]}>
                            {order.delivery_warehouse}
                            {order.delivery_street &&
                              `${order.delivery_street}, ${order.delivery_house}, ${order.delivery_apartment}`}
                          </div>
                        </div>
                      )}
                      {![
                        ORDER_STATUS.AWAITING_PAYMENT,
                        ORDER_STATUS.PAYMENT_DECLINED,
                        ORDER_STATUS.DECLINED,
                      ].includes(order.status) && (
                        <div className={css["order-item__payment-status-wrapper"]}>
                          <div
                            className={`${css["order-item__payment-status"]} ${
                              css[PAYMENT_STATUS_CLASSES[order.payment.status]]
                            }`}
                          >
                            {PAYMENT_STATUS_LABELS[order.payment.status]}
                          </div>
                        </div>
                      )}
                      {order.status === ORDER_STATUS.AWAITING_PAYMENT &&
                        !timeLeftByOrderId[order.id] && (
                        <div className={css["order-item__payment-temp-status-wrapper"]}>
                          <div
                            className={`${css["order-item__payment-status"]} ${css["grey"]}`}
                          >
                            {PAYMENT_STATUS_LABELS[PAYMENT_STATUS.EXPIRED]}
                          </div>
                        </div>
                      )}
                      {canPayOrder(order, timeLeftByOrderId[order.id]) && (
                        <div className={css["order-item__btn-pay-wrapper"]}>
                          <button
                            className={css["order-item__btn-pay"]}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = order.payment.forward_url;
                            }}
                          >
                            ОПЛАТИТИ ({timeLeftByOrderId[order.id]})
                          </button>
                        </div>
                      )}
                      <div className={css["order-item__products-quantity"]}>
                        {order.total_quantity > 1
                          ? order.total_quantity < 5
                            ? `${order.total_quantity} товари`
                            : `${order.total_quantity} товарів`
                          : `${order.total_quantity} товар`}
                      </div>
                      <button className={css["order-item__btn-toggle"]}>
                        <img
                          src={`${process.env.NEXT_PUBLIC_URL}/svg/up.svg`}
                          alt="Toggle"
                        />
                      </button>
                    </div>
                    <div className={css["orders__section--content-wrapper"]}>
                      <div className={css["orders__section--content"]}>
                        <div className={css["orders__section--content-body"]}>
                          <div className={css["order-details__left"]}>
                            {([
                              ORDER_STATUS.SENT,
                              ORDER_STATUS.RECEIVED,
                            ].includes(order.status) && order.sent_at) && (
                              <div className={css["order-details__item"]}>
                                <div className={css["order-details__item-label"]}>
                                  Дата відправлення
                                </div>
                                <div className={css["order-details__item-value"]}>
                                  {new Intl.DateTimeFormat("uk-UA", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }).format(new Date(order.sent_at))}
                                </div>
                              </div>
                            )}
                            <div className={css["order-details__item"]}>
                              <div className={css["order-details__item-label"]}>
                                Доставка
                              </div>
                              <div className={css["order-details__item-value"]}>
                                {order.delivery_warehouse_type.image && (
                                  <img
                                    src={order.delivery_warehouse_type.image}
                                    alt="Delivery warehouse type icon"
                                    className={css["order-details__item-delivery-warehouse-type-image"]}
                                  />
                                )}
                                {order.delivery_warehouse_type.name}
                              </div>
                            </div>
                            <div className={css["order-details__item"]}>
                              <div className={css["order-details__item-label"]}>
                                Адреса доставки
                              </div>
                              <div className={css["order-details__item-value"]}>
                                {order.delivery_warehouse}
                                {order.delivery_street &&
                                  `${order.delivery_street}, ${order.delivery_house}, ${order.delivery_apartment}`}
                              </div>
                            </div>
                            <div className={css["order-details__item"]}>
                              <div className={css["order-details__item-label"]}>
                                Оплата
                              </div>
                              <div className={css["order-details__item-value"]}>
                                {PAYMENT_NAME_LABELS[order.payment.name]}
                              </div>
                            </div>
                            <div className={css["order-details__item"]}>
                              <div className={css["order-details__item-label"]}>
                                Отримувач
                              </div>
                              <div className={css["order-details__item-value"]}>
                                {order.delivery_user_name} {order.delivery_user_surname}
                              </div>
                            </div>
                            <div className={css["order-details__item"]}>
                              <div className={css["order-details__item-label"]}>
                                Телефон
                              </div>
                              <div className={css["order-details__item-value"]}>
                                {order.delivery_user_phone}
                              </div>
                            </div>
                            <div className={css["order-details__item"]}>
                              <div className={css["order-details__item-label"]}>
                                Email
                              </div>
                              <div className={css["order-details__item-value"]}>
                                {order.delivery_user_email}
                              </div>
                            </div>
                          </div>
                          <div className={css["order-details__right"]}>
                            <div className={css["order-details__cart-product-list"]}>
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
                                        <Link
                                          href={`/product-detail/${item.product_slug}`}
                                          className={css["cart__product-title"]}
                                        >
                                          {item.product_name}
                                        </Link>
                                        <div className={css["cart__product-code"]}>
                                          Код: <span>{item.product_code}</span>
                                        </div>
                                      </div>
                                      <div className={css["cart__product-col-price"]}>
                                        <div className={css["cart__product-price-wnum"]}>
                                          <span>{item.product_quantity} x </span>
                                          {formatPrice(item.product_price)}
                                          <span> ₴</span>
                                        </div>
                                        <div className={css["cart__product-price-total"]}>
                                          <span>
                                            {formatPrice(item.product_price * item.product_quantity)} ₴
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className={css["order-details__total-info"]}>
                              <div className={css["order-details__total-info-item"]}>
                                <div className={css["order-details__total-info-item-label"]}>
                                  Вартість доставки
                                </div>
                                <div className={css["order-details__total-info-item-value"]}>
                                  від {order.delivery_warehouse_type.min_delivery_price} ₴
                                </div>
                              </div>
                              <div className={css["order-details__total-info-item"]}>
                                <div className={css["order-details__total-info-item-label"]}>
                                  Сума до оплати без доставки
                                </div>
                                <div className={`${css["order-details__total-info-item-value"]} ${css["total"]}`}>
                                  {formatPrice(order.total_price)} ₴
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className={css["orders__empty"]}>
                Ви ще не зробили жодного замовлення
              </p>
            )}
          </div>
        )
      ) : (
        <p className={css["orders__error"]}>
          Сталася помилка при завантаженні замовлень
        </p>
      )}
    </>
  );
}
