type Props = {
  rating?: number;
  reviewCount?: number;
  showValue?: boolean;
  compact?: boolean;
};

export function StarRating({ rating = 0, reviewCount, showValue = false, compact = false }: Props) {
  const label = `Rated ${rating} out of 5${reviewCount ? ` from ${reviewCount} reviews` : ""}`;
  return (
    <div className={`star-rating ${compact ? "star-rating--compact" : ""}`} aria-label={label}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`star-rating__star ${rating >= i ? "is-full" : "is-empty"}`} aria-hidden="true">
          ★
        </span>
      ))}
      {showValue && <span className="star-rating__value">{Number(rating).toFixed(1)}</span>}
      {reviewCount !== undefined && reviewCount !== null && (
        <span className="star-rating__count">({reviewCount})</span>
      )}
    </div>
  );
}
