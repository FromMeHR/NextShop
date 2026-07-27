import { SHOW_AUTH_MODAL_COOKIE, IS_AUTH_COOKIE } from "../constants/constants";

export function redirectToAuth() {
  const url = new URL(window.location.origin);
  document.cookie = `${IS_AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${SHOW_AUTH_MODAL_COOKIE}=1; Path=/; SameSite=Lax`;
  window.location.replace(url.toString());
}
