import Image from "next/image";
import Link from "next/link";

const CONTACT_EMAIL = "scentraryv@gmail.com";

export function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)]">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="brand-lockup brand-lockup--footer" aria-label="Scentra Ryv home">
              <Image
                src="/images/logo-mark.png"
                alt=""
                width={36}
                height={50}
                className="brand-lockup__mark"
                unoptimized
              />
              <span>
                <span className="brand-lockup__name">Scentra Ryv</span>
                <span className="brand-lockup__tagline">
                  <span>Essence &amp; Elixir</span>
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
              Luxury fragrances crafted for those who appreciate the art of scent — rare notes,
              refined presence.
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="mb-5 text-[11px] tracking-[0.25em] text-[var(--gold)] uppercase">
              Explore
            </h4>
            <ul className="space-y-3 text-sm text-[var(--fg)]/65">
              <li>
                <Link href="/" className="transition hover:text-[var(--gold)]">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="transition hover:text-[var(--gold)]">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition hover:text-[var(--gold)]">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition hover:text-[var(--gold)]">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/returns" className="transition hover:text-[var(--gold)]">
                  Return Form
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="transition hover:text-[var(--gold)]">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="mb-5 text-[11px] tracking-[0.25em] text-[var(--gold)] uppercase">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-[var(--fg)]/65">
              <li>
                <a
                  href="https://wa.me/923177478167"
                  className="transition hover:text-[var(--gold)]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp Support
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="transition hover:text-[var(--gold)]">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>Nationwide Delivery</li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="mb-5 text-[11px] tracking-[0.25em] text-[var(--gold)] uppercase">
              Payment
            </h4>
            <p className="text-sm leading-relaxed text-[var(--fg)]/65">Cash on Delivery</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Bank transfer accepted</p>
          </div>
        </div>

        <div className="gold-rule mt-14" />
        <p className="mt-6 text-center text-[11px] tracking-wider text-[var(--muted)]/70">
          &copy; {new Date().getFullYear()} Scentra Ryv. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
