"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Props = {
  name: string;
  images: { src: string; alt: string }[];
};

export function ProductGallery({ name, images }: Props) {
  if (images.length === 0) {
    return (
      <div className="product-gallery">
        <div className="flex min-h-[12rem] min-w-[12rem] items-center justify-center bg-gradient-to-br from-brand-charcoal via-brand-black to-brand-ink px-10 py-12">
          <div className="text-center">
            <div className="mx-auto mb-6 h-48 w-28 rounded-t-full border border-brand-gold/40 bg-gradient-to-b from-brand-gold/30 to-transparent" />
            <span className="font-serif text-2xl text-brand-gold/60">{name}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      <Swiper
        className="product-detail-swiper"
        modules={[Navigation, Pagination]}
        loop={false}
        slidesPerView={1}
        speed={700}
        autoHeight
        observer
        observeParents
        navigation={images.length > 1}
        pagination={images.length > 1 ? { clickable: true } : false}
      >
        {images.map((img, i) => (
          <SwiperSlide key={img.src + i}>
            {/* Native img so the slide takes the photo's natural height (autoHeight). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt={img.alt} className="product-gallery__img" />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
