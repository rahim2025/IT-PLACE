// Caps the displayed stock count so customers see "100+" instead of an
// exact large number once quantity exceeds 99.
export function formatStockCount(stock) {
  return stock > 99 ? "100+" : stock;
}
