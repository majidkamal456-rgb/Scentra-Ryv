"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

export function Hero() {
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  if (!ready) {
    return (
      <section className="hero-swiper">
        <div className="hero-slide hero-slide--brand">
          <div className="hero-slide__glow hero-slide__glow--brand" />
          <div className="hero-slide__vignette" />
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center lg:px-8">
            <Image
              src="/images/logo-mark.png"
              alt=""
              width={72}
              height={100}
              className="hero-emblem"
              unoptimized
              priority
            />
            <p className="section-eyebrow mb-3 md:mb-5">Essence &amp; Elixir</p>
            <h1 className="hero-brand-title">Scentra Ryv</h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[rgba(243,238,226,0.65)] md:mt-7 md:text-lg">
              Luxury fragrances that linger like a whispered promise.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:mt-10 md:gap-4">
              <Link href="/shop" className="btn-gold">
                Shop Collection
              </Link>
              <Link href="/about" className="btn-outline">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-swiper">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        loop
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={900}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          renderBullet: (index, className) =>
            `<button type="button" class="${className}" aria-label="Go to slide ${index + 1}"></button>`,
        }}
        className="h-full"
      >
        {/* Slide 1 — Brand */}
        <SwiperSlide>
          <div className="hero-slide hero-slide--brand">
            <div className="hero-slide__glow hero-slide__glow--brand" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />
            <div className="hero-slide__vignette" />
            <div className="relative z-10 mx-auto max-w-4xl px-4 text-center lg:px-8">
              <Image
                src="/images/logo-mark.png"
                alt=""
                width={72}
                height={100}
                className="hero-emblem animate-float"
                unoptimized
                priority
              />
              <p className="section-eyebrow mb-3 md:mb-5">Essence &amp; Elixir</p>
              <h1 className="hero-brand-title">Scentra Ryv</h1>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[rgba(243,238,226,0.65)] md:mt-7 md:text-lg">
                Luxury fragrances that linger like a whispered promise.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:mt-10 md:gap-4">
                <Link href="/shop" className="btn-gold">
                  Shop Collection
                </Link>
                <Link href="/about" className="btn-outline">
                  Our Story
                </Link>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 2 — Art of Oud */}
        <SwiperSlide>
          <div className="hero-slide">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-black to-[#0e0e0e]" />
            <div className="hero-slide__glow hero-slide__glow--oud" />
            <div className="relative z-10 mx-auto max-w-3xl px-4 text-center lg:px-8">
              <p className="section-eyebrow mb-3 md:mb-4">Crafted Rare</p>
              <h2 className="font-serif text-3xl text-[rgba(243,238,226,0.95)] md:text-6xl">
                The Art of Oud
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-[rgba(243,238,226,0.6)] md:mt-6 md:text-base">
                Rare ingredients, masterfully blended for an unforgettable signature.
              </p>
              <Link href="/shop" className="btn-outline mt-6 inline-flex md:mt-10">
                Explore Collection
              </Link>
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 3 — COD */}
        <SwiperSlide>
          <div className="hero-slide">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-[#0e0e0e] to-[#1a1a1a]" />
            <div className="hero-slide__glow hero-slide__glow--cod" />
            <div className="relative z-10 mx-auto max-w-3xl px-4 text-center lg:px-8">
              <p className="section-eyebrow mb-3 md:mb-4">Shop with Ease</p>
              <h2 className="font-serif text-3xl text-[rgba(243,238,226,0.95)] md:text-6xl">
                Cash on Delivery
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-[rgba(243,238,226,0.6)] md:mt-6 md:text-base">
                Order with confidence. 
                <br />
                Pay when your fragrance arrives at your doorstep.
              </p>
              <Link href="/shop" className="btn-gold mt-6 inline-flex md:mt-10">
                Shop Now
              </Link>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </section>
  );
}
