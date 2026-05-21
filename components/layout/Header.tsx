"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { Link, usePathname } from "@/i18n/navigation";
import { brandFont } from "@/lib/fonts/brand";
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
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
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
  }, [open]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-accent/60 bg-background/90 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-page items-center justify-between gap-6 px-5 py-4 md:px-8">
        <Link
          href="/"
          className={`${brandFont.className} inline-flex translate-y-0.5 items-center self-center leading-none text-base tracking-wide text-ink md:text-lg`}
          onClick={() => setOpen(false)}
        >
          {t("brand")}
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {links.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              className={`text-sm tracking-wide transition-colors hover:text-ink ${
                pathname === href ? "text-ink" : "text-muted"
              }`}
            >
              {t(key)}
            </Link>
          ))}
          <LocaleSwitcher />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <LocaleSwitcher />
          <button
            type="button"
            className="p-2 text-ink transition-colors hover:text-muted"
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

      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-accent/60 bg-background px-5 py-4 md:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-3">
            {links.map(({ key, href }) => (
              <li key={key}>
                <Link
                  href={href}
                  className={`block py-1 text-lg ${
                    pathname === href ? "text-ink" : "text-muted"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
