import { reader } from "@/lib/projects";
import { pageAssetUrl } from "@/lib/page-media-url";

export type PageId = "home" | "about" | "technologies";

export type TechSectionMediaPreview = {
  src: string | null;
  enTitle: string;
  ukTitle: string;
};

export type PageMediaPreview = {
  page: PageId;
  heroVideo: string | null;
  aboutBackground: string | null;
  vrImage: string | null;
  sectionImages: TechSectionMediaPreview[];
};

export async function getPageMediaPreview(
  page: PageId,
): Promise<PageMediaPreview> {
  const preview: PageMediaPreview = {
    page,
    heroVideo: null,
    aboutBackground: null,
    vrImage: null,
    sectionImages: [],
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
    sections?: ReadonlyArray<{
      image?: string | null;
      en?: { title?: string | null } | null;
      uk?: { title?: string | null } | null;
    } | null> | null;
  } | null;
  preview.vrImage = pageAssetUrl(entry?.vr?.image);
  preview.sectionImages = (entry?.sections ?? []).map((section) => ({
    src: pageAssetUrl(section?.image),
    enTitle: section?.en?.title?.trim() ?? "",
    ukTitle: section?.uk?.title?.trim() ?? "",
  }));
  return preview;
}
