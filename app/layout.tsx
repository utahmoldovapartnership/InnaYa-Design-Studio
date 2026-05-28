import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    shortcut: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/icon.png", type: "image/png" }],
  },
};

// Root layout passes through; `<html>` / `<body>` live in `app/[locale]/layout.tsx`
// so `lang` matches the active locale (see next-intl App Router guidance).
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
