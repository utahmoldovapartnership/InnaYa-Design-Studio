"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { InteriorImage } from "@/components/ui/InteriorImage";
import type { PexelsPhoto } from "@/lib/pexels";

type Props = {
  gallery: Array<PexelsPhoto | null>;
};

type GalleryItem = {
  photo: PexelsPhoto | null;
  realIndex: number;
  renderIndex: number;
};

const SCROLL_ANCHOR_OFFSET = 32;
/** Only jump between duplicate cycles near the seam, not while viewing last images in the middle set. */
const LOOP_EDGE_PX = 120;

function findScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current) {
    const style = window.getComputedStyle(current);
    if (/(auto|scroll)/.test(style.overflowY)) return current;
    current = current.parentElement;
  }
  return null;
}

function getItemTopInScrollParent(
  item: HTMLElement,
  scrollParent: HTMLElement,
): number {
  const parentRect = scrollParent.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  return itemRect.top - parentRect.top + scrollParent.scrollTop;
}

function useDesktopGallery() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

export function ProjectImageRail({ gallery }: Props) {
  const t = useTranslations("portfolio.detail");
  const isDesktop = useDesktopGallery();
  const [activeIndex, setActiveIndex] = useState(0);
  const railRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollParentRef = useRef<HTMLElement | null>(null);
  const cycleHeightRef = useRef(0);
  const cycleStartScrollRef = useRef(0);
  const itemOffsetsRef = useRef<number[]>([]);
  const isAdjustingScrollRef = useRef(false);
  const isScrollingToDotRef = useRef(false);
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

  const displayGallery: GalleryItem[] = useMemo(() => {
    if (isDesktop) return repeatedGallery;
    return baseGallery.map((photo, realIndex) => ({
      photo,
      realIndex,
      renderIndex: realIndex,
    }));
  }, [isDesktop, repeatedGallery, baseGallery]);

  const updateActiveDot = useCallback(() => {
    if (isAdjustingScrollRef.current || isScrollingToDotRef.current) return;

    const scrollParent = scrollParentRef.current;
    const cycleHeight = cycleHeightRef.current;
    const offsets = itemOffsetsRef.current;
    if (!scrollParent || cycleHeight <= 0 || offsets.length === 0) return;

    const posInCycle =
      ((scrollParent.scrollTop - cycleStartScrollRef.current) % cycleHeight +
        cycleHeight) %
      cycleHeight;
    const anchor = posInCycle + SCROLL_ANCHOR_OFFSET;

    let nextIndex = 0;
    for (let i = 0; i < offsets.length; i++) {
      if (offsets[i] <= anchor + 1) {
        nextIndex = i;
      }
    }

    setActiveIndex((prev) => (prev === nextIndex ? prev : nextIndex));
  }, []);

  useLayoutEffect(() => {
    if (!isDesktop) {
      hasInitializedLoopRef.current = false;
      itemOffsetsRef.current = [];
      cycleHeightRef.current = 0;
      return;
    }

    let cancelled = false;
    let attachedScrollParent: HTMLElement | null = null;
    let dotRaf = 0;

    const scheduleActiveDotUpdate = () => {
      if (dotRaf) return;
      dotRaf = requestAnimationFrame(() => {
        dotRaf = 0;
        updateActiveDot();
      });
    };

    const onScroll = () => {
      const current = scrollParentRef.current;
      const loopHeight = cycleHeightRef.current;

      if (
        !isAdjustingScrollRef.current &&
        !isScrollingToDotRef.current &&
        current &&
        loopHeight > 0
      ) {
        const relativeY = current.scrollTop - cycleStartScrollRef.current;

        if (relativeY > loopHeight - LOOP_EDGE_PX) {
          isAdjustingScrollRef.current = true;
          current.scrollTop -= loopHeight;
          requestAnimationFrame(() => {
            isAdjustingScrollRef.current = false;
            updateActiveDot();
          });
          return;
        }

        if (relativeY < -LOOP_EDGE_PX) {
          isAdjustingScrollRef.current = true;
          current.scrollTop += loopHeight;
          requestAnimationFrame(() => {
            isAdjustingScrollRef.current = false;
            updateActiveDot();
          });
          return;
        }
      }

      scheduleActiveDotUpdate();
    };

    const setup = () => {
      if (cancelled) return;

      const rail = railRef.current;
      const scrollParent = findScrollParent(rail);
      if (!rail || !scrollParent) {
        requestAnimationFrame(setup);
        return;
      }

      const firstCycleStart = itemRefs.current[0];
      const middleCycleStart = itemRefs.current[validCount];
      if (!firstCycleStart || !middleCycleStart) {
        requestAnimationFrame(setup);
        return;
      }

      const firstTop = getItemTopInScrollParent(firstCycleStart, scrollParent);
      const middleTop = getItemTopInScrollParent(middleCycleStart, scrollParent);
      const cycleHeight = middleTop - firstTop;
      if (cycleHeight <= 0) {
        requestAnimationFrame(setup);
        return;
      }

      scrollParentRef.current = scrollParent;
      cycleHeightRef.current = cycleHeight;

      itemOffsetsRef.current = Array.from({ length: validCount }, (_, i) => {
        const el = itemRefs.current[validCount + i];
        if (!el) return 0;
        return getItemTopInScrollParent(el, scrollParent) - middleTop;
      });

      if (!hasInitializedLoopRef.current) {
        const startScrollTop = middleTop - SCROLL_ANCHOR_OFFSET;
        scrollParent.scrollTop = startScrollTop;
        cycleStartScrollRef.current = startScrollTop;
        hasInitializedLoopRef.current = true;
      }

      updateActiveDot();

      attachedScrollParent?.removeEventListener("scroll", onScroll);
      attachedScrollParent = scrollParent;
      attachedScrollParent.addEventListener("scroll", onScroll, { passive: true });
    };

    hasInitializedLoopRef.current = false;
    setup();

    return () => {
      cancelled = true;
      if (dotRaf) cancelAnimationFrame(dotRaf);
      attachedScrollParent?.removeEventListener("scroll", onScroll);
    };
  }, [isDesktop, displayGallery, validCount, updateActiveDot]);

  const scrollToImage = (index: number) => {
    const scrollParent =
      scrollParentRef.current ?? findScrollParent(railRef.current);
    const offsets = itemOffsetsRef.current;
    if (!scrollParent || index < 0 || index >= offsets.length) return;

    setActiveIndex(index);
    isScrollingToDotRef.current = true;

    scrollParent.scrollTo({
      top: Math.max(0, cycleStartScrollRef.current + offsets[index]!),
      behavior: "smooth",
    });

    window.setTimeout(() => {
      isScrollingToDotRef.current = false;
      updateActiveDot();
    }, 700);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section ref={railRef} className="pr-1">
      <div className="md:grid md:grid-cols-[24px_minmax(0,1fr)] md:gap-4">
        <div className="relative hidden md:block">
          <div className="sticky top-1/2 z-10 -translate-y-1/2">
            <div className="flex flex-col items-center gap-1.5">
              {Array.from({ length: validCount }, (_, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={`dot-${index}`}
                    type="button"
                    aria-label={`Go to image ${index + 1}`}
                    onClick={() => scrollToImage(index)}
                    className="grid h-6 w-6 place-items-center rounded-full transition-colors hover:bg-ink/5"
                  >
                    <span
                      className={`rounded-full transition-all duration-300 ease-out ${
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

        <div className="flex flex-col">
          <div className="grid grid-cols-1 gap-4">
            {displayGallery.map(({ photo, realIndex, renderIndex }) => (
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
                  priority={
                    isDesktop
                      ? renderIndex >= validCount && renderIndex < validCount + 2
                      : renderIndex < 2
                  }
                />
              </div>
            ))}
          </div>

          {!isDesktop ? (
            <button
              type="button"
              onClick={scrollToTop}
              className="mt-6 w-full text-left text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-ink md:hidden"
            >
              &uarr; {t("backToTop")}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
