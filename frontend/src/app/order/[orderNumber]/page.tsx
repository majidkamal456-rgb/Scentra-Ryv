import Link from "next/link";
import { fetchConfigSafe, fetchOrder, formatPrice, type Order } from "@/lib/api";
import { ClearCheckoutDraft } from "./ClearCheckoutDraft";

type Props = { params: Promise<{ orderNumber: string }> };

export async function generateMetadata({ params }: Props) {
  const { orderNumber } = await params;
  return { title: `Order Confirmed | Scentra Ryv`, description: `Order ${orderNumber}` };
}

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  bank_transfer: "Bank Transfer",
};

export default async function OrderPage({ params }: Props) {
  const { orderNumber } = await params;
  const config = await fetchConfigSafe();

  let order: Order;
  try {
    order = await fetchOrder(orderNumber);
  } catch {
    return (
      <section className="page-shell text-center">
        <p className="section-eyebrow">Order</p>
        <h1 className="section-heading mt-3">Order not found</h1>
        <div className="gold-divider" />
        <p className="text-brand-mute">We couldn&apos;t find an order with number {orderNumber}.</p>
        <Link href="/" className="btn-gold mt-8 inline-block">Continue Shopping</Link>
      </section>
    );
  }

  const paymentLabel = order.payment_method_display || PAYMENT_LABELS[order.payment_method] || order.payment_method;
  const waHref = `https://wa.me/${config.whatsapp_number}?text=Hi,%20I%20placed%20order%20${encodeURIComponent(order.order_number)}`;

  return (
    <section className="page-shell text-center">
      <ClearCheckoutDraft />
      <div className="fade-section visible mx-auto max-w-2xl">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center border border-brand-gold text-brand-gold shadow-[var(--shadow-gold-soft)]">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="section-eyebrow">Confirmed</p>
        <h1 className="mt-3 font-serif text-4xl text-gradient-gold md:text-5xl">Thank You</h1>
        <p className="mt-3 text-brand-mute">
          Order <span className="text-brand-gold">{order.order_number}</span>
        </p>

        {order.payment_method === "cod" ? (
          <p className="mx-auto mt-8 max-w-lg text-lg leading-relaxed text-brand-cream/75">
            Your order has been placed! Pay cash on delivery when it arrives.
          </p>
        ) : (
          <p className="mx-auto mt-8 max-w-lg text-lg leading-relaxed text-brand-cream/75">
            Thank you! We&apos;ve received your order and payment screenshot. Our team will verify your payment and
            confirm your order shortly via phone/WhatsApp.
          </p>
        )}

        <div className="surface mx-auto mt-12 max-w-md p-8 text-left">
          <h2 className="font-serif text-xl text-brand-gold">Order Summary</h2>
          <ul className="mt-4 space-y-2 text-sm text-brand-cream/70">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span>
                  {item.product_name} ({item.size_ml}) × {item.quantity}
                </span>
                <span className="shrink-0">{formatPrice(item.line_total)}</span>
              </li>
            ))}
          </ul>
          <div className="gold-divider my-4!" />
          <div className="flex justify-between text-sm text-brand-cream/70">
            <span>Payment</span>
            <span>{paymentLabel}</span>
          </div>
          <div className="mt-3 flex justify-between font-serif text-xl text-brand-gold">
            <span>Total</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a href={waHref} target="_blank" rel="noopener" className="btn-gold-filled">
            Message us on WhatsApp
          </a>
          <Link href="/" className="btn-gold">Continue Shopping</Link>
        </div>
      </div>
    </section>
  );
}
