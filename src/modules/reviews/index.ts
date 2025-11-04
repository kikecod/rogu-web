// Reviews Module - Index
// Exportar todos los componentes, hooks, servicios y tipos

// Components
export { default as StarRating } from './components/StarRating';
export { default as CreateReviewModal } from './components/CreateReviewModal';
export { default as EditReviewModal } from './components/EditReviewModal';
export { default as ReviewCard } from './components/ReviewCard';
export { default as ReviewList } from './components/ReviewList';
export { default as RatingDistribution } from './components/RatingDistribution';

// Hooks
export { useReviews, default as useReviewsDefault } from './hooks/useReviews';
export { useCanReview, default as useCanReviewDefault } from './hooks/useCanReview';

// Services
export { reviewService } from './services/reviewService';

// Types
export type {
  Review,
  ReviewsResponse,
  CreateReviewData,
  UpdateReviewData,
  ValidateReviewResponse,
  PendingReview,
  ReviewSortOrder,
  ReviewFilters,
} from './types/review.types';
