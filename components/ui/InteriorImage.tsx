import Image from "next/image";
import type { PexelsPhoto } from "@/lib/pexels";

type Props = {
  photo?: PexelsPhoto | null;
  alt?: string;
  className?: string;
  sizes: string;
  priority?: boolean;
  aspectClass?: string;
  showCredit?: boolean;
};

export function InteriorImage({
  photo,
  alt,
  className = "",
  sizes,
  priority,
  aspectClass = "aspect-[4/3]",
  showCredit,
}: Props) {
  if (!photo?.src) {
    return (
      <div
        className={`bg-accent/70 ${aspectClass} ${className}`}
        aria-hidden
      />
    );
  }

  return (
    <figure className={`relative overflow-hidden ${aspectClass} ${className}`}>
      <Image
        src={photo.src}
        alt={alt ?? photo.alt}
        fill
        className="object-cover transition-transform duration-700 motion-safe:hover:scale-[1.02]"
        sizes={sizes}
        priority={priority}
      />
      {showCredit ? (
        <figcaption className="absolute bottom-0 left-0 right-0 bg-background/70 px-2 py-1 text-[10px] text-muted-2 backdrop-blur-sm">
          <a
            href={photo.photographerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline"
          >
            {photo.photographer} / Pexels
          </a>
        </figcaption>
      ) : null}
    </figure>
  );
}
