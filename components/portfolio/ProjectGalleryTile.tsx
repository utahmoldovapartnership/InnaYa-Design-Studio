"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

type Props = {
  children: ReactNode;
  label: string;
  onOpen: () => void;
};

export function ProjectGalleryTile({ children, label, onOpen }: Props) {
  const t = useTranslations("portfolio.detail");

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group/tile block w-full cursor-zoom-in text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-2"
      aria-label={`${t("viewImage")}: ${label}`}
    >
      {children}
    </button>
  );
}
