import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Returns",
  description: "Scentra Ryv returns policy — easy returns for unused products.",
};

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 pb-20 lg:px-8">
      <p className="text-[11px] tracking-[0.28em] text-[var(--gold)] uppercase">Policy</p>
      <h1 className="font-serif mt-2 text-4xl md:text-5xl">Returns</h1>
      <div className="mt-8 space-y-4 text-[var(--muted)] leading-relaxed">
        <p>
          We want you to love your fragrance. If your order arrives damaged or incorrect, contact us
          within 48 hours of delivery via WhatsApp with your order details and photos.
        </p>
        <p>
          Unopened products may be eligible for return or exchange within 7 days of delivery,
          subject to inspection. Opened bottles generally cannot be returned for hygiene reasons,
          unless there is a manufacturing defect.
        </p>
        <p>
          Approved returns are processed as a replacement, store credit, or refund depending on
          payment method (Cash on Delivery / bank transfer).
        </p>
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <a href="https://wa.me/923177478167" className="btn-gold">
          Request a return
        </a>
        <Link href="/contact" className="btn-outline">
          Contact
        </Link>
      </div>
    </div>
  );
}
