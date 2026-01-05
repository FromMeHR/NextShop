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

export const PRODUCT_STOCK_STATUS = {
  OUT_OF_STOCK: "out_of_stock",
  FEW_ITEMS_LEFT: "few_items_left",
  LOW_STOCK: "low_stock",
  IN_STOCK: "in_stock",
};
export const PRODUCT_STOCK_STATUS_LABELS = {
  [PRODUCT_STOCK_STATUS.OUT_OF_STOCK]: "Немає в наявності",
  few_items_left: (qty) => `В наявності ${qty} шт`,
  [PRODUCT_STOCK_STATUS.LOW_STOCK]: "Закінчується",
  [PRODUCT_STOCK_STATUS.IN_STOCK]: "Є в наявності",
};

export const PAYMENT_NAME = {
  EASYPAY: "easypay",
  PLATA_BY_MONO: "plata_by_mono",
};
export const PAYMENT_NAME_LABELS = {
  [PAYMENT_NAME.EASYPAY]: "EasyPay",
  [PAYMENT_NAME.PLATA_BY_MONO]: "plata by mono",
};

export const PAYMENT_STATUS = {
  CREATED: "created",
  PROCESSING: "processing",
  HOLD: "hold",
  SUCCESS: "success",
  FAILURE: "failure",
  REVERSED: "reversed",
  EXPIRED: "expired",
};
export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.CREATED]: "Створено",
  [PAYMENT_STATUS.PROCESSING]: "Обробляється",
  [PAYMENT_STATUS.HOLD]: "Сума заблокована",
  [PAYMENT_STATUS.SUCCESS]: "Оплачено",
  [PAYMENT_STATUS.FAILURE]: "Помилка оплати",
  [PAYMENT_STATUS.REVERSED]: "Оплата повернена",
  [PAYMENT_STATUS.EXPIRED]: "Скасовано",
};
export const PAYMENT_STATUS_CLASSES = {
  [PAYMENT_STATUS.CREATED]: "orange",
  [PAYMENT_STATUS.PROCESSING]: "orange",
  [PAYMENT_STATUS.HOLD]: "grey",
  [PAYMENT_STATUS.FAILURE]: "grey",
  [PAYMENT_STATUS.REVERSED]: "grey",
  [PAYMENT_STATUS.EXPIRED]: "grey",
  [PAYMENT_STATUS.SUCCESS]: "green",
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
  PAYMENT_DECLINED: "payment_declined",
  PREPARING: "preparing",
  SENT: "sent",
  RECEIVED: "received",
  RETURNED: "returned",
  DECLINED: "declined",
};
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.AWAITING_PAYMENT]: "Очікується оплата",
  [ORDER_STATUS.PAYMENT_DECLINED]: "Скасовано",
  [ORDER_STATUS.PREPARING]: "Обробляється",
  [ORDER_STATUS.SENT]: "Відправлено",
  [ORDER_STATUS.RECEIVED]: "Отримано",
  [ORDER_STATUS.RETURNED]: "Повернено",
  [ORDER_STATUS.DECLINED]: "Скасовано",
};
export const ORDER_STATUS_CLASSES = {
  [ORDER_STATUS.AWAITING_PAYMENT]: "orange",
  [ORDER_STATUS.PREPARING]: "orange",
  [ORDER_STATUS.RETURNED]: "orange",
  [ORDER_STATUS.PAYMENT_DECLINED]: "grey",
  [ORDER_STATUS.DECLINED]: "grey",
  [ORDER_STATUS.SENT]: "green",
  [ORDER_STATUS.RECEIVED]: "green",
};