"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";
import {
  formatPrice,
  scrollProducts,
  type Product,
} from "@/data/products";
import { flyToCart } from "@/lib/flyToCart";
import { useCart } from "@/store/cart";

const CHAPTERS = scrollProducts.length;
const TRACK_VH = 780;

function genderShort(g: Product["gender"]) {
  if (g === "men") return "Men";
  if (g === "women") return "Women";
  return "Unisex";
}

function useChapterProgress(scrollYProgress: MotionValue<number>, index: number) {
  const start = index / CHAPTERS;
  const mid = (index + 0.45) / CHAPTERS;
  const end = (index + 1) / CHAPTERS;
  return useTransform(scrollYProgress, [start, mid, end], [0, 1, 0]);
}

function BottleLayer({
  product,
  index,
  progress,
}: {
  product: Product;
  index: number;
  progress: MotionValue<number>;
}) {
  const side = index % 2 === 0 ? 1 : -1;
  const x = useTransform(progress, [0, 0.5, 1], [side * 80, 0, side * -100]);
  const rotate = useTransform(progress, [0, 0.5, 1], [side * -12, 0, side * 14]);
  const scale = useTransform(progress, [0, 0.5, 1], [0.78, 1, 0.82]);
  const opacity = useTransform(progress, [0, 0.15, 0.55, 0.9, 1], [0, 1, 1, 0.4, 0]);
  const glowOpacity = useTransform(progress, [0, 0.35, 0.7, 1], [0, 0.85, 0.65, 0]);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{ opacity }}
    >
      <motion.div
        className="absolute h-[42vmin] w-[42vmin] rounded-full blur-[80px] md:h-[52vmin] md:w-[52vmin]"
        style={{ background: product.glow, opacity: glowOpacity, scale }}
      />
      <motion.div style={{ x, rotate, scale }} className="relative z-10 flex h-[58vh] max-h-[520px] items-center justify-center md:h-[68vh]">
        <Image
          src={product.imageCutout}
          alt={product.name}
          width={420}
          height={560}
          className="h-full w-auto max-w-[min(70vw,340px)] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
          priority={index < 2}
        />
      </motion.div>
    </motion.div>
  );
}

function TextLayer({
  product,
  progress,
}: {
  product: Product;
  progress: MotionValue<number>;
}) {
  const add = useCart((s) => s.add);
  const opacity = useTransform(progress, [0, 0.18, 0.55, 0.88], [0, 1, 1, 0]);
  const y = useTransform(progress, [0, 0.3, 1], [28, 0, -20]);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <motion.div className="max-w-sm" style={{ opacity, y }}>
      <p className="text-sm text-[var(--muted)]">{genderShort(product.gender)}</p>
      <h2 className="font-serif mt-1 text-4xl tracking-tight text-[var(--fg)] md:text-5xl lg:text-6xl">
        {product.name}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] md:text-[15px]">
        Inspired by {product.inspiredBy}. {product.shortDescription}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {product.noteChips.map((note) => (
          <span
            key={note}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)]"
          >
            {note}
          </span>
        ))}
      </div>
      <p className="font-serif mt-6 text-2xl text-[var(--gold)] md:text-3xl">
        {formatPrice(product.price)}
      </p>
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          flyToCart(btnRef.current, product.imageCutout);
          add(product);
        }}
        className="mt-5 rounded-full bg-[var(--gold)] px-7 py-2.5 text-sm font-medium text-black transition hover:brightness-110"
      >
        Add to cart
      </button>
    </motion.div>
  );
}

function BgWord({ word, progress }: { word: string; progress: MotionValue<number> }) {
  const x = useTransform(progress, [0, 1], ["8%", "-12%"]);
  const opacity = useTransform(progress, [0, 0.2, 0.55, 1], [0, 0.22, 0.16, 0]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
      style={{ opacity, x }}
    >
      <p className="font-serif select-none text-[clamp(5rem,22vw,14rem)] leading-none tracking-[0.06em] text-transparent uppercase [-webkit-text-stroke:1.5px_color-mix(in_srgb,var(--gold)_40%,transparent)]">
        {word}
      </p>
    </motion.div>
  );
}

