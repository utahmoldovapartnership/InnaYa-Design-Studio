import { Cormorant_Garamond } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { brandFont } from "@/lib/fonts/brand";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    shortcut: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/icon.png", type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="uk"
      className={`${serif.variable} ${brandFont.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-background font-sans text-ink"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
