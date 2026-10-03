"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

export function HeroSlider() {
  return (
    <Swiper
      className="hero-swiper"
      modules={[Autoplay, EffectFade, Pagination]}
      loop
      autoplay={{ delay: 5500, disableOnInteraction: false }}
      effect="fade"
      fadeEffect={{ crossFade: true }}
      speed={900}
      pagination={{ clickable: true }}
    >
      <SwiperSlide>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(201,164,76,0.16),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black/20 via-transparent to-brand-black/90" />
        <div className="absolute inset-0 bg-vignette" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center lg:px-8">
          <Image
            src="/images/logo-mark.png"
            alt=""
            width={72}
            height={100}
            priority
            className="mx-auto mb-8 h-20 w-auto animate-float opacity-95 drop-shadow-[0_0_30px_rgba(201,164,76,0.35)] md:h-24"
          />
          <p className="section-eyebrow mb-5 animate-fade-in">Essence &amp; Elixir</p>
          <h1 className="font-display text-5xl font-semibold tracking-[0.08em] text-gradient-gold md:text-7xl lg:text-8xl">
            Scentra Ryv
          </h1>
          <p className="mx-auto mt-7 max-w-lg text-base leading-relaxed text-brand-cream/65 md:text-lg">
            Luxury fragrances that linger like a whispered promise.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/shop" className="btn-gold-filled">Shop Collection</Link>
            <Link href="/about" className="btn-gold">Our Story</Link>
          </div>
        </div>
      </SwiperSlide>

      <SwiperSlide>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-charcoal via-brand-black to-brand-ink" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(201,164,76,0.12),transparent_50%)]" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center lg:px-8">
          <p className="section-eyebrow mb-4">Crafted Rare</p>
          <h2 className="font-serif text-4xl text-brand-cream md:text-6xl">The Art of Oud</h2>
          <p className="mx-auto mt-6 max-w-md text-brand-cream/60">
            Rare ingredients, masterfully blended for an unforgettable signature.
          </p>
          <Link href="/shop" className="btn-gold mt-10 inline-block">Explore Collection</Link>
        </div>
      </SwiperSlide>

      <SwiperSlide>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-ink to-brand-charcoal" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,164,76,0.1),transparent_60%)]" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center lg:px-8">
          <p className="section-eyebrow mb-4">Shop with Ease</p>
          <h2 className="font-serif text-4xl text-brand-cream md:text-6xl">Cash on Delivery</h2>
          <p className="mx-auto mt-6 max-w-md text-brand-cream/60">
            Order with confidence. Pay when your fragrance arrives at your doorstep.
          </p>
          <Link href="/shop" className="btn-gold-filled mt-10 inline-block">Shop Now</Link>
        </div>
      </SwiperSlide>
    </Swiper>
  );
}
