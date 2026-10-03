import Image from "next/image";
import Link from "next/link";

export function BrandLockup({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand-lockup ${footer ? "brand-lockup--footer" : ""}`}
      aria-label="Scentra Ryv home"
    >
      <Image
        src="/images/logo-mark.png"
        alt=""
        width={36}
        height={50}
        className="brand-lockup__mark"
        priority={!footer}
      />
      <span className="min-w-0">
        <span className="brand-lockup__name">Scentra Ryv</span>
        <span className="brand-lockup__tagline">
          <span>Essence &amp; Elixir</span>
        </span>
      </span>
    </Link>
  );
}
