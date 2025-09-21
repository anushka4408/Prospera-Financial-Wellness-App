// Convert rupees to paise when saving
export function convertToCents(amount: number) {
  return Math.round(amount * 100);
}

// Convert paise to rupees when retrieving
//convertFromCents
export function convertToDollarUnit(amount: number) {
  return amount / 100;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}
