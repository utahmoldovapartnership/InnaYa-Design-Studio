"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PexelsPhoto } from "@/lib/pexels";

const PARALLAX_FACTOR = 0.35;
const IMAGE_SCALE = 1.08;

type Props = {
  photo?: PexelsPhoto | null;
  alt?: string;
  sizes: string;
  priority?: boolean;
  aspectClass?: string;
  className?: string;
};

export function ParallaxInteriorImage({
  photo,
  alt,
  sizes,
  priority,
  aspectClass = "min-h-[42vh] md:min-h-[52vh]",
  className = "",
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
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

  const mediaTransform = reduceMotion
    ? undefined
    : `translate3d(0, ${scrollOffset * PARALLAX_FACTOR}px, 0) scale(${IMAGE_SCALE})`;

  return (
    <section
      ref={sectionRef}
      className={`overflow-hidden border-y border-accent/50 ${className}`}
    >
      <div className={`relative overflow-hidden ${aspectClass}`}>
        {!photo?.src ? (
          <div className="h-full w-full bg-accent/70" aria-hidden />
        ) : (
          <figure className="absolute inset-0">
            <div
              className="absolute inset-0 will-change-transform motion-reduce:transform-none"
              style={{ transform: mediaTransform }}
            >
              <Image
                src={photo.src}
                alt={alt ?? photo.alt}
                fill
                className="object-cover"
                sizes={sizes}
                priority={priority}
              />
            </div>
          </figure>
        )}
      </div>
    </section>
  );
}
