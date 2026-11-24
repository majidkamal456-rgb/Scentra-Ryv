import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, DM_Sans } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { OfferModal } from "@/components/OfferModal";
import { PromoTopBar } from "@/components/PromoTopBar";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
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
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Scentra Ryv | Essence & Elixir",
    template: "%s · Scentra Ryv",
  },
  description:
    "Luxury perfumes by Scentra Ryv — Essence & Elixir. Premium fragrances with cash on delivery nationwide across Pakistan.",
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
        url: "/images/scentra-ryv-og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Scentra Ryv — Essence & Elixir",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark scroll-smooth ${cinzel.variable} ${cormorant.variable} ${dmSans.variable}`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{localStorage.removeItem('scentra_theme');document.documentElement.classList.remove('light');document.documentElement.classList.add('dark');document.documentElement.dataset.theme='dark';}catch(e){}})();`,
          }}
        />
      </head>
      <body className="relative flex min-h-screen flex-col bg-[var(--bg)] text-[var(--fg)] antialiased">
        <div className="site-noise" aria-hidden="true" />
        <PromoTopBar />
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
        <WhatsAppFloat />
        <OfferModal />
      </body>
    </html>
  );
}
