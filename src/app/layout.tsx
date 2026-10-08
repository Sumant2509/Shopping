import type { Metadata } from "next";
import Script from "next/script";
import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { CartDrawer } from "@/components/CartDrawer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sumanthandmade.in"),
  title: "Home-Warrior | Beautiful Handmade Doormats for Every Home",
  description: "Handcrafted flower-shaped, round, and braided cotton doormats manufactured by Home-Warrior in India. Direct from maker with free all-India shipping on orders above ₹699.",
  keywords: [
    "handmade doormat",
    "flower shaped doormat",
    "braided cotton mat",
    "crochet doormat India",
    "Home-Warrior doormats",
    "washable doormat",
    "Indian handmade home decor",
    "entryway mat India"
  ],
  authors: [{ name: "Home-Warrior" }],
  openGraph: {
    title: "Home-Warrior | Handcrafted Doormats Made in India",
    description: "Explore our bestselling 20-inch handmade flower doormats and braided floor mats. Direct from maker, authentic Indian craftsmanship.",
    url: "https://sumanthandmade.in",
    siteName: "Home-Warrior",
    images: [
      {
        url: "/images/hero_doormat.jpg",
        width: 1200,
        height: 630,
        alt: "Handmade Flower Doormat at Indian Home Entrance",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Home-Warrior | Beautiful Handmade Doormats",
    description: "Handcrafted flower and braided doormats by Home-Warrior.",
    images: ["/images/hero_doormat.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Home-Warrior",
    "founder": "Sumant Kumar",
    "url": "https://sumanthandmade.in",
    "logo": "https://sumanthandmade.in/images/hero_doormat.jpg",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-88781-12007",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi"]
    },
    "sameAs": [
      "https://instagram.com",
      "https://amazon.in",
      "https://flipkart.com"
    ]
  };

  return (
    <html lang="en" className={`${playfair.variable} ${outfit.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-craft-50 text-craft-900 antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
            <WhatsAppButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
