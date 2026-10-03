"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { BrandLockup } from "./BrandLockup";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on route change and lock body scroll while it is open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="site-header">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 lg:px-8">
          <BrandLockup />

          <div className="hidden items-center gap-10 md:flex">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/cart" className="cart-trigger" aria-label="Shopping cart">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span
                id="cart-badge"
                className={`absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-semibold text-brand-black ${count ? "" : "hidden"}`}
              >
                {count}
              </span>
            </Link>
            <button
              type="button"
              className="cart-trigger md:hidden"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-md md:hidden ${open ? "" : "hidden"}`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-[min(20rem,88vw)] flex-col border-l border-brand-gold/20 bg-brand-ink/95 p-8 shadow-[var(--shadow-lift)] backdrop-blur-xl transition-transform duration-500 ease-luxe md:hidden ${open ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="mb-10 self-end text-brand-cream/50 transition hover:text-brand-gold"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <nav className="flex flex-col gap-5">
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-serif text-3xl transition hover:tracking-wide ${i === 0 ? "text-brand-gold" : "text-brand-cream/85 hover:text-brand-gold"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/cart" className="btn-gold-filled mt-auto w-full text-center">
          View Cart
        </Link>
      </aside>
    </>
  );
}
