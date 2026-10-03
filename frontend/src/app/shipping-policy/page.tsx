import Link from "next/link";
import { fetchConfigSafe, formatPrice, WHATSAPP_DISPLAY } from "@/lib/api";

export const metadata = {
  title: "Shipping Policy | Scentra Ryv",
  description:
    "Scentra Ryv shipping across Pakistan — 50ml fragrances in premium gift boxes, dispatched in 1–2 days, delivered in 2–5 business days.",
};

export default async function ShippingPage() {
  const config = await fetchConfigSafe();
  const nearby = config.shipping_nearby_rate;
  const remote = config.shipping_other_rate;

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-3xl">
        <div className="page-hero fade-section visible pb-10!">
          <p className="section-eyebrow">Delivery</p>
          <h1 className="section-heading mt-4">Shipping Policy</h1>
          <div className="gold-divider" />
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-brand-mute">
            Fast, reliable delivery of our 50ml fragrances — beautifully boxed and shipped nationwide across Pakistan.
          </p>
        </div>

        <div className="fade-section visible flex flex-wrap items-center justify-center gap-3">
          <Link href="/returns" className="chip">Return Form</Link>
          <Link href="/shipping-policy" className="chip chip-active">Shipping Policy</Link>
          <Link href="/contact" className="chip">Contact Us</Link>
        </div>

        <div className="fade-section visible mt-12 grid gap-4 sm:grid-cols-3">
          {[
            ["1–2", "Days Processing"],
            ["2–5", "Days Delivery"],
            ["PK", "Nationwide"],
          ].map(([v, l]) => (
            <div key={l} className="feature-tile py-8!">
              <p className="font-serif text-4xl text-brand-gold">{v}</p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-brand-mute">{l}</p>
            </div>
          ))}
        </div>

        <div className="surface fade-section visible mt-10 space-y-10 p-7 sm:p-10">
          <section>
            <h2 className="font-serif text-2xl text-brand-gold sm:text-3xl">How We Ship</h2>
            <div className="mt-6 space-y-5 text-[0.95rem] leading-[1.85] text-brand-cream/75">
              <p>
                At <strong className="text-brand-cream">Scentra Ryv</strong>, every order is handled with the same care we
                put into our fragrances. We ship across Pakistan through trusted courier partners so your 50ml elixir
                arrives safely in our signature gift box.
              </p>
              <p>
                Orders are typically processed and dispatched within{" "}
                <strong className="text-brand-cream">1–2 business days</strong> after payment confirmation. Most locations
                receive their parcel within <strong className="text-brand-cream">2–5 business days</strong>.
              </p>
            </div>
          </section>

          <section className="border-t border-brand-gold/10 pt-10">
            <h2 className="font-serif text-2xl text-brand-gold sm:text-3xl">Shipping Rates</h2>
            <p className="mt-6 text-[0.95rem] leading-[1.85] text-brand-cream/75">
              Flat-rate shipping applies per order — no extra charge for additional 50ml bottles in the same shipment.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="border border-brand-gold/15 bg-brand-ink/40 px-5 py-6 text-center">
                <p className="text-[11px] uppercase tracking-[0.2em] text-brand-mute">Punjab &amp; Default</p>
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
            <div className="mt-6 space-y-5 text-[0.95rem] leading-[1.85] text-brand-cream/75">
              <p>
                Each 50ml bottle is secured in a protective Scentra Ryv presentation box. Standalone replacement boxes are
                priced between <strong className="text-brand-cream">Rs. 200–350</strong> depending on style and
                availability.
              </p>
              <p>Please inspect your parcel on delivery and contact us immediately if the outer box shows signs of damage.</p>
            </div>
          </section>

          <section className="border-t border-brand-gold/10 pt-10">
            <h2 className="font-serif text-2xl text-brand-gold sm:text-3xl">Tracking &amp; Delays</h2>
            <div className="mt-6 space-y-5 text-[0.95rem] leading-[1.85] text-brand-cream/75">
              <p>
                Once your order leaves our facility, tracking details are shared via SMS or WhatsApp when provided by the
                courier. Scentra Ryv cannot be held responsible for delays caused by weather, public holidays, remote-area
                routing, or events outside our control once the shipment is with the courier.
              </p>
              <p>If delivery is taking longer than expected, share your order number — our team will follow up with the carrier.</p>
            </div>
          </section>
        </div>

        <div className="fade-section visible mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/contact" className="btn-gold w-full text-center sm:w-auto">Contact Us</Link>
          <a
            href={`https://wa.me/${config.whatsapp_number}`}
            target="_blank"
            rel="noopener"
            className="btn-gold-filled w-full text-center sm:w-auto"
          >
            WhatsApp · {WHATSAPP_DISPLAY}
          </a>
        </div>
      </div>
    </section>
  );
}
