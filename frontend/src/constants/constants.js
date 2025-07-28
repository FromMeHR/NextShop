export const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export const PASSWORD_PATTERN = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,128}$/;
export const ALLOWED_NAME_SURNAME_SYMBOLS_PATTERN = /^\s*[a-zA-Zа-щюяьА-ЩЮЯЬїЇіІєЄґҐ]+(?:'[a-zA-Zа-щюяьА-ЩЮЯЬїЇіІєЄґҐ]+)?(?:[- ]+[a-zA-Zа-щюяьА-ЩЮЯЬїЇіІєЄґҐ]+(?:'[a-zA-Zа-щюяьА-ЩЮЯЬїЇіІєЄґҐ]+)?)*\s*$/;

export const SCREEN_WIDTH = {
  tablet: 768,
  smallDesktop: 1200,
  desktop: 1512,
};
export const PAGE_SIZE = {
  mobile: 10,
  tablet: 12,
  smallDesktop: 14,
  desktop: 16,
};
export const DEFAULT_PAGE_SIZE = 16;

export const PAYMENT_NAME = {
  EASYPAY: "easypay",
  PLATA_BY_MONO: "plata_by_mono",
};
export const PAYMENT_NAME_LABELS = {
  [PAYMENT_NAME.EASYPAY]: "EasyPay",
  [PAYMENT_NAME.PLATA_BY_MONO]: "plata by mono",
}
export const PAYMENT_STATUS = {
  CREATED: "created",
  PROCESSING: "processing",
  HOLD: "hold",
  SUCCESS: "success",
  FAILURE: "failure",
  REVERSED: "reversed",
  EXPIRED: "expired",
};
export const PAYMENT_METHOD = {
  PAN: "pan",
  APPLE: "apple",
  GOOGLE: "google",
  MONOBANK: "monobank",
  WALLET: "wallet",
  DIRECT: "direct",
};
export const PAYMENT_SYSTEM = {
  VISA: "visa",
  MASTERCARD: "mastercard",
};
export const ORDER_STATUS = {
  AWAITING_PAYMENT: "awaiting_payment",
  PAYMENT_CONFIRMED: "payment_confirmed",
  PAYMENT_DECLINED: "payment_declined",
  PREPARING: "preparing",
  SENT: "sent",
  DELIVERED: "delivered",
  RECEIVED: "received",
  RETURNED: "returned",
  DECLINED: "declined",
};