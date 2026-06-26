import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export function localePath(locale: string, pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (normalized === "/") {
    return `/${locale}`;
  }
  return `/${locale}${normalized}`;
}

export function buildLocaleAlternates(
  locale: string,
  pathname: string,
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};

  for (const loc of routing.locales) {
    languages[loc] = localePath(loc, pathname);
  }
  languages["x-default"] = localePath(routing.defaultLocale, pathname);

  return {
    canonical: localePath(locale, pathname),
    languages,
  };
}
