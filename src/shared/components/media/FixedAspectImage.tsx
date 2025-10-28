import React from 'react';

const joinClasses = (...values: Array<string | undefined | null | false>) =>
  values.filter(Boolean).join(' ');

interface FixedAspectImageProps {
  src: string;
  alt: string;
  /**
   * Width / height ratio. For example 1.5 = 3:2, 1.78 = 16:9.
   * Defaults to 16:9.
   */
  ratio?: number;
  className?: string;
  imageClassName?: string;
  fallback?: React.ReactNode;
}

/**
 * Ensures that images keep a consistent aspect ratio regardless of the original dimensions.
 * Prevents layouts where differently sized pictures break the design.
 */
const FixedAspectImage: React.FC<FixedAspectImageProps> = ({
  src,
  alt,
  ratio = 16 / 9,
  className,
  imageClassName,
  fallback,
}) => {
  const paddingTop = `${(1 / ratio) * 100}%`;
  const hasImage = typeof src === 'string' && src.trim().length > 0;

  if (!hasImage) {
    return (
      <div
        className={joinClasses(
          'relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100',
          className,
        )}
        style={{ paddingTop }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-500">
          {fallback ?? 'Sin imagen'}
        </div>
      </div>
    );
  }

  return (
    <div
      className={joinClasses(
        'relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100',
        className,
      )}
      style={{ paddingTop }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={joinClasses(
          'absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 hover:scale-[1.02]',
          imageClassName,
        )}
      />
    </div>
  );
};

export default FixedAspectImage;
