"use client";

import { useLocale } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const labels: Record<string, string> = {
  en: "EN",
  uk: "УК",
  ru: "РУ",
};

type Props = {
  tone?: "light" | "dark";
};

export function LocaleSwitcher({ tone = "light" }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectLocale = (loc: string) => {
    setOpen(false);
    if (loc !== locale) router.replace(pathname, { locale: loc });
  };

  const isDark = tone === "dark";

  return (
    <div ref={rootRef} className="relative flex items-center">
      <button
        type="button"
        aria-label="Language"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={`flex cursor-pointer items-center gap-1 bg-transparent py-0 text-sm leading-none font-bold tracking-wide transition-opacity hover:opacity-80 focus:outline-none ${
          isDark ? "text-ink" : "text-white"
        }`}
      >
        <span className="inline-flex min-w-[2.5ch] justify-center leading-none">
          {labels[locale] ?? locale.toUpperCase()}
        </span>
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""} ${
            isDark ? "text-ink" : "text-white"
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Language"
          className="absolute top-full right-0 z-50 mt-3 flex items-center gap-2"
        >
          {routing.locales.map((loc, index) => (
            <li key={loc} role="presentation" className="flex items-center gap-2">
              <button
                type="button"
                role="option"
                aria-selected={locale === loc}
                onClick={() => selectLocale(loc)}
                className={`text-sm leading-none font-bold tracking-wide transition-opacity ${
                  locale === loc
                    ? "opacity-100"
                    : "opacity-70 hover:opacity-100"
                } ${isDark ? "text-ink" : "text-white"}`}
              >
                {labels[loc] ?? loc.toUpperCase()}
              </button>
              {index < routing.locales.length - 1 ? (
                <span className={isDark ? "text-ink/50" : "text-white/50"} aria-hidden>
                  /
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
