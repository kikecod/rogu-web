// Common types used across the application
export type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type ID = string | number;

export type Timestamp = string | Date;

export type SportType = 'football' | 'basketball' | 'tennis' | 'volleyball' | 'paddle' | 'hockey';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export type AppRole = 'CLIENTE' | 'DUENIO' | 'CONTROLADOR' | 'ADMIN';
