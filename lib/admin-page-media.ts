import { reader } from "@/lib/projects";
import { pageAssetUrl } from "@/lib/page-media-url";

export type PageId = "home" | "about" | "technologies";

export type PageMediaPreview = {
  page: PageId;
  heroVideo: string | null;
  aboutBackground: string | null;
  vrImage: string | null;
};

export async function getPageMediaPreview(
  page: PageId,
): Promise<PageMediaPreview> {
  const preview: PageMediaPreview = {
    page,
    heroVideo: null,
    aboutBackground: null,
    vrImage: null,
  };

  if (page === "home") {
    const entry = (await reader.singletons.home.read()) as {
      heroVideo?: string | null;
    } | null;
    preview.heroVideo = pageAssetUrl(entry?.heroVideo);
    return preview;
  }

  if (page === "about") {
    const entry = (await reader.singletons.about.read()) as {
      background?: string | null;
    } | null;
    preview.aboutBackground = pageAssetUrl(entry?.background);
    return preview;
  }

  const entry = (await reader.singletons.technologies.read()) as {
    vr?: { image?: string | null } | null;
  } | null;
  preview.vrImage = pageAssetUrl(entry?.vr?.image);
  return preview;
}
