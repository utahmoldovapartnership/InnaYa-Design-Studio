"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { InteriorImage } from "@/components/ui/InteriorImage";
import type { PexelsPhoto } from "@/lib/pexels";

type Props = {
  gallery: Array<PexelsPhoto | null>;
};

function findScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current) {
    const style = window.getComputedStyle(current);
    if (/(auto|scroll)/.test(style.overflowY)) return current;
    current = current.parentElement;
  }
  return null;
}

export function ProjectImageRail({ gallery }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const railRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollParentRef = useRef<HTMLElement | null>(null);
  const cycleHeightRef = useRef(0);
  const isAdjustingScrollRef = useRef(false);
  const hasInitializedLoopRef = useRef(false);

  const baseGallery = useMemo(() => (gallery.length > 0 ? gallery : [null]), [gallery]);
  const validCount = baseGallery.length;
  const repeatedGallery = useMemo(
    () =>
      Array.from({ length: 3 }, (_, cycle) =>
        baseGallery.map((photo, realIndex) => ({
          photo,
          realIndex,
          renderIndex: cycle * validCount + realIndex,
        })),
      ).flat(),
    [baseGallery, validCount],
  );

  useEffect(() => {
    const items = itemRefs.current.filter((node): node is HTMLDivElement => !!node);
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length === 0) return;

        const nextIndex = Number(
          visibleEntries[0].target.getAttribute("data-real-index"),
        );
        if (!Number.isNaN(nextIndex)) {
          setActiveIndex(nextIndex);
        }
      },
      {
        threshold: [0.3, 0.5, 0.7, 0.9],
      },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [repeatedGallery]);

  useEffect(() => {
    const rail = railRef.current;
    const scrollParent = findScrollParent(rail);
    if (!rail || !scrollParent) return;

    const firstItem = itemRefs.current[0];
    const secondCycleFirstItem = itemRefs.current[validCount];
    if (!firstItem || !secondCycleFirstItem) return;

    const cycleHeight = secondCycleFirstItem.offsetTop - firstItem.offsetTop;
    if (cycleHeight <= 0) return;

    scrollParentRef.current = scrollParent;
    cycleHeightRef.current = cycleHeight;

    if (!hasInitializedLoopRef.current) {
      scrollParent.scrollTop += cycleHeight;
      hasInitializedLoopRef.current = true;
    }

    const onScroll = () => {
      if (isAdjustingScrollRef.current) return;
      const current = scrollParentRef.current;
      const loopHeight = cycleHeightRef.current;
      if (!current || loopHeight <= 0) return;

      const y = current.scrollTop;
      const upperThreshold = loopHeight * 1.75;
      const lowerThreshold = loopHeight * 0.5;

      if (y > upperThreshold || y < lowerThreshold) {
        isAdjustingScrollRef.current = true;
        current.scrollTop += y > upperThreshold ? -loopHeight : loopHeight;
        requestAnimationFrame(() => {
          isAdjustingScrollRef.current = false;
        });
      }
    };

    scrollParent.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scrollParent.removeEventListener("scroll", onScroll);
    };
  }, [repeatedGallery, validCount]);

  return (
    <section ref={railRef} className="pr-1">
      <div className="md:grid md:grid-cols-[24px_minmax(0,1fr)] md:gap-4">
        <div className="hidden md:block">
          <div className="sticky top-1/2 -translate-y-1/2">
            <div className="flex flex-col items-center gap-1.5">
              {Array.from({ length: validCount }, (_, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={`dot-${index}`}
                    type="button"
                    aria-label={`Go to image ${index + 1}`}
                    onClick={() =>
                      itemRefs.current[validCount + index]?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      })
                    }
                    className="grid h-6 w-6 place-items-center rounded-full transition-colors hover:bg-ink/5"
                  >
                    <span
                      className={`rounded-full transition-all duration-300 ${
                        isActive
                          ? "h-2.5 w-2.5 bg-ink/80 shadow-[0_0_0_3px_rgba(10,10,10,0.08)]"
                          : "h-1.5 w-1.5 bg-ink/35 hover:bg-ink/55"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {repeatedGallery.map(({ photo, realIndex, renderIndex }) => (
            <div
              key={`${photo?.id ?? "placeholder"}-${renderIndex}`}
              ref={(el) => {
                itemRefs.current[renderIndex] = el;
              }}
              data-real-index={realIndex}
            >
              <InteriorImage
                photo={photo}
                aspectClass="aspect-square md:aspect-[4/3]"
                sizes="(max-width: 767px) 100vw, 50vw"
                className="rounded-sm"
                priority={renderIndex >= validCount && renderIndex < validCount + 2}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
