import Link from "next/link";
import { fetchOrder, formatPrice } from "@/lib/api";

type Props = { params: Promise<{ orderNumber: string }> };

export async function generateMetadata({ params }: Props) {
  const { orderNumber } = await params;
  return { title: `Order ${orderNumber} | Scentra Ryv` };
}

export default async function OrderPage({ params }: Props) {
  const { orderNumber } = await params;
  let order;
  try {
    order = await fetchOrder(orderNumber);
  } catch {
    return (
      <section className="page-shell text-center">
        <h1 className="section-heading">Order not found</h1>
        <Link href="/shop" className="btn-gold mt-8 inline-block">Shop</Link>
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-eyebrow">Confirmed</p>
        <h1 className="section-heading mt-3">Thank You</h1>
        <div className="gold-divider" />
        <p className="text-brand-mute">Order <span className="text-brand-gold">{order.order_number}</span> has been placed.</p>
      </div>
      <div className="surface mx-auto mt-10 max-w-2xl p-6 sm:p-8 text-sm">
        <p className="text-brand-cream">{order.full_name} · {order.city}</p>
        <p className="mt-2 text-brand-mute">{order.address}</p>
        <ul className="mt-6 space-y-2 border-t border-brand-gold/10 pt-6">
          {order.items.map((item: { product_name: string; quantity: number; line_total: string }, i: number) => (
            <li key={i} className="flex justify-between">
              <span>{item.product_name} × {item.quantity}</span>
              <span>{formatPrice(item.line_total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-between border-t border-brand-gold/10 pt-4 font-serif text-xl text-brand-gold">
          <span>Total</span>
          <span>{formatPrice(order.total_amount)}</span>
        </div>
      </div>
      <div className="mt-10 text-center">
        <Link href="/shop" className="btn-gold">Continue Shopping</Link>
      </div>
    </section>
  );
}
