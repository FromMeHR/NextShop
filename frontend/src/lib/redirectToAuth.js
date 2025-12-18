export function redirectToAuth() {
  const url = new URL(window.location.origin);
  url.searchParams.set("showAuthModal", "1");
  window.location.replace(url.toString());
}
