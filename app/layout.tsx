import type { ReactNode } from "react";

// Root layout passes through; `<html>` / `<body>` live in `app/[locale]/layout.tsx`
// so `lang` matches the active locale (see next-intl App Router guidance).
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
