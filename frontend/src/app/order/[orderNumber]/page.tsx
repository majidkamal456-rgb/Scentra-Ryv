import Link from "next/link";

type Props = { params: Promise<{ orderNumber: string }> };

export default async function OrderPage({ params }: Props) {
  const { orderNumber } = await params;

  return (
    <div className="mx-auto max-w-lg px-4 pt-28 pb-20 text-center">
      <p className="text-[11px] tracking-[0.28em] text-[var(--gold)] uppercase">Order</p>
      <h1 className="font-serif mt-2 text-4xl">{orderNumber}</h1>
      <p className="mt-4 text-[var(--muted)]">
        Thank you for shopping with Scentra Ryv. For order updates, message us on WhatsApp.
      </p>
      <a href="https://wa.me/923177478167" className="btn-gold mt-8 inline-flex">
        WhatsApp support
      </a>
      <Link href="/shop" className="btn-outline mt-3 inline-flex">
        Continue shopping
      </Link>
    </div>
  );
}
