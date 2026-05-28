"use client";

import { useTranslations } from "next-intl";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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

function findScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current) {
    const style = window.getComputedStyle(current);
    if (/(auto|scroll)/.test(style.overflowY)) return current;
    current = current.parentElement;
  }
  return null;
}

function useDesktopGallery() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 768px)").matches;
  });

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

  const displayGallery: GalleryItem[] = useMemo(() => {
    if (isDesktop) return repeatedGallery;
    return baseGallery.map((photo, realIndex) => ({
      photo,
      realIndex,
      renderIndex: realIndex,
    }));
  }, [isDesktop, repeatedGallery, baseGallery]);

  useEffect(() => {
    hasInitializedLoopRef.current = false;
  }, [isDesktop, validCount]);

  useLayoutEffect(() => {
    const items = itemRefs.current.filter((node): node is HTMLDivElement => !!node);
    if (items.length === 0) return;

    const scrollRoot = isDesktop ? findScrollParent(railRef.current) : null;

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
        root: scrollRoot,
        threshold: [0.3, 0.5, 0.7, 0.9],
      },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [displayGallery, isDesktop]);

  useLayoutEffect(() => {
    if (!isDesktop) return;

    let cancelled = false;
    let attachedScrollParent: HTMLElement | null = null;

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

    const setup = () => {
      if (cancelled) return;

      const rail = railRef.current;
      const scrollParent = findScrollParent(rail);
      if (!rail || !scrollParent) {
        requestAnimationFrame(setup);
        return;
      }

      const firstItem = itemRefs.current[0];
      const secondCycleFirstItem = itemRefs.current[validCount];
      if (!firstItem || !secondCycleFirstItem) {
        requestAnimationFrame(setup);
        return;
      }

      const cycleHeight = secondCycleFirstItem.offsetTop - firstItem.offsetTop;
      if (cycleHeight <= 0) {
        requestAnimationFrame(setup);
        return;
      }

      scrollParentRef.current = scrollParent;
      cycleHeightRef.current = cycleHeight;

      if (!hasInitializedLoopRef.current) {
        scrollParent.scrollTop += cycleHeight;
        hasInitializedLoopRef.current = true;
      }

      attachedScrollParent?.removeEventListener("scroll", onScroll);
      attachedScrollParent = scrollParent;
      attachedScrollParent.addEventListener("scroll", onScroll, { passive: true });
    };

    setup();

    return () => {
      cancelled = true;
      attachedScrollParent?.removeEventListener("scroll", onScroll);
    };
  }, [isDesktop, displayGallery, validCount]);

  const scrollToImage = (index: number) => {
    const targetIndex = isDesktop ? validCount + index : index;
    itemRefs.current[targetIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
                    onClick={() => scrollToImage(index)}
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
