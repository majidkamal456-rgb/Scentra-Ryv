"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import type { Product } from "@/lib/api";
import { ProductCard } from "./ProductCard";

export function RelatedSlider({ products }: { products: Product[] }) {
  return (
    <Swiper
      className="related-swiper mt-12"
      modules={[Navigation]}
      slidesPerView={1}
      spaceBetween={16}
      speed={600}
      navigation
      breakpoints={{
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 4 },
      }}
    >
      {products.map((p) => (
        <SwiperSlide key={p.id}>
          <ProductCard product={p} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
