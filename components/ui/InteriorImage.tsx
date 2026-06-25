import Image from "next/image";
import { isPortraitMedia, type ProjectImage } from "@/content/projects";

type Props = {
  photo?: ProjectImage | null;
  alt?: string;
  className?: string;
  sizes: string;
  priority?: boolean;
  aspectClass?: string;
  showCredit?: boolean;
  /** Grayscale until parent `.group` is hovered (portfolio grid). */
  colorOnHover?: boolean;
};

function isVideo(photo: ProjectImage) {
  return photo.kind === "video" || /\.(mp4|webm)(\?|$)/i.test(photo.src);
}

export function InteriorImage({
  photo,
  alt,
  className = "",
  sizes,
  priority,
  aspectClass = "aspect-[4/3]",
  showCredit,
  colorOnHover = false,
}: Props) {
  if (!photo?.src) {
    return (
      <div
        className={`bg-accent/70 ${aspectClass} ${className}`}
        aria-hidden
      />
    );
  }

  const zoomWrapperClass = colorOnHover
    ? "transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
    : "transition-transform duration-500 ease-out motion-safe:hover:scale-[1.02]";

  const mediaFilterClass = colorOnHover
    ? "grayscale transition-[filter] duration-500 group-hover:grayscale-0"
    : "";

  const label = alt ?? photo.alt;
  const portrait = isPortraitMedia(photo);
  const videoFitClass = portrait ? "object-contain" : "object-cover";

  if (isVideo(photo)) {
    return (
      <figure
        className={`relative overflow-hidden bg-white ${aspectClass} ${className}`}
      >
        <div className={`absolute inset-0 ${zoomWrapperClass}`}>
          <video
            src={photo.src}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label={label}
            {...(photo.poster ? { poster: photo.poster } : {})}
            className={`h-full w-full ${videoFitClass} ${mediaFilterClass}`}
          />
        </div>
        {showCredit ? (
          <figcaption className="absolute bottom-0 left-0 right-0 bg-background/70 px-2 py-1 text-[10px] text-muted-2 backdrop-blur-sm">
            {label}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <figure className={`relative overflow-hidden ${aspectClass} ${className}`}>
      <div className={`absolute inset-0 ${zoomWrapperClass}`}>
        <Image
          src={photo.src}
          alt={label}
          fill
          className={`object-cover ${mediaFilterClass}`}
          sizes={sizes}
          priority={priority}
        />
      </div>
      {showCredit ? (
        <figcaption className="absolute bottom-0 left-0 right-0 bg-background/70 px-2 py-1 text-[10px] text-muted-2 backdrop-blur-sm">
          {label}
        </figcaption>
      ) : null}
    </figure>
  );
}
