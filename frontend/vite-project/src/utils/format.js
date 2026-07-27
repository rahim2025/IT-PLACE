export function formatPrice(value) {
  return `SAR ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
