"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const TESTIMONIALS = [
  {
    quote: "AL-FAKHAMA is absolutely divine. I've never received so many compliments on a fragrance.",
    author: "Ayesha K. · Lahore",
  },
  {
    quote: "The packaging alone feels luxury. Amition X is my new signature scent.",
    author: "Hassan M. · Karachi",
  },
  {
    quote: "COD made it so easy to try. Crush On You is pure elegance in a bottle.",
    author: "Sara R. · Islamabad",
  },
  {
    quote: "Eloura smells so fresh and feminine. Prime Ryv is perfect for my husband too.",
    author: "Fatima Z. · Multan",
  },
  {
    quote: "Tazkiah lasts all day. Strong, classy, and worth every rupee.",
    author: "Bilal A. · Faisalabad",
  },
];

export function TestimonialSlider() {
  return (
    <Swiper
      className="testimonial-swiper mt-12"
      modules={[Autoplay, Pagination]}
      loop
      autoplay={{ delay: 6500 }}
      speed={700}
      pagination={{ clickable: true }}
    >
      {TESTIMONIALS.map((t) => (
        <SwiperSlide key={t.author} className="px-4">
          <blockquote className="mx-auto max-w-2xl border border-brand-gold/10 bg-brand-charcoal/40 px-8 py-12 text-center backdrop-blur-sm">
            <p className="font-serif text-2xl italic leading-relaxed text-brand-cream/90 md:text-3xl">
              &ldquo;{t.quote}&rdquo;
            </p>
            <footer className="mt-8 text-[11px] uppercase tracking-[0.25em] text-brand-gold">{t.author}</footer>
          </blockquote>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
