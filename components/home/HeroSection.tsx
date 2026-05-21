"use client";

import { useEffect, useRef, useState } from "react";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { Link } from "@/i18n/navigation";
import type { PexelsPhoto } from "@/lib/pexels";

const IMAGE_PARALLAX = 0.4;
const CONTENT_PARALLAX = 0.25;

type Props = {
  photos: PexelsPhoto[];
  title: string;
  subtitle: string;
  cta: string;
};

export function HeroSection({ photos, title, subtitle, cta }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [sectionHeight, setSectionHeight] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    let frame = 0;

    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const progress = Math.max(0, -top);
      const max = el.offsetHeight;
      setSectionHeight(max);
      setScrollOffset(Math.min(progress, max));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [reduceMotion]);

  const fade = reduceMotion
    ? 1
    : Math.max(0, 1 - scrollOffset / (sectionHeight * 0.85 || 1));

  const mediaTransform = reduceMotion
    ? undefined
    : `translate3d(0, ${scrollOffset * IMAGE_PARALLAX}px, 0) scale(1.05)`;

  const contentTransform = reduceMotion
    ? undefined
    : `translate3d(0, ${scrollOffset * CONTENT_PARALLAX}px, 0)`;

  const scrollDown = () => {
    const next = sectionRef.current?.nextElementSibling;
    if (!next) return;
    next.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative h-[calc(100dvh-var(--header-height))] min-h-[calc(100dvh-var(--header-height))] w-full overflow-hidden"
    >
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: mediaTransform }}
      >
        <HeroCarousel photos={photos} />
        <div
          className="pointer-events-none absolute inset-0 bg-ink/30"
          aria-hidden
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-between px-5 py-16 text-center will-change-transform md:py-20"
        style={{
          transform: contentTransform,
          opacity: fade,
        }}
      >
        <div className="flex flex-1 flex-col items-center justify-center">
          <h1 className="max-w-2xl font-serif text-2xl leading-snug text-background md:text-3xl lg:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-background/90 md:text-lg">
            {subtitle}
          </p>
          <div className="pointer-events-auto mt-6">
            <Link
              href="/contact"
              className="inline-block rounded-full border border-background bg-background/10 px-5 py-2 text-sm font-medium tracking-wide text-background backdrop-blur-sm transition-colors hover:bg-background hover:text-ink md:px-6 md:py-2.5"
            >
              {cta}
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={scrollDown}
          aria-label="Scroll to content"
          className="pointer-events-auto shrink-0 text-background/80 transition-colors hover:text-background animate-hero-arrow"
        >
          <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m0 0 6.75-6.75M12 19.5 5.25 12.75"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
