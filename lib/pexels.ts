import { cache } from "react";

export type PexelsPhoto = {
  id: number;
  src: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
};

function pexelsSrc(id: number): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1920`;
}

function pexelsPhoto(
  id: number,
  alt: string,
  photographer = "Pexels",
): PexelsPhoto {
  return {
    id,
    src: pexelsSrc(id),
    alt,
    photographer,
    photographerUrl: `https://www.pexels.com/photo/${id}/`,
  };
}

/** Curated warm interior photos — static CDN URLs, no API key required. */
const CURATED_INTERIOR_PHOTOS: PexelsPhoto[] = [
  pexelsPhoto(1571460, "Warm minimalist living room with neutral tones"),
  pexelsPhoto(2079249, "Bright living space with natural light"),
  pexelsPhoto(276724, "Cozy interior with soft furnishings"),
  pexelsPhoto(1918291, "Serene bedroom with warm bedding"),
  pexelsPhoto(1080721, "Elegant living room with classic details"),
  pexelsPhoto(2121121, "Modern kitchen with clean lines"),
  pexelsPhoto(3765043, "Neutral living room with layered textures"),
  pexelsPhoto(439391, "Sunlit interior with wooden accents"),
  pexelsPhoto(1648776, "Contemporary living area with muted palette"),
  pexelsPhoto(1457842, "Refined interior with warm lighting"),
  pexelsPhoto(5824908, "Scandinavian-style room with natural wood"),
  pexelsPhoto(259588, "Inviting living space with soft decor"),
  pexelsPhoto(6585750, "Minimal apartment interior in warm neutrals"),
  pexelsPhoto(534151, "Stylish lounge with beige and cream tones"),
  pexelsPhoto(534174, "Calm residential interior with ambient light"),
  pexelsPhoto(5824497, "Modern home interior with open layout"),
];

export async function getCuratedInteriorPhotos(
  max = 16,
): Promise<PexelsPhoto[]> {
  return CURATED_INTERIOR_PHOTOS.slice(0, max);
}

export const getCachedInteriorPhotos = cache(() => getCuratedInteriorPhotos(16));
