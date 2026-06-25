import Image from "next/image";
import { isPortraitMedia, type ProjectImage } from "@/content/projects";

type Props = {
  item: ProjectImage;
  alt?: string;
  sizes: string;
  priority?: boolean;
  aspectClass?: string;
  className?: string;
  /** Portrait video fills available column height; width follows aspect ratio. */
  fillViewportHeight?: boolean;
};

function isVideo(item: ProjectImage) {
  return item.kind === "video" || /\.(mp4|webm)(\?|$)/i.test(item.src);
}

export function ProjectGalleryMedia({
  item,
  alt,
  sizes,
  priority,
  aspectClass = "aspect-square md:aspect-[4/3]",
  className = "",
  fillViewportHeight = false,
}: Props) {
  const label = alt ?? item.alt;
  const portrait = isPortraitMedia(item);

  if (!item.src) {
    return (
      <figure
        className={`flex items-center justify-center bg-accent/30 ${aspectClass} ${className}`}
        aria-hidden
      />
    );
  }

  const videoProps = {
    src: item.src,
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true,
    preload: "metadata" as const,
    "aria-label": label,
    ...(item.poster ? { poster: item.poster } : {}),
  };

  if (isVideo(item)) {
    if (portrait && fillViewportHeight) {
      return (
        <figure
          className={`flex h-full min-h-0 items-center justify-center bg-white ${className}`}
        >
          <video
            {...videoProps}
            className="h-full w-auto max-w-full object-contain"
          />
        </figure>
      );
    }

    return (
      <figure
        className={`relative overflow-hidden bg-white ${aspectClass} ${className} ${
          portrait ? "mx-auto w-full max-w-sm" : ""
        }`}
      >
        <video
          {...videoProps}
          className="h-full w-full object-contain"
        />
      </figure>
    );
  }

  if (item.fit === "contain" && item.width && item.height) {
    return (
      <figure className={`w-full bg-white ${className}`}>
        <Image
          src={item.src}
          alt={label}
          width={item.width}
          height={item.height}
          className="h-auto w-full"
          sizes={sizes}
          priority={priority}
        />
      </figure>
    );
  }

  return (
    <figure
      className={`relative overflow-hidden ${aspectClass} ${className}`}
    >
      <Image
        src={item.src}
        alt={label}
        fill
        className="object-cover"
        sizes={sizes}
        priority={priority}
      />
    </figure>
  );
}
