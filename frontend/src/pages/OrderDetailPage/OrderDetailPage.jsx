import { useState } from "react";
import { useParams } from "react-router-dom";
import { Loader } from "../../components/Loader/Loader";
import { ErrorPage404 } from "../ErrorPage/ErrorPage404";
import { PAYMENT_NAME_LABELS, PAYMENT_STATUS } from "../../constants/constants";
import useSWR from "swr";
import axios from "axios";
import css from "./OrderDetailPage.module.css";

export function OrderDetailPage() {
  const { orderCode } = useParams();
  const [order, setOrder] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const fetchOrder = async (url) => {
    const resp = await axios.get(url);
    return resp.data;
  };

  const { error, isLoading } = useSWR(
    `${process.env.REACT_APP_BASE_API_URL}/api/order/${orderCode}/`,
    fetchOrder,
    {
      onSuccess: (data) => {
        setOrder(data);
        if (data.payment.expires_at) {
          const expiresAt = new Date(data.payment.expires_at).getTime();
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
        } else {
          setTimeLeft(null);
        }
      },
    }
  );

  return error ? (
    <ErrorPage404 />
  ) : (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className={css["order-detail__main"]}>
          <div className={css["order-detail__content"]}>
            <div>Замовлення №{order.id}</div>
            <div>
              Доставка: {order.delivery_warehouse_type.name} <br />
              {order.delivery_warehouse}
              {order.delivery_street &&
                `${order.delivery_street}, ${order.delivery_house}, ${order.delivery_apartment}`}
            </div>
            {timeLeft && !(order.payment.status === PAYMENT_STATUS.SUCCESS) && (
              <div>Очікується оплата: {timeLeft}</div>
            )}
            <div>Оплата: {PAYMENT_NAME_LABELS[order.payment.name]}</div>
            {order.payment.status === PAYMENT_STATUS.SUCCESS ? (
              <div>Cплачено</div>
            ) : (
              (!timeLeft ||
                order.payment.status === PAYMENT_STATUS.EXPIRED) && (
                <div>Скасовано</div>
              )
            )}
            {timeLeft && !(order.payment.status === PAYMENT_STATUS.SUCCESS) && (
              <button
                onClick={() => {
                  window.location.href = order.payment.forward_url;
                }}
              >
                Оплатити
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
