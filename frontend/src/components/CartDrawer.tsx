"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { formatPrice } from "@/data/products";
import { useCart, useCartHydrated } from "@/store/cart";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: Props) {
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const update = useCart((s) => s.update);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal);
  const safeItems = hydrated ? items : [];
  const safeSubtotal = hydrated ? subtotal() : 0;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`fixed right-0 top-0 z-[85] flex h-full w-full max-w-md flex-col border-l border-[var(--border)] bg-[var(--bg)] shadow-2xl transition-transform duration-500 ease-[var(--ease-luxe)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="font-serif text-xl tracking-wide">Your cart</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--muted)] transition hover:text-[var(--gold)]"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!hydrated ? (
            <p className="py-16 text-center text-[var(--muted)]">Loading cart…</p>
          ) : safeItems.length === 0 ? (
            <p className="py-16 text-center text-[var(--muted)]">Your cart is empty.</p>
          ) : (
            <ul className="space-y-5">
              {safeItems.map((item) => (
                <li key={item.productId} className="flex gap-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden">
                    <Image src={item.image} alt={item.name} fill className="object-contain p-1" sizes="64px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={onClose}
                      className="font-serif text-base hover:text-[var(--gold)]"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-[var(--muted)]">{item.sizeMl}</p>
                    <p className="mt-1 text-sm text-[var(--gold)]">{formatPrice(item.price)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center border border-[var(--border)]">
                        <button
                          type="button"
                          className="px-2 py-1 text-sm"
                          onClick={() => update(item.productId, item.quantity - 1)}
                          aria-label="Decrease"
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          className="px-2 py-1 text-sm"
                          onClick={() => update(item.productId, item.quantity + 1)}
                          aria-label="Increase"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.productId)}
                        className="text-xs text-[var(--muted)] underline hover:text-[var(--gold)]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-[var(--border)] px-5 py-5">
          <div className="mb-4 flex justify-between text-sm">
            <span className="text-[var(--muted)]">Subtotal</span>
            <span className="font-medium text-[var(--gold)]">{formatPrice(safeSubtotal)}</span>
          </div>
          <Link href="/cart" onClick={onClose} className="btn-outline mb-2 w-full">
            View cart
          </Link>
          <Link
            href="/checkout"
            onClick={onClose}
            className={`btn-gold w-full ${safeItems.length === 0 ? "pointer-events-none opacity-40" : ""}`}
          >
            Checkout
          </Link>
          <p className="mt-3 text-center text-[10px] tracking-wider text-[var(--muted)] uppercase">
            Cash on Delivery · Nationwide
          </p>
        </div>
      </aside>
    </>
  );
}
