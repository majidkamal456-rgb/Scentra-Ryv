import { fetchConfigSafe } from "@/lib/api";
import { CartClient } from "./CartClient";

export const metadata = {
  title: "Cart | Scentra Ryv",
};

export default async function CartPage() {
  const config = await fetchConfigSafe();
  return <CartClient config={config} />;
}
