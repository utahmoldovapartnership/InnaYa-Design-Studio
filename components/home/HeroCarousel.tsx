"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PexelsPhoto } from "@/lib/pexels";

const SLIDE_INTERVAL_MS = 5500;
const TRANSITION_MS = 800;

type Props = {
  photos: PexelsPhoto[];
};

export function HeroCarousel({ photos }: Props) {
  const slides = photos.filter((p) => p?.src).slice(0, 4);
  const loopSlides =
    slides.length > 1 ? [...slides, slides[0]!] : slides;

  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [slideWidth, setSlideWidth] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const resetToStart = useCallback(() => {
    setTransitionEnabled(false);
    setIndex(0);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setTransitionEnabled(true));
    });
  }, []);

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
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i < slides.length ? i + 1 : i));
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    if (!reduceMotion || slides.length <= 1 || index !== slides.length) return;
    resetToStart();
  }, [index, reduceMotion, slides.length, resetToStart]);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    if (e.propertyName !== "transform" || e.target !== trackRef.current) return;
    if (slides.length > 1 && index === slides.length) {
      resetToStart();
    }
  };

  if (slides.length === 0) {
    return (
      <div
        className="h-[calc(100dvh-var(--header-height))] min-h-[calc(100dvh-var(--header-height))] w-full bg-accent/70"
        aria-hidden
      />
    );
  }

  const offsetPx = slideWidth > 0 ? index * slideWidth : 0;
  const activeIndex = index === slides.length ? 0 : index;
  const useTransition =
    transitionEnabled && !reduceMotion && slideWidth > 0;

  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100dvh-var(--header-height))] min-h-[calc(100dvh-var(--header-height))] w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured interior photography"
    >
      <div
        ref={trackRef}
        className="flex h-full min-h-full motion-reduce:transition-none"
        style={{
          transform: `translate3d(-${offsetPx}px, 0, 0)`,
          transition: useTransition
            ? `transform ${TRANSITION_MS}ms ease-in-out`
            : "none",
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {loopSlides.map((photo, i) => (
          <figure
            key={`${photo.id}-${i}`}
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
      <p className="sr-only" aria-live="polite">
        Slide {activeIndex + 1} of {slides.length}
      </p>
    </div>
  );
}
