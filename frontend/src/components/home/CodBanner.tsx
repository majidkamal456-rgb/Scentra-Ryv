import Link from "next/link";

export function CodBanner() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 lg:px-8">
      <div className="relative overflow-hidden border border-[var(--border)] px-6 py-14 text-center md:px-16">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in srgb, var(--gold) 16%, transparent), transparent 70%)",
          }}
        />
        <p className="relative text-[11px] tracking-[0.28em] text-[var(--gold)] uppercase">
          Nationwide delivery
        </p>
        <h2 className="font-serif relative mt-3 text-3xl md:text-5xl">Cash on Delivery</h2>
        <p className="relative mx-auto mt-4 max-w-lg text-sm text-[var(--muted)] md:text-base">
          Order with confidence — pay when your fragrance arrives. Bank transfer also accepted.
        </p>
        <Link href="/shop" className="btn-gold relative mt-8 inline-flex">
          Shop now
        </Link>
      </div>
    </section>
  );
}
