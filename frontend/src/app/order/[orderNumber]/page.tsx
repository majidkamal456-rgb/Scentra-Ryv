import Link from "next/link";
import { OrderTracking } from "@/components/OrderTracking";
import { fetchApiOrder } from "@/lib/api";

type Props = { params: Promise<{ orderNumber: string }> };

export default async function OrderPage({ params }: Props) {
  const { orderNumber } = await params;
  let order = null;
  try {
    order = await fetchApiOrder(orderNumber, true);
  } catch {
    order = null;
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-28 pb-20 text-center">
      <p className="text-[11px] tracking-[0.28em] text-[var(--gold)] uppercase">Order</p>
      <h1 className="font-serif mt-2 text-4xl">{order?.order_number ?? orderNumber}</h1>
      {order ? (
        <div className="mt-6 space-y-2 text-sm text-[var(--muted)]">
          <p>
            Status: <span className="text-[var(--gold)]">{order.status.replaceAll("_", " ")}</span>
          </p>
          <p>
            Total:{" "}
            <span className="text-[var(--gold)]">
              Rs. {Number(order.total_amount).toLocaleString("en-PK")}
            </span>
          </p>
          <p>
            {order.full_name} · {order.city}
          </p>
          {order.free_tester_name ? (
            <p className="mt-3 text-[var(--gold)]">
              Free tester included: {order.free_tester_name}
            </p>
          ) : null}
          <ul className="mt-4 space-y-1 text-left">
            {order.items.map((item, i) => (
              <li
                key={`${item.product_name}-${i}`}
                className="flex justify-between gap-4 border-b border-[var(--border)] py-2"
              >
                <span>
                  {item.product_name} × {item.quantity}
                  {item.size_ml ? ` · ${item.size_ml}` : ""}
                </span>
                <span>Rs. {Number(item.line_total).toLocaleString("en-PK")}</span>
              </li>
            ))}
          </ul>

          <OrderTracking
            orderNumber={order.order_number}
            trackingNumber={order.tracking_number}
            courierCode={order.courier_code}
            initialStatus={
              order.live_tracking?.live_courier_status ||
              order.live_tracking?.status ||
              order.courier_status
            }
          />
        </div>
      ) : (
        <p className="mt-4 text-[var(--muted)]">
          Thank you for shopping with Scentra Ryv. For order updates, message us on WhatsApp.
        </p>
      )}
      <a href="https://wa.me/923177478167" className="btn-gold mt-8 inline-flex">
        WhatsApp support
      </a>
      <Link href="/shop" className="btn-outline mt-3 inline-flex">
        Continue shopping
      </Link>
    </div>
  );
}
