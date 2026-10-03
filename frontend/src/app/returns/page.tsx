import { fetchConfigSafe } from "@/lib/api";
import { ReturnsClient } from "./ReturnsClient";

export const metadata = {
  title: "Returns & Exchanges | Scentra Ryv",
  description:
    "Submit a return or exchange request for your Scentra Ryv 50ml fragrance. Hassle-free support within 15 days of delivery.",
};

export default async function ReturnsPage() {
  const config = await fetchConfigSafe();
  return <ReturnsClient whatsappNumber={config.whatsapp_number} />;
}
