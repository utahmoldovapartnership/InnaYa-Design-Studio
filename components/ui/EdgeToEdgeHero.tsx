import type { ReactNode } from "react";

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
  return (
    <section
      className={`hero-edge-section relative -mt-[var(--header-height)] min-h-[100svh] min-h-[100dvh] w-full ${className}`.trim()}
    >
      <div className="hero-fixed-backdrop" aria-hidden>
        {media}
        <div className="absolute inset-0 bg-ink/55" />
      </div>
      <div className="relative z-10 min-h-[100svh] min-h-[100dvh]">{children}</div>
    </section>
  );
}
