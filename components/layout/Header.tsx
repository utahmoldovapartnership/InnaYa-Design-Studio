"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";

const links = [
  { key: "home" as const, href: "/" },
  { key: "about" as const, href: "/about" },
  { key: "services" as const, href: "/services" },
  { key: "portfolio" as const, href: "/portfolio" },
  { key: "contact" as const, href: "/contact" },
];

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isPortfolioDetailPage = /^\/portfolio\/[^/]+$/.test(pathname);
  const isDarkNavPage =
    pathname === "/services" ||
    pathname.endsWith("/services") ||
    pathname === "/portfolio" ||
    pathname.endsWith("/portfolio") ||
    pathname === "/contact" ||
    pathname.endsWith("/contact");
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isPortfolioDetailPage) {
      document.documentElement.style.setProperty("--header-height", "0px");
      return;
    }

    const el = headerRef.current;
    if (!el) return;

    const syncHeight = () => {
      document.documentElement.style.setProperty(
        "--header-height",
        `${el.offsetHeight}px`,
      );
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isPortfolioDetailPage, open]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (isPortfolioDetailPage) {
    return null;
  }

  return (
    <header
      ref={headerRef}
      className="relative z-50"
    >
      <div className="px-5 py-4 md:px-8">
        <div className="mx-auto flex w-full min-w-0 max-w-[1200px] items-center justify-between gap-4 lg:gap-6">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center self-center"
            onClick={() => setOpen(false)}
          >
            <Image
              src="/images/innaya-logo.png?v=4"
              alt={t("brand")}
              width={1024}
              height={512}
              unoptimized
              className={`h-20 w-auto max-w-none shrink-0 object-contain md:h-32 ${isDarkNavPage ? "" : "invert"}`}
              priority
            />
          </Link>

          <nav
            className="hidden min-w-0 shrink items-center gap-3 md:flex lg:gap-6"
            aria-label="Main"
          >
            {links.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                className={`shrink-0 py-1 text-xs font-bold uppercase tracking-wide underline underline-offset-4 transition-colors duration-200 lg:text-sm ${
                  isDarkNavPage
                    ? "text-ink hover:text-ink/60"
                    : "text-white hover:text-white/60"
                }`}
              >
                {t(key)}
              </Link>
            ))}
            <LocaleSwitcher tone={isDarkNavPage ? "dark" : "light"} />
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <LocaleSwitcher tone={isDarkNavPage ? "dark" : "light"} />
            <button
              type="button"
              className={`p-2 transition-opacity hover:opacity-80 ${
                isDarkNavPage ? "text-ink" : "text-white"
              }`}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? t("closeMenu") : t("menu")}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <HiX className="h-5 w-5" aria-hidden />
              ) : (
                <HiMenu className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="animate-mobile-nav-overlay fixed inset-0 z-[60] flex flex-col bg-white md:hidden"
          aria-label="Mobile"
        >
          <div className="shrink-0 px-5 py-4">
            <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-6">
              <Link
                href="/"
                className="inline-flex shrink-0 items-center self-center"
                onClick={() => setOpen(false)}
              >
                <Image
                  src="/images/innaya-logo.png?v=4"
                  alt={t("brand")}
                  width={1024}
                  height={512}
                  unoptimized
                  className="h-20 w-auto max-w-none shrink-0 object-contain"
                  priority
                />
              </Link>

              <div className="flex items-center gap-2">
                <LocaleSwitcher tone="dark" />
                <button
                  type="button"
                  className="p-2 text-ink transition-opacity hover:opacity-80"
                  aria-label={t("closeMenu")}
                  onClick={() => setOpen(false)}
                >
                  <HiX className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </div>
          </div>

          <nav
            className="flex flex-1 flex-col items-center justify-center px-5 pb-20"
            aria-label="Mobile links"
          >
            <ul className="flex flex-col items-center gap-7 text-center">
              {links.map(({ key, href }, index) => (
                <li
                  key={key}
                  className="animate-mobile-nav-item"
                  style={{ animationDelay: `${140 + index * 75}ms` }}
                >
                  <Link
                    href={href}
                    className="block py-1 text-2xl font-bold uppercase tracking-wide text-ink underline underline-offset-8 transition-colors duration-200 hover:text-ink/60"
                    onClick={() => setOpen(false)}
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
