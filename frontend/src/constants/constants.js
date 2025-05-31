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