function Dot({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const fill = useTransform(
    progress,
    [(index - 0.08) / CHAPTERS, index / CHAPTERS, (index + 0.92) / CHAPTERS],
    [0, 1, 0],
  );

  return (
    <span className="relative flex h-2.5 w-2.5 items-center justify-center">
      <span className="absolute inset-0 rounded-full border border-[var(--gold)]/50" />
      <motion.span
        className="block h-2.5 w-2.5 rounded-full bg-[var(--gold)]"
        style={{ opacity: fill, scale: fill }}
      />
    </span>
  );
}

function ChapterStage({ smooth }: { smooth: MotionValue<number> }) {
  const p0 = useChapterProgress(smooth, 0);
  const p1 = useChapterProgress(smooth, 1);
  const p2 = useChapterProgress(smooth, 2);
  const p3 = useChapterProgress(smooth, 3);
  const p4 = useChapterProgress(smooth, 4);
  const p5 = useChapterProgress(smooth, 5);
  const progresses = [p0, p1, p2, p3, p4, p5];

  return (
    <div className="relative mx-auto grid h-full w-full max-w-6xl grid-cols-1 items-center px-5 pt-8 pb-12 md:grid-cols-[minmax(240px,0.9fr)_1.2fr] md:gap-6 md:px-10 md:pt-12 md:pb-14 lg:px-12">
      {/* Text — left (reference layout) */}
      <div className="relative z-20 order-2 min-h-[220px] md:order-1 md:min-h-[320px]">
        {scrollProducts.map((product, i) => (
          <div key={product.id} className="absolute inset-x-0 top-0 md:top-1/2 md:-translate-y-1/2">
            <TextLayer product={product} progress={progresses[i]} />
          </div>
        ))}
      </div>

      {/* Bottle + bg word — center/right */}
      <div className="relative order-1 h-[46vh] w-full md:order-2 md:h-[78vh]">
        {scrollProducts.map((product, i) => (
          <BgWord key={`word-${product.id}`} word={product.bgWord} progress={progresses[i]} />
        ))}
        {scrollProducts.map((product, i) => (
          <BottleLayer
            key={`bottle-${product.id}`}
            product={product}
            index={i}
            progress={progresses[i]}
          />
        ))}
      </div>
    </div>
  );
}

function ReducedList() {
  const add = useCart((s) => s.add);

  return (
    <div className="mx-auto grid max-w-6xl gap-14 px-5 py-16 md:px-10">
      {scrollProducts.map((product) => (
        <div key={product.id} className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="text-sm text-[var(--muted)]">{genderShort(product.gender)}</p>
            <h2 className="font-serif mt-1 text-4xl">{product.name}</h2>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Inspired by {product.inspiredBy}. {product.shortDescription}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.noteChips.map((note) => (
                <span
                  key={note}
                  className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)]"
                >
                  {note}
                </span>
              ))}
            </div>
            <p className="font-serif mt-5 text-2xl text-[var(--gold)]">
              {formatPrice(product.price)}
            </p>
            <button
              type="button"
              onClick={() => add(product)}
              className="mt-5 rounded-full bg-[var(--gold)] px-7 py-2.5 text-sm font-medium text-black"
            >
              Add to cart
            </button>
          </div>
          <div className="relative flex h-72 items-center justify-center md:h-96">
            <div
              className="absolute h-48 w-48 rounded-full blur-3xl opacity-50"
              style={{ background: product.glow }}
            />
            <Image
              src={product.imageCutout}
              alt={product.name}
              width={320}
              height={420}
              className="relative z-10 h-full w-auto object-contain"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StickyScrollShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.35 });
  const barScale = useTransform(smooth, [0, 1], [0, 1]);

  return (
    <section
      ref={ref}
      className="relative bg-[var(--bg)]"
      style={{ height: reduced ? "auto" : `${TRACK_VH}vh` }}
      aria-label="Fragrance journey"
    >
      <div
        className={
          reduced ? "relative" : "sticky top-0 flex h-[100svh] flex-col overflow-hidden"
        }
      >
        {!reduced && (
          <>
            {/* Right progress dots */}
            <div className="absolute right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-3.5 md:right-8">
              {scrollProducts.map((p, i) => (
                <Dot key={p.id} index={i} progress={smooth} />
              ))}
            </div>

            {/* Bottom gold progress bar (reference) */}
            <div className="absolute right-0 bottom-6 left-0 z-30 px-5 md:bottom-8 md:px-10">
              <div className="h-px w-full max-w-xs bg-[color-mix(in_srgb,var(--gold)_20%,transparent)]">
                <motion.div
                  className="h-full origin-left bg-[var(--gold)]"
                  style={{ scaleX: barScale }}
                />
              </div>
            </div>
          </>
        )}

        {reduced ? <ReducedList /> : <ChapterStage smooth={smooth} />}
      </div>
    </section>
  );
}
