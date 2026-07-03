import { reader } from "@/lib/projects";
import { pageAssetUrl } from "@/lib/page-media-url";

export type PageId = "home" | "about" | "technologies";

export type PageMediaPreview = {
  page: PageId;
  heroVideo: string | null;
  aboutBackground: string | null;
  revitImage: string | null;
  vrImage: string | null;
};

export async function getPageMediaPreview(
  page: PageId,
): Promise<PageMediaPreview> {
  const preview: PageMediaPreview = {
    page,
    heroVideo: null,
    aboutBackground: null,
    revitImage: null,
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
    revit?: { image?: string | null } | null;
    vr?: { image?: string | null } | null;
  } | null;
  preview.revitImage = pageAssetUrl(entry?.revit?.image);
  preview.vrImage = pageAssetUrl(entry?.vr?.image);
  return preview;
}
