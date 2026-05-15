import { cache } from "react";

export type PexelsPhoto = {
  id: number;
  src: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
};

const SEARCHES: { query: string; color?: string }[] = [
  { query: "warm minimalist living room interior", color: "brown" },
  { query: "beige bedroom interior design natural light", color: "brown" },
  { query: "japandi kitchen interior warm", color: "orange" },
  { query: "tan sofa modern apartment interior", color: "brown" },
  { query: "scandinavian interior warm wood furniture", color: "yellow" },
  { query: "luxury neutral living room interior", color: "brown" },
];

async function fetchSearch(
  query: string,
  color: string | undefined,
  key: string,
): Promise<PexelsPhoto[]> {
  const params = new URLSearchParams({
    query,
    per_page: "10",
    orientation: "landscape",
  });
  if (color) params.set("color", color);

  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: { Authorization: key },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return [];
  const data = (await res.json()) as {
    photos?: Array<{
      id: number;
      alt?: string;
      photographer: string;
      photographer_url: string;
      src?: { large2x?: string; large?: string; original?: string };
    }>;
  };

  return (data.photos ?? []).map((p) => ({
    id: p.id,
    src: p.src?.large2x ?? p.src?.large ?? p.src?.original ?? "",
    alt: p.alt?.trim() || "Interior photograph",
    photographer: p.photographer,
    photographerUrl: p.photographer_url,
  }));
}

export async function getCuratedInteriorPhotos(
  max = 16,
): Promise<PexelsPhoto[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return [];

  const byId = new Map<number, PexelsPhoto>();

  for (const { query, color } of SEARCHES) {
    if (byId.size >= max) break;
    const batch = await fetchSearch(query, color, key);
    for (const photo of batch) {
      if (!photo.src) continue;
      byId.set(photo.id, photo);
      if (byId.size >= max) break;
    }
  }

  return [...byId.values()].slice(0, max);
}

export const getCachedInteriorPhotos = cache(() => getCuratedInteriorPhotos(16));
