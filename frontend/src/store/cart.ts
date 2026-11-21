"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  sizeMl: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (product: Product, quantity?: number) => void;
  update: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.image,
                sizeMl: product.sizeMl,
                quantity,
              },
            ],
          };
        });
      },
      update: (productId, quantity) => {
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i,
                ),
        }));
      },
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((n, i) => n + i.price * i.quantity, 0),
    }),
    { name: "scentra_cart_v2" },
  ),
);

/** Avoid SSR/client mismatch — wait until localStorage cart is rehydrated. */
export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(useCart.persist.hasHydrated());
    return useCart.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
