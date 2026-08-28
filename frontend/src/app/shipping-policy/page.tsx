import Link from "next/link";
import { fetchConfig, formatPrice } from "@/lib/api";

export const metadata = {
  title: "Shipping Policy | Scentra Ryv",
  description:
    "Scentra Ryv shipping across Pakistan — 50ml fragrances in premium gift boxes, dispatched in 1–2 days, delivered in 2–5 business days.",
};

export default async function ShippingPage() {
  let nearby = "280";
  let remote = "350";
  try {
    const config = await fetchConfig();
    nearby = config.shipping_nearby_rate;
    remote = config.shipping_other_rate;
  } catch {
    /* defaults */
  }

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-3xl">
        <div className="pb-10 text-center">
          <p className="section-eyebrow">Delivery</p>
          <h1 className="section-heading mt-4">Shipping Policy</h1>
          <div className="gold-divider" />
          <p className="mx-auto mt-4 max-w-lg text-brand-mute">
            Fast, reliable delivery of our 50ml fragrances nationwide across Pakistan.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-3">
          <Link href="/returns" className="chip">Return Form</Link>
          <Link href="/shipping-policy" className="chip chip-active">Shipping Policy</Link>
          <Link href="/contact" className="chip">Contact Us</Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["1–2", "Days Processing"],
            ["2–5", "Days Delivery"],
            ["PK", "Nationwide"],
          ].map(([v, l]) => (
            <div key={l} className="feature-tile !py-8">
              <p className="font-serif text-4xl text-brand-gold">{v}</p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-brand-mute">{l}</p>
            </div>
          ))}
        </div>

        <div className="surface mt-10 space-y-10 p-7 sm:p-10">
          <section>
            <h2 className="font-serif text-2xl text-brand-gold sm:text-3xl">How We Ship</h2>
            <p className="mt-6 text-[0.95rem] leading-[1.85] text-brand-cream/75">
              At <strong className="text-brand-cream">Scentra Ryv</strong>, orders are processed within 1–2 business days
              and typically delivered in 2–5 business days via trusted couriers.
            </p>
          </section>
          <section className="border-t border-brand-gold/10 pt-10">
            <h2 className="font-serif text-2xl text-brand-gold sm:text-3xl">Shipping Rates</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="border border-brand-gold/15 bg-brand-ink/40 px-5 py-6 text-center">
                <p className="text-[11px] uppercase tracking-[0.2em] text-brand-mute">Punjab & Default</p>
                <p className="mt-3 font-serif text-3xl text-brand-gold">{formatPrice(nearby)}</p>
              </div>
              <div className="border border-brand-gold/15 bg-brand-ink/40 px-5 py-6 text-center">
                <p className="text-[11px] uppercase tracking-[0.2em] text-brand-mute">Sindh · Balochistan · KPK</p>
                <p className="mt-3 font-serif text-3xl text-brand-gold">{formatPrice(remote)}</p>
              </div>
            </div>
          </section>
          <section className="border-t border-brand-gold/10 pt-10">
            <h2 className="font-serif text-2xl text-brand-gold sm:text-3xl">Packaging</h2>
            <p className="mt-6 text-[0.95rem] leading-[1.85] text-brand-cream/75">
              Each 50ml bottle ships in a Scentra Ryv presentation box. Replacement boxes are
              <strong className="text-brand-cream"> Rs. 200–350</strong>.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
