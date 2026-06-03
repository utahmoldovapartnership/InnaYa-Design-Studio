import { Cormorant_Garamond } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { routing } from "@/i18n/routing";
import { brandFont } from "@/lib/fonts/brand";
import "../globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://innayastudio.vercel.app";

const serif = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const openGraphLocale =
    locale === "ru" ? "ru_RU" : locale === "uk" ? "uk_UA" : "en_US";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("siteName"),
      template: `%s · ${t("siteName")}`,
    },
    description: t("description"),
    icons: {
      icon: "/icon.png",
      shortcut: "/icon.png",
      apple: "/icon.png",
    },
    openGraph: {
      type: "website",
      locale: openGraphLocale,
      siteName: t("siteName"),
      title: t("siteName"),
      description: t("description"),
      images: [
        {
          url: "/images/innaya-logo.png",
          width: 1024,
          height: 512,
          alt: t("siteName"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("siteName"),
      description: t("description"),
      images: ["/images/innaya-logo.png"],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${serif.variable} ${brandFont.variable} h-full scroll-smooth antialiased`}
    >
      <body
        className="font-sans min-h-full bg-background text-ink"
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-full flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
