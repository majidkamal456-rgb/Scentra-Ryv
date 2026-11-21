import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-display text-2xl tracking-wide">Scentra Ryv</p>
          <p className="mt-1 text-[11px] tracking-[0.2em] text-[var(--gold)] uppercase">
            Essence & Elixir
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--muted)]">
            Luxury fragrances crafted for presence — delivered nationwide across Pakistan.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-[11px] tracking-[0.2em] text-[var(--gold)] uppercase">Explore</h3>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li>
              <Link href="/shop" className="hover:text-[var(--gold)]">
                Shop
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-[var(--gold)]">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[var(--gold)]">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/returns" className="hover:text-[var(--gold)]">
                Returns
              </Link>
            </li>
            <li>
              <Link href="/shipping-policy" className="hover:text-[var(--gold)]">
                Shipping policy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-[11px] tracking-[0.2em] text-[var(--gold)] uppercase">Contact</h3>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li>
              <a href="https://wa.me/923177478167" className="hover:text-[var(--gold)]">
                WhatsApp +92 317 7478167
              </a>
            </li>
            <li>Nationwide delivery · Pakistan</li>
          </ul>
          <h3 className="mt-8 mb-3 text-[11px] tracking-[0.2em] text-[var(--gold)] uppercase">
            Payment
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Cash on Delivery · Bank transfer also accepted
          </p>
        </div>
      </div>
      <div className="gold-rule mx-auto max-w-7xl" />
      <p className="px-4 py-5 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} Scentra Ryv. All rights reserved.
      </p>
    </footer>
  );
}
