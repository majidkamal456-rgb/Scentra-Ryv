import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, DM_Sans } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { fetchConfigSafe } from "@/lib/api";
import { CartProvider } from "@/lib/cart";
import { ToastProvider } from "@/lib/toast";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Scentra Ryv | Essence & Elixir",
    template: "%s",
  },
  description:
    "Luxury perfumes by Scentra Ryv — Essence & Elixir. Premium fragrances with cash on delivery nationwide.",
  metadataBase: new URL("https://www.scentraryv.pk"),
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Scentra Ryv — Essence & Elixir",
    description: "Premium perfumes with Cash on Delivery across Pakistan.",
    url: "https://www.scentraryv.pk",
    siteName: "Scentra Ryv",
    type: "website",
    images: [
      {
        url: "https://www.scentraryv.pk/static/images/scentra-ryv-og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Scentra Ryv — Essence & Elixir",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scentra Ryv — Essence & Elixir",
    description: "Premium perfumes with Cash on Delivery across Pakistan.",
    images: ["https://www.scentraryv.pk/static/images/scentra-ryv-og-banner.jpg"],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await fetchConfigSafe();

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${cinzel.variable} ${cormorant.variable} ${dmSans.variable} relative flex min-h-screen flex-col`}>
        <div className="site-noise" aria-hidden="true" />
        <ToastProvider>
          <CartProvider>
            <Header />
            <main className="relative z-10 flex-1">{children}</main>
            <Footer contactEmail={config.contact_email} />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
