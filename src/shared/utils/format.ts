export const formatPrice = (price: number, currency: string = 'BOB'): string => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatRating = (rating: number, fractionDigits = 1): string => {
  return rating.toFixed(fractionDigits);
};
