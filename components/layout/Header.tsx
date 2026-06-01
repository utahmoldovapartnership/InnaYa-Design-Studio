"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/" || pathname === "";
    return pathname === href || pathname.endsWith(href);
  };
  const activeHref = links.find(({ href }) => isActiveLink(href))?.href ?? "/";
  const isPortfolioDetailPage = /^\/portfolio\/[^/]+$/.test(pathname);
  const isDarkNavPage =
    pathname === "/services" ||
    pathname.endsWith("/services") ||
    pathname === "/portfolio" ||
    pathname.endsWith("/portfolio") ||
    pathname === "/contact" ||
    pathname.endsWith("/contact");
  const [open, setOpen] = useState(false);
  const [underlineStyle, setUnderlineStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({ left: 0, width: 0, opacity: 0 });
  const headerRef = useRef<HTMLElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

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

  useLayoutEffect(() => {
    const activeLink = linkRefs.current[activeHref];
    const nav = desktopNavRef.current;

    if (!activeLink || !nav) {
      setUnderlineStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    setUnderlineStyle({
      left: activeLink.offsetLeft,
      width: activeLink.offsetWidth,
      opacity: 1,
    });
  }, [activeHref]);

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

  useEffect(() => {
    const handleResize = () => {
      const activeLink = linkRefs.current[activeHref];
      if (!activeLink) return;

      setUnderlineStyle((prev) => ({
        ...prev,
        left: activeLink.offsetLeft,
        width: activeLink.offsetWidth,
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeHref]);

  if (isPortfolioDetailPage) {
    return null;
  }

  return (
    <header
      ref={headerRef}
      className="relative z-50"
    >
      <div className="px-5 py-4 md:px-8">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-6">
          <Link
            href="/"
            className="inline-flex items-center self-center"
            onClick={() => setOpen(false)}
          >
            <Image
              src="/images/innaya-logo.png"
              alt={t("brand")}
              width={1024}
              height={512}
              className={`h-16 w-auto md:h-32 ${isDarkNavPage ? "" : "invert"}`}
              priority
            />
          </Link>

          <nav
            ref={desktopNavRef}
            className="relative hidden items-center gap-6 md:flex"
            aria-label="Main"
          >
            {links.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                ref={(el) => {
                  linkRefs.current[href] = el;
                }}
                className={`relative py-1 text-sm font-bold tracking-wide transition-colors ${
                  isDarkNavPage
                    ? "text-ink/75 hover:text-ink"
                    : "text-white/75 hover:text-white"
                } ${
                  isActiveLink(href)
                    ? isDarkNavPage
                      ? "text-ink/90"
                      : "text-white/90"
                    : ""
                }`}
              >
                {t(key)}
              </Link>
            ))}
            <span
              aria-hidden
              className={`pointer-events-none absolute bottom-0 h-px transition-all duration-350 ease-out ${
                isDarkNavPage ? "bg-ink" : "bg-white"
              }`}
              style={{
                left: `${underlineStyle.left}px`,
                width: `${underlineStyle.width}px`,
                opacity: underlineStyle.opacity,
              }}
            />
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
                className="inline-flex items-center self-center"
                onClick={() => setOpen(false)}
              >
                <Image
                  src="/images/innaya-logo.png"
                  alt={t("brand")}
                  width={1024}
                  height={512}
                  className="h-16 w-auto"
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
                    className={`block py-1 text-2xl font-bold tracking-wide transition-colors ${
                      isActiveLink(href)
                        ? "text-ink underline underline-offset-8"
                        : "text-ink/70 hover:text-ink"
                    }`}
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
