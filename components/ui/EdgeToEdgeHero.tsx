"use client";

import { useEffect, type ReactNode } from "react";

type Props = {
  media: ReactNode;
  children: ReactNode;
  /** Extra classes on the outer section (e.g. home adds top padding for header overlap). */
  className?: string;
};

/**
 * Full-viewport hero wrapper: media fills behind Safari’s status bar and URL bar on iOS.
 * Requires `viewport-fit=cover` on the document viewport.
 */
export function EdgeToEdgeHero({ media, children, className = "" }: Props) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  return (
    <section
      className={`hero-edge-section relative -mt-[var(--header-height)] h-[100dvh] max-h-[100dvh] w-full overflow-hidden ${className}`.trim()}
    >
      <div className="hero-fixed-backdrop" aria-hidden>
        {media}
        <div className="absolute inset-0 bg-ink/55" />
      </div>
      <div className="relative z-10 flex h-full flex-col overflow-hidden">
        {children}
      </div>
    </section>
  );
}
