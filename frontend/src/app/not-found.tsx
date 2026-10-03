import Link from "next/link";

export const metadata = {
  title: "Page Not Found | Scentra Ryv",
};

export default function NotFound() {
  return (
    <section className="page-shell text-center">
      <p className="section-eyebrow">404</p>
      <h1 className="section-heading mt-3">Page Not Found</h1>
      <div className="gold-divider" />
      <p className="mx-auto max-w-md text-brand-mute">
        The page you&apos;re looking for has drifted away like a fading scent.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn-gold-filled">Back Home</Link>
        <Link href="/shop" className="btn-gold">Shop Collection</Link>
      </div>
    </section>
  );
}
