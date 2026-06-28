import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

import "./globals.css";
import { Providers } from "./providers";
import { FeedbackButton } from "@/components/feedback-button";
import { GoogleAnalytics } from "@/components/google-analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "aamchi मुंबई - Mumbai Civic Tracker",
  description: "Know your ward, know your corporator. Navigate through 227 electoral wards and hold your representatives accountable.",
  keywords: [
    "Mumbai",
    "BMC",
    "Mumbai Corporator",
    "Mumbai Wards",
    "Elections",
    "aamchi mumbai",
    "Corporator Data",
    "Manifestos",
    "BMC Elections",
    "Corporator Education Data",
    "BMC Records",
    "Mumbai Politics",
    "Mumbai Corporators",
    "Mumbai Civic Data",
    "Contact BMC Corporator",
    "Mumbai Corporator Contact",
    "Ansh Shetty"

  ],
  openGraph: {
    title: "aamchi मुंबई - Mumbai Civic Tracker",
    description: "Know your ward, know your corporator. Navigate through 227 electoral wards and hold your representatives accountable.",
    siteName: "aamchi मुंबई",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "aamchi मुंबई - Mumbai Civic Tracker",
    description: "Know your ward, know your corporator. Navigate through 227 electoral wards and hold your representatives accountable.",
  },
  icons: {
    icon: "/images/kaali-peeli.png",
    apple: "/images/kaali-peeli.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""} />
        <Analytics />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8355660084933685"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Providers>
          {children}
          <FeedbackButton />
        </Providers>
      </body>
    </html>
  );
}
