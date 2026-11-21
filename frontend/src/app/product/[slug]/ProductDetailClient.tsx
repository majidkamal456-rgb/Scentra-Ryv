"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  formatPrice,
  genderLabel,
  products,
  type Product,
} from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { fetchReviews, getReviewsForProduct, type Review } from "@/data/reviews";
import { fetchApiProductDetail } from "@/lib/api";
import { flyToCart } from "@/lib/flyToCart";
import { mediaUrl } from "@/lib/media";
import { useCart } from "@/store/cart";

export function ProductDetailClient({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const imgRef = useRef<HTMLDivElement>(null);
  const related = products.filter((p) => p.id !== product.id).slice(0, 3);
  const [gallery, setGallery] = useState<string[]>([product.image]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [productReviews, setProductReviews] = useState<Review[]>(() =>
    getReviewsForProduct(product.slug),
  );

  useEffect(() => {
    let cancelled = false;
    setActiveIdx(0);
    setGallery([product.image]);

    fetchApiProductDetail(product.slug)
      .then((detail) => {
        if (cancelled) return;
        const urls: string[] = [];
        const main = mediaUrl(detail.image_main);
        if (main) urls.push(main);
        for (const img of detail.images ?? []) {
          const u = mediaUrl(img.image);
          if (u && !urls.includes(u)) urls.push(u);
        }
        if (urls.length) setGallery(urls);

        if (detail.reviews?.length) {
          setProductReviews(
            detail.reviews.map((r) => ({
              id: String(r.id),
              productSlug: r.product_slug ?? product.slug,
              productName: r.product_name ?? product.name,
              name: r.name,
              city: "",
              rating: Number(r.rating) || 5,
              comment: r.comment,
              image: mediaUrl(r.image),
              video: mediaUrl(r.video),
            })),
          );
        }
      })
      .catch(() => {
        /* keep local image */
      });

    fetchReviews(product.slug).then((list) => {
      if (!cancelled && list.length) setProductReviews(list);
    });

    return () => {
      cancelled = true;
    };
  }, [product.slug, product.image, product.name]);

  const activeImage = gallery[activeIdx] ?? product.image;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-20 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <div
            ref={imgRef}
            className="relative aspect-[3/4] overflow-hidden bg-[var(--surface)]"
          >
            <Image
              src={activeImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              unoptimized={activeImage.startsWith("http")}
            />
          </div>

          {gallery.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden border transition sm:h-20 sm:w-20 ${
                    i === activeIdx
                      ? "border-[var(--gold)]"
                      : "border-[var(--border)] opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized={src.startsWith("http")}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-[11px] tracking-[0.28em] text-[var(--gold)] uppercase">
            {genderLabel(product.gender)} · {product.sizeMl}
          </p>
          <h1 className="font-serif mt-2 text-4xl md:text-6xl">{product.name}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Inspired by {product.inspiredBy}</p>
          <p className="font-serif mt-4 text-3xl text-[var(--gold)]">
            {formatPrice(product.price)}
          </p>
          <p className="mt-6 leading-relaxed text-[var(--muted)]">{product.description}</p>

          <div className="mt-8 space-y-4">
            <NoteRow label="Top" notes={product.topNotes} />
            <NoteRow label="Heart" notes={product.heartNotes} />
            <NoteRow label="Base" notes={product.baseNotes} />
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <div className="flex items-center border border-[var(--border)]">
              <button
                type="button"
                className="px-3 py-2"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="min-w-10 text-center">{qty}</span>
              <button
                type="button"
                className="px-3 py-2"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="btn-gold"
              onClick={() => {
                flyToCart(imgRef.current, activeImage);
                add(product, qty);
              }}
            >
              Add to cart
            </button>
          </div>
          <p className="mt-4 text-xs tracking-wider text-[var(--muted)] uppercase">
            Cash on Delivery · Nationwide shipping
          </p>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="font-serif text-3xl">Reviews</h2>
        {productReviews.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--muted)]">No reviews yet for this fragrance.</p>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {productReviews.map((r) => (
              <article key={r.id} className="border border-[var(--border)] bg-[var(--surface)] p-5">
                <p className="text-[var(--gold)]">{"★".repeat(r.rating)}</p>
                <p className="mt-3 text-sm text-[var(--muted)]">&ldquo;{r.comment}&rdquo;</p>
                {r.image ? (
                  <button
                    type="button"
                    className="relative mt-4 block aspect-[4/3] w-full overflow-hidden border border-[var(--border)]"
                    onClick={() => setLightbox(r.image!)}
                  >
                    <Image
                      src={r.image}
                      alt={`Review by ${r.name}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized
                    />
                  </button>
                ) : null}
                {r.video ? (
                  <video
                    src={r.video}
                    controls
                    className="mt-4 max-h-56 w-full border border-[var(--border)] object-cover"
                  />
                ) : null}
                <p className="font-serif mt-4">{r.name}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-20">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-serif text-3xl">You may also like</h2>
          <Link href="/shop" className="text-xs tracking-[0.16em] text-[var(--gold)] uppercase">
            Shop all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-8">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {lightbox ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Review photo"
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-2xl text-white/80 hover:text-white"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Review"
            className="max-h-[85vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}

function NoteRow({ label, notes }: { label: string; notes: string[] }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] text-[var(--gold)] uppercase">{label} notes</p>
      <p className="mt-1 text-sm text-[var(--fg)]">{notes.join(" · ")}</p>
    </div>
  );
}
