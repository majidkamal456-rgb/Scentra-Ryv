import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 pt-24 text-center">
      <p className="text-[11px] tracking-[0.28em] text-[var(--gold)] uppercase">404</p>
      <h1 className="font-serif mt-2 text-4xl">Page not found</h1>
      <p className="mt-3 text-[var(--muted)]">This scent trail went cold.</p>
      <Link href="/" className="btn-gold mt-8">
        Back home
      </Link>
    </div>
  );
}
