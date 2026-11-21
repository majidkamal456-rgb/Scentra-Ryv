import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping policy",
  description: "Scentra Ryv shipping — nationwide delivery across Pakistan with Cash on Delivery.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 pb-20 lg:px-8">
      <p className="text-[11px] tracking-[0.28em] text-[var(--gold)] uppercase">Policy</p>
      <h1 className="font-serif mt-2 text-4xl md:text-5xl">Shipping</h1>
      <div className="mt-8 space-y-4 leading-relaxed text-[var(--muted)]">
        <p>
          We deliver nationwide across Pakistan. Most major cities receive orders within 2–4
          business days; remote areas may take slightly longer.
        </p>
        <p>
          <strong className="text-[var(--fg)]">Cash on Delivery</strong> is available on eligible
          orders. Bank transfer is also accepted — we&apos;ll share account details after you place
          your order if you choose that option.
        </p>
        <p>
          You will receive order confirmation and courier updates via phone or WhatsApp. Please
          ensure your phone number and address are accurate at checkout.
        </p>
        <p>
          Shipping charges (if any) are confirmed before dispatch based on city and order value.
        </p>
      </div>
    </div>
  );
}
