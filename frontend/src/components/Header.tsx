"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/CartDrawer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCart } from "@/store/cart";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="site-header">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 lg:px-8">
          <Link href="/" className="brand-lockup" aria-label="Scentra Ryv home">
            <Image
              src="/images/logo-mark.png"
              alt=""
              width={36}
              height={50}
              className="brand-lockup__mark"
              unoptimized
              priority
            />
            <span className="min-w-0">
              <span className="brand-lockup__name">Scentra Ryv</span>
              <span className="brand-lockup__tagline">
                <span>Essence &amp; Elixir</span>
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link${pathname === item.href ? " is-active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <button
              id="cart-trigger"
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="cart-trigger"
              aria-label="Shopping cart"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {mounted && count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--gold)] px-1 text-[10px] font-semibold text-black">
                  {count}
                </span>
              )}
            </button>
            <button
              id="mobile-menu-toggle"
              type="button"
              className="cart-trigger md:!hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-[70] bg-black/70 backdrop-blur-md transition md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        className={`mobile-drawer fixed right-0 top-0 z-[75] flex h-full w-[min(20rem,88vw)] flex-col border-l border-[var(--border)] p-8 backdrop-blur-xl transition-transform duration-500 md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          type="button"
          className="mb-10 self-end text-[var(--muted)] transition hover:text-[var(--gold)]"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <nav className="flex flex-col gap-5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-serif text-3xl transition hover:tracking-wide ${
                pathname === item.href
                  ? "text-[var(--gold)]"
                  : "text-[var(--fg)]/85 hover:text-[var(--gold)]"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="btn-gold mt-auto w-full text-center"
          onClick={() => {
            setMobileOpen(false);
            setDrawerOpen(true);
          }}
        >
          View Cart
        </button>
      </aside>

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
