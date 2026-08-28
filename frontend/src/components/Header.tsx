"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-gold/10 bg-brand-black/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 lg:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="font-display text-[1.05rem] font-semibold tracking-[0.14em] text-gradient-gold sm:text-[1.15rem]">
            Scentra Ryv
          </span>
        </Link>

        <div className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center text-brand-cream/80 transition hover:text-brand-gold"
            aria-label="Shopping cart"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-semibold text-brand-black">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center text-brand-cream/80 md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md md:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed right-0 top-0 z-[70] flex h-full w-[min(20rem,88vw)] flex-col border-l border-brand-gold/20 bg-brand-ink/95 p-8 md:hidden">
            <button type="button" className="mb-10 self-end text-brand-cream/50" onClick={() => setOpen(false)} aria-label="Close">
              ✕
            </button>
            <nav className="flex flex-col gap-5">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="font-serif text-3xl text-brand-cream/85 hover:text-brand-gold"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <Link href="/cart" className="btn-gold-filled mt-auto w-full text-center" onClick={() => setOpen(false)}>
              View Cart
            </Link>
          </aside>
        </>
      )}
    </header>
  );
}
