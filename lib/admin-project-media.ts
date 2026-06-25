import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import type { Project } from "@/lib/projects";

export type GalleryMediaPreview = {
  alt: string;
  thumb: string | null;
  preview: string | null;
  kind: "image" | "video";
};

export type ProjectMediaPreview = {
  slug: string;
  title: string;
  cover: string | null;
  gallery: GalleryMediaPreview[];
};

function mapGalleryPreviews(
  gallery: Project["gallery"],
): GalleryMediaPreview[] {
  return gallery.map((item) => {
    const isVideo = item.kind === "video";
    const preview = isVideo
      ? item.poster ?? null
      : item.src || null;

    return {
      alt: item.alt,
      thumb: preview,
      preview,
      kind: isVideo ? "video" : "image",
    };
  });
}

function mapProjectPreview(project: Project): ProjectMediaPreview {
  return {
    slug: project.slug,
    title: project.title,
    cover: project.cover.src || null,
    gallery: mapGalleryPreviews(project.gallery),
  };
}

export async function getProjectMediaPreview(
  slug: string,
): Promise<ProjectMediaPreview | null> {
  const project = await getProjectBySlug(slug, "en");
  if (!project) return null;
  return mapProjectPreview(project);
}

export async function getAllProjectMediaPreviews(): Promise<
  ProjectMediaPreview[]
> {
  const projects = await getAllProjects("en");
  return projects.map((project) => ({
    slug: project.slug,
    title: project.title,
    cover: project.cover.src || null,
    gallery: mapGalleryPreviews(project.gallery),
  }));
}
