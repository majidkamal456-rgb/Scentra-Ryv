import { fetchConfigSafe } from "@/lib/api";
import { CheckoutClient } from "./CheckoutClient";

export const metadata = {
  title: "Checkout | Scentra Ryv",
};

export default async function CheckoutPage() {
  const config = await fetchConfigSafe();
  return <CheckoutClient config={config} />;
}
