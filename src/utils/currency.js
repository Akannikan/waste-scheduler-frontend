export function formatNaira(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function moneyValue(value) {
  return Number(value || 0);
}
