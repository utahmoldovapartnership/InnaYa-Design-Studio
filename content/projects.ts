export type ProjectImageOrientation = "portrait" | "landscape";

export type ProjectImage = {
  src: string;
  alt: string;
  kind?: "image" | "video";
  /** Still used as the portfolio grid thumbnail when kind is video. */
  poster?: string;
  orientation?: ProjectImageOrientation;
  /** Show the full image at gallery width without cropping. */
  fit?: "cover" | "contain";
  width?: number;
  height?: number;
};

export function isPortraitMedia(item: ProjectImage) {
  return item.orientation === "portrait";
}

export function coverAspectClass(cover: ProjectImage) {
  return isPortraitMedia(cover) ? "aspect-[3/4]" : "aspect-[4/3]";
}
