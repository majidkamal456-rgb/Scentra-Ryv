import Link from "next/link";
import { DEFAULT_EMAIL } from "@/lib/api";
import { BrandLockup } from "./BrandLockup";

export function Footer({ contactEmail = DEFAULT_EMAIL }: { contactEmail?: string }) {
  return (
    <footer className="relative z-10 mt-auto border-t border-brand-gold/10 bg-brand-ink/80">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <BrandLockup footer />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-mute">
              Luxury fragrances crafted for those who appreciate the art of scent — rare notes, refined presence.
            </p>
          </div>
          <div className="md:col-span-2">
            <h4 className="mb-5 text-[11px] uppercase tracking-[0.25em] text-brand-gold">Explore</h4>
            <ul className="space-y-3 text-sm text-brand-cream/65">
              <li><Link href="/" className="transition hover:text-brand-gold">Home</Link></li>
              <li><Link href="/shop" className="transition hover:text-brand-gold">Shop</Link></li>
              <li><Link href="/about" className="transition hover:text-brand-gold">About</Link></li>
              <li><Link href="/contact" className="transition hover:text-brand-gold">Contact</Link></li>
              <li><Link href="/returns" className="transition hover:text-brand-gold">Return Form</Link></li>
              <li><Link href="/shipping-policy" className="transition hover:text-brand-gold">Shipping Policy</Link></li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <h4 className="mb-5 text-[11px] uppercase tracking-[0.25em] text-brand-gold">Contact</h4>
            <ul className="space-y-3 text-sm text-brand-cream/65">
              <li><Link href="/contact" className="transition hover:text-brand-gold">WhatsApp Support</Link></li>
              <li><a href={`mailto:${contactEmail}`} className="transition hover:text-brand-gold">{contactEmail}</a></li>
              <li>Nationwide Delivery</li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h4 className="mb-5 text-[11px] uppercase tracking-[0.25em] text-brand-gold">Payment</h4>
            <p className="text-sm leading-relaxed text-brand-cream/65">Cash on Delivery</p>
            <p className="mt-2 text-sm text-brand-mute">Bank transfer accepted</p>
          </div>
        </div>
        <div className="gold-divider mt-14" />
        <p className="text-center text-[11px] tracking-wider text-brand-mute/70">
          &copy; {new Date().getFullYear()} Scentra Ryv. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
