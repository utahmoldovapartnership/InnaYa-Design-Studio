"use client";

import { useLocale } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const labels: Record<string, string> = {
  en: "EN",
  uk: "UK",
  ru: "RU",
};

export function LocaleSwitcher() {
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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Language"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-1 rounded-full border border-accent/80 bg-accent/20 py-1.5 pr-2 pl-3 text-xs font-medium tracking-wide text-ink transition-colors hover:border-accent focus:border-ink focus:outline-none"
      >
        <span>{labels[locale] ?? locale.toUpperCase()}</span>
        <svg
          className={`h-3.5 w-3.5 text-muted transition-transform ${open ? "rotate-180" : ""}`}
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
          className="absolute top-full right-0 z-50 mt-1.5 min-w-[4.5rem] overflow-hidden rounded-xl border border-accent/80 bg-background py-1 shadow-sm"
        >
          {routing.locales.map((loc) => (
            <li key={loc} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={locale === loc}
                onClick={() => selectLocale(loc)}
                className={`w-full px-3 py-1.5 text-left text-xs font-medium tracking-wide transition-colors ${
                  locale === loc
                    ? "bg-accent/40 text-ink"
                    : "text-muted hover:bg-accent/25 hover:text-ink"
                }`}
              >
                {labels[loc] ?? loc.toUpperCase()}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
