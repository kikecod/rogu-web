// Generic formatters used across the application
import { generatePlaceholderImage as generatePlaceholderImageFromHelpers } from './helpers';

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const formatDate = (value: string | Date | null | undefined): string => {
  if (!value) return 'No registrado';
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'No registrado';
    }
    return new Intl.DateTimeFormat('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return 'No registrado';
  }
};

export const formatDateTime = (value: string | Date | null | undefined): string => {
  if (!value) return 'No registrado';
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'No registrado';
    }
    return new Intl.DateTimeFormat('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return 'No registrado';
  }
};

export const generatePlaceholderImage = (width: number, height: number, text?: string): string => {
  return generatePlaceholderImageFromHelpers(width, height, text);
};

export const generateAvatarUrl = (name: string): string => {
  return generatePlaceholderImageFromHelpers(100, 100, name.charAt(0).toUpperCase());
};
