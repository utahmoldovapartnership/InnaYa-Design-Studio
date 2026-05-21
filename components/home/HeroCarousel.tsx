"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PexelsPhoto } from "@/lib/pexels";

const SLIDE_INTERVAL_MS = 5500;
const TRANSITION_MS = 800;

type Props = {
  photos: PexelsPhoto[];
};

export function HeroCarousel({ photos }: Props) {
  const slides = photos.filter((p) => p?.src).slice(0, 4);
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [slideWidth, setSlideWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => setSlideWidth(el.offsetWidth);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduceMotion || slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, slides.length]);

  if (slides.length === 0) {
    return (
      <div
        className="h-[calc(100dvh-var(--header-height))] min-h-[calc(100dvh-var(--header-height))] w-full bg-accent/70"
        aria-hidden
      />
    );
  }

  const offsetPx = slideWidth > 0 ? index * slideWidth : 0;

  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100dvh-var(--header-height))] min-h-[calc(100dvh-var(--header-height))] w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured interior photography"
    >
      <div
        className="flex h-full min-h-full motion-reduce:transition-none"
        style={{
          transform: `translate3d(-${offsetPx}px, 0, 0)`,
          transition: reduceMotion
            ? "none"
            : `transform ${TRANSITION_MS}ms ease-in-out`,
        }}
      >
        {slides.map((photo, i) => (
          <figure
            key={photo.id}
            className="relative h-full min-h-full w-full shrink-0 grow-0 basis-full"
            style={slideWidth > 0 ? { width: slideWidth } : undefined}
            aria-hidden={i !== index}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === 0}
            />
          </figure>
        ))}
      </div>
    </div>
  );
}
