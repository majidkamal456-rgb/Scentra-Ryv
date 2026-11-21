const REASONS = [
  {
    title: "Long-lasting",
    body: "Formulated to linger from morning meetings to late evenings.",
  },
  {
    title: "Premium ingredients",
    body: "Carefully balanced notes inspired by iconic luxury houses.",
  },
  {
    title: "Cash on delivery",
    body: "Pay when it arrives — nationwide across Pakistan. Bank transfer also accepted.",
  },
  {
    title: "Easy returns",
    body: "Hassle-free returns if something isn’t quite right. See our returns policy.",
  },
];

export function WhySection() {
  return (
    <section className="relative z-10 border-y border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <p className="text-[11px] tracking-[0.28em] text-[var(--gold)] uppercase">Why Scentra Ryv</p>
        <h2 className="font-serif mt-2 max-w-xl text-3xl md:text-5xl">
          Crafted for presence, delivered with trust
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r) => (
            <div key={r.title}>
              <div className="mb-4 h-px w-10 bg-[var(--gold)]" />
              <h3 className="font-serif text-xl tracking-wide">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
