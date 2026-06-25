"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ProjectImage } from "@/content/projects";

type Props = {
  gallery: ProjectImage[];
  index: number | null;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
};

const MEDIA_CLASS =
  "max-h-[min(90dvh,920px)] max-w-[min(92vw,1200px)] h-auto w-auto";

function isVideo(item: ProjectImage) {
  return item.kind === "video" || /\.(mp4|webm)(\?|$)/i.test(item.src);
}

function LightboxMedia({ item }: { item: ProjectImage }) {
  const label = item.alt;

  if (!item.src) {
    return null;
  }

  if (isVideo(item)) {
    return (
      <video
        src={item.src}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-label={label}
        {...(item.poster ? { poster: item.poster } : {})}
        className={MEDIA_CLASS}
      />
    );
  }

  return (
    // Native img scales to max viewport bounds while keeping each image's aspect ratio.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.src} alt={label} className={MEDIA_CLASS} />
  );
}

export function ProjectGalleryLightbox({
  gallery,
  index,
  onClose,
  onChangeIndex,
}: Props) {
  const t = useTranslations("portfolio.detail");
  const [mounted, setMounted] = useState(false);
  const isOpen = index !== null && gallery[index] != null;
  const item = index !== null ? gallery[index] : null;
  const hasMultiple = gallery.length > 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  const goPrev = useCallback(() => {
    if (index === null || gallery.length === 0) return;
    onChangeIndex((index - 1 + gallery.length) % gallery.length);
  }, [gallery.length, index, onChangeIndex]);

  const goNext = useCallback(() => {
    if (index === null || gallery.length === 0) return;
    onChangeIndex((index + 1) % gallery.length);
  }, [gallery.length, index, onChangeIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (!hasMultiple) return;
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [goNext, goPrev, hasMultiple, isOpen, onClose]);

  if (!mounted || !isOpen || !item) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-label={t("lightboxLabel")}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/85 backdrop-blur-[2px]"
        aria-label={t("closeLightbox")}
        onClick={onClose}
      />

      <div className="pointer-events-none relative z-10 flex h-full w-full items-center justify-center p-4 md:p-8">
        <div className="pointer-events-auto">
          <LightboxMedia item={item} />
        </div>
      </div>

      {hasMultiple ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute top-1/2 left-3 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition-colors hover:bg-black/60 md:left-6 md:h-14 md:w-14"
            aria-label={t("previousImage")}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="h-5 w-5 md:h-6 md:w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute top-1/2 right-3 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition-colors hover:bg-black/60 md:right-6 md:h-14 md:w-14"
            aria-label={t("nextImage")}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="h-5 w-5 md:h-6 md:w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      ) : null}

      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition-colors hover:bg-black/60 md:top-6 md:right-6 md:h-14 md:w-14"
        aria-label={t("closeLightbox")}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className="h-5 w-5 md:h-6 md:w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {hasMultiple ? (
        <p className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 text-xs font-medium tracking-wider text-white/90 uppercase md:bottom-6 md:text-sm">
          {(index ?? 0) + 1} / {gallery.length}
        </p>
      ) : null}
    </div>,
    document.body,
  );
}
