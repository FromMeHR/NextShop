export function formatPrice(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return value;

  return num
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1")
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
