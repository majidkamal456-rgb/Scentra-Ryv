"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  errorMessage,
  formatPrice,
  submitReview,
  type Product,
  type ProductReview,
  type RatingBreakdown,
} from "@/lib/api";
import { useCart } from "@/lib/cart";
import { useToast } from "@/lib/toast";
import { FadeSection } from "@/components/FadeSection";
import { ProductGallery } from "@/components/ProductGallery";
import { QtyStepper } from "@/components/QtyStepper";
import { RelatedSlider } from "@/components/RelatedSlider";
import { StarRating } from "@/components/StarRating";

function buildBreakdown(reviews: ProductReview[]): RatingBreakdown[] {
  const total = reviews.length;
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    const n = Math.min(5, Math.max(1, Math.round(r.rating)));
    counts[n] += 1;
  }
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: counts[stars],
    percent: total ? Math.round((counts[stars] / total) * 100) : 0,
  }));
}

/** Django `linebreaks` filter: blank lines → paragraphs, single newlines → <br>. */
function Linebreaks({ text }: { text: string }) {
  const paragraphs = (text || "").replace(/\r\n/g, "\n").split(/\n{2,}/).filter((p) => p.trim());
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i}>
          {p.split("\n").map((line, j, arr) => (
            <span key={j}>
              {line}
              {j < arr.length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}

export function ProductDetailClient({ product }: { product: Product }) {
  const { add } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const [size, setSize] = useState(product.size_ml);
  const [qty, setQty] = useState(1);

  const images = [
    ...(product.image_main ? [{ src: product.image_main, alt: product.name }] : []),
    ...(product.images?.map((i) => ({ src: i.image, alt: i.alt_text || product.name })) || []),
  ];

  const [reviews, setReviews] = useState<ProductReview[]>(product.reviews || []);
  const [avgRating, setAvgRating] = useState(product.average_rating || 0);
  const [reviewCount, setReviewCount] = useState(product.review_count || 0);
  const [rating, setRating] = useState(5);
  const [imageName, setImageName] = useState("");
  const [videoName, setVideoName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [reviewPage, setReviewPage] = useState(1);
  const REVIEWS_PER_PAGE = 5;

  const sortedReviews = useMemo(
    () => [...reviews].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)),
    [reviews],
  );

  const reviewTotalPages = Math.max(1, Math.ceil(sortedReviews.length / REVIEWS_PER_PAGE));
  const pagedReviews = useMemo(() => {
    const start = (reviewPage - 1) * REVIEWS_PER_PAGE;
    return sortedReviews.slice(start, start + REVIEWS_PER_PAGE);
  }, [sortedReviews, reviewPage]);

  useEffect(() => {
    if (reviewPage > reviewTotalPages) setReviewPage(reviewTotalPages);
  }, [reviewPage, reviewTotalPages]);

  const breakdown = useMemo(() => {
    if (reviews.length) return buildBreakdown(reviews);
    return product.rating_breakdown || buildBreakdown([]);
  }, [reviews, product.rating_breakdown]);

  function goReviewPage(p: number) {
    const next = Math.min(reviewTotalPages, Math.max(1, p));
    if (next === reviewPage) return;
    setReviewPage(next);
    requestAnimationFrame(() =>
      document.getElementById("top-reviews")?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox]);

  function onAddToCart(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!product.in_stock) return;
    add(product, qty, size);
    showToast(`${product.name} added to cart`);
  }

  async function onSubmitReview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("rating", String(rating));

    try {
      const result = await submitReview(product.slug, fd);
      const name = String(fd.get("name") || "Customer");
      const comment = String(fd.get("comment") || "");
      setReviews((prev) => [
        { id: Date.now(), name, rating, comment, image: null, video: null, created_at: new Date().toISOString() },
        ...prev,
      ]);
      setMessage(result.message);
      showToast(result.message);
      setAvgRating(result.average_rating);
      setReviewCount(result.review_count);
      setImageName("");
      setVideoName("");
      setRating(5);
      form.reset();
      setShowForm(false);
      router.refresh();
    } catch (err: unknown) {
      const msg = errorMessage(err, "Could not submit review.");
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  function toggleForm() {
    setShowForm((v) => {
      const next = !v;
      if (next) {
        requestAnimationFrame(() =>
          document.getElementById("write-review")?.scrollIntoView({ behavior: "smooth", block: "start" }),
        );
      }
      return next;
    });
  }

  return (
    <section className="page-shell">
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="flex items-start justify-center lg:justify-start">
          <div className="fade-section visible w-full max-w-[28rem]">
            <ProductGallery name={product.name} images={images} />
          </div>
        </div>

        <div className="fade-section visible lg:py-4">
          <p className="section-eyebrow">{product.gender}</p>
          <h1 className="mt-3 font-serif text-4xl text-brand-cream md:text-5xl">{product.name}</h1>
          <div className="mt-4">
            <StarRating rating={avgRating} reviewCount={reviewCount} showValue />
          </div>
          <p className="mt-4 text-base leading-relaxed text-brand-mute">{product.short_description}</p>
          <p className="mt-6 font-serif text-3xl text-gradient-gold">{formatPrice(product.price)}</p>

          <form onSubmit={onAddToCart} className="mt-10 space-y-7">
            <div>
              <label className="form-label">Size</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSize(product.size_ml)}
                  className={`border px-6 py-2.5 text-sm transition duration-300 ${
                    size === product.size_ml
                      ? "border-brand-gold bg-brand-gold/10 text-brand-gold"
                      : "border-brand-gold/30 text-brand-cream/60"
                  }`}
                >
                  {product.size_ml}
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">Quantity</label>
              <QtyStepper value={qty} max={Math.max(1, product.stock)} onChange={setQty} />
            </div>

            {product.in_stock ? (
              <button type="submit" className="btn-gold-filled w-full">Add to Cart</button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed border border-brand-cream/20 py-3.5 text-xs uppercase tracking-[0.22em] text-brand-cream/30"
              >
                Out of Stock
              </button>
            )}
          </form>

          <div className="mt-12 space-y-5 border-t border-brand-gold/10 pt-10">
            <h3 className="font-serif text-xl text-brand-gold">Scent Notes</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Top", product.top_notes],
                ["Heart", product.heart_notes],
                ["Base", product.base_notes],
              ].map(([label, notes]) => (
                <div key={label} className="surface p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-brand-gold">{label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-cream/70">{notes}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-4 text-sm leading-relaxed text-brand-mute">
            <Linebreaks text={product.description || ""} />
          </div>
        </div>
      </div>

      {/* —— Reviews —— */}
      <FadeSection id="reviews" className="mt-20 border-t border-brand-gold/10 pt-16 lg:mt-28 lg:pt-20">
        <div className="reviews-layout">
          <aside className="reviews-aside">
            <h2 className="font-serif text-xl text-brand-cream">Customer reviews</h2>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <StarRating rating={avgRating} compact />
              <span className="text-xs text-brand-cream/90">{Number(avgRating).toFixed(1)} out of 5</span>
            </div>
            <p className="mt-1 text-xs text-brand-mute">
              {reviewCount ? `${reviewCount} customer rating${reviewCount === 1 ? "" : "s"}` : "No ratings yet"}
            </p>

            <ul className="mt-4 space-y-1.5" aria-label="Rating breakdown">
              {breakdown.map((row) => (
                <li key={row.stars} className="rating-bar">
                  <span className="rating-bar__label">{row.stars} star</span>
                  <div className="rating-bar__track" role="presentation">
                    <div className="rating-bar__fill" style={{ width: `${row.percent}%` }} />
                  </div>
                  <span className="rating-bar__pct">{row.percent}%</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-brand-gold/15 pt-5">
              <h3 className="font-serif text-base text-brand-cream">Review this product</h3>
              <p className="mt-1 text-xs text-brand-mute">Share your thoughts with other customers</p>
              <button type="button" className="btn-gold mt-3 w-full px-4! py-2.5! text-[10px]" onClick={toggleForm}>
                {showForm ? "Hide review form" : "Write a customer review"}
              </button>
            </div>
          </aside>

          <div className="min-w-0" id="top-reviews">
            <div className="reviews-list">
            <h3 className="font-serif text-base text-brand-cream">Top reviews</h3>

            <div className="mt-3 space-y-3">
              {pagedReviews.map((review) => (
                <article key={review.id} className="review-item">
                  <div className="flex items-center gap-2">
                    <div className="review-avatar" aria-hidden="true">
                      {(review.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xs font-medium text-brand-cream">{review.name}</p>
                  </div>
                  <div className="mt-1.5">
                    <StarRating rating={review.rating} compact />
                  </div>
                  <p className="mt-1 text-[11px] text-brand-mute">
                    Reviewed in Pakistan on{" "}
                    {new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-brand-cream/80">{review.comment}</p>
                  {(review.image || review.video) && (
                    <div className="mt-2.5 flex flex-wrap items-start gap-2">
                      {review.image && (
                        <button
                          type="button"
                          className="review-media-thumb"
                          onClick={() => setLightbox(review.image)}
                          aria-label={`View photo by ${review.name}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={review.image} alt={`Review by ${review.name}`} loading="lazy" width={56} height={56} />
                        </button>
                      )}
                      {review.video && (
                        <video controls className="h-14 w-24 border border-brand-gold/20 bg-brand-ink object-cover" preload="metadata">
                          <source src={review.video} />
                        </video>
                      )}
                    </div>
                  )}
                </article>
              ))}
              {sortedReviews.length === 0 && (
                <div className="border border-dashed border-brand-gold/20 bg-brand-ink/30 px-4 py-8 text-center">
                  <p className="font-serif text-base text-brand-gold/80">No reviews yet</p>
                  <p className="mt-1 text-xs text-brand-mute">Be the first to share your experience with this fragrance.</p>
                </div>
              )}
            </div>

            {sortedReviews.length > REVIEWS_PER_PAGE && (
              <nav className="review-pagination" aria-label="Reviews pagination">
                <button
                  type="button"
                  className="review-pagination__btn"
                  disabled={reviewPage <= 1}
                  onClick={() => goReviewPage(reviewPage - 1)}
                  aria-label="Previous reviews page"
                >
                  Prev
                </button>
                {Array.from({ length: reviewTotalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`review-pagination__btn ${reviewPage === p ? "is-active" : ""}`}
                    onClick={() => goReviewPage(p)}
                    aria-current={reviewPage === p ? "page" : undefined}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  className="review-pagination__btn"
                  disabled={reviewPage >= reviewTotalPages}
                  onClick={() => goReviewPage(reviewPage + 1)}
                  aria-label="Next reviews page"
                >
                  Next
                </button>
                <p className="review-pagination__meta">
                  {reviewPage} / {reviewTotalPages}
                </p>
              </nav>
            )}
            </div>
          </div>
        </div>

        {lightbox && (
          <div
            className="review-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Review photo"
            onClick={(e) => {
              if (e.target === e.currentTarget) setLightbox(null);
            }}
          >
            <button type="button" className="review-lightbox__close" onClick={() => setLightbox(null)} aria-label="Close photo">
              &times;
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox} alt="Review photo" className="review-lightbox__img" />
          </div>
        )}

        {showForm && (
          <div id="write-review" className="review-panel mt-12 animate-fade-in">
            <div className="mb-8">
              <h3 className="font-serif text-2xl text-brand-gold sm:text-3xl">Write a Review</h3>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-brand-mute">
                Share your thoughts — add a photo or short video of your unboxing or scent moment.
              </p>
            </div>

            <form onSubmit={onSubmitReview} className="space-y-7" encType="multipart/form-data">
              <div>
                <label className="form-label">Your rating *</label>
                <div className="star-picker mt-2" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`star-picker__btn ${rating >= n ? "is-active" : ""}`}
                      onClick={() => setRating(n)}
                      aria-label={`${n} stars`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <input type="hidden" name="rating" value={rating} />
              </div>

              <div>
                <label className="form-label">Your Name *</label>
                <input name="name" required className="form-input" placeholder="Your name" />
              </div>

              <div>
                <label className="form-label">Your Review *</label>
                <textarea
                  name="comment"
                  required
                  rows={5}
                  className="form-input min-h-[8rem]"
                  placeholder="Share your experience with this fragrance…"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="form-label">Photo</label>
                  <label className={`upload-zone mt-2 ${imageName ? "has-file" : ""}`}>
                    <span className="upload-zone__icon">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <span className="text-sm text-brand-cream/80">{imageName || "Drop photo or browse"}</span>
                    <span className="text-[11px] text-brand-mute">JPG · PNG · WEBP · max 5MB</span>
                    <input
                      name="image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={(e) => setImageName(e.target.files?.[0]?.name || "")}
                    />
                  </label>
                </div>
                <div>
                  <label className="form-label">Video</label>
                  <label className={`upload-zone mt-2 ${videoName ? "has-file" : ""}`}>
                    <span className="upload-zone__icon">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <span className="text-sm text-brand-cream/80">{videoName || "Drop video or browse"}</span>
                    <span className="text-[11px] text-brand-mute">MP4 · WEBM · MOV · max 25MB</span>
                    <input
                      name="video"
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={(e) => setVideoName(e.target.files?.[0]?.name || "")}
                    />
                  </label>
                </div>
              </div>

              {message && <p className="text-sm text-brand-gold">{message}</p>}
              {error && <p className="text-sm text-red-300">{error}</p>}

              <div className="flex flex-col gap-3 border-t border-brand-gold/10 pt-7 sm:flex-row sm:items-center">
                <button type="submit" disabled={loading} className="btn-gold-filled w-full sm:w-auto">
                  {loading ? "Submitting…" : "Submit Review"}
                </button>
                <p className="text-xs text-brand-mute">Reviews help other customers choose their signature scent.</p>
              </div>
            </form>
          </div>
        )}
      </FadeSection>

      {/* —— Related —— */}
      {product.related && product.related.length > 0 && (
        <FadeSection className="mt-20 border-t border-brand-gold/10 pt-16 lg:mt-28 lg:pt-20">
          <p className="section-eyebrow text-center">More to Love</p>
          <h2 className="section-heading mt-3 text-center">You May Also Like</h2>
          <div className="gold-divider" />
          <RelatedSlider products={product.related} />
        </FadeSection>
      )}
    </section>
  );
}
