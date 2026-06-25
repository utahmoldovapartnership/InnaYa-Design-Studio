import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "@/keystatic.config";
import type { ProjectImage } from "@/content/projects";

export const reader = createReader(process.cwd(), keystaticConfig);

const PORTFOLIO_PUBLIC_PATH = "/images/portfolio/";

type Locale = "en" | "uk" | "ru";

type LocaleBlock = {
  title: string;
  location: string;
  excerpt: string;
  typology: string;
  status: string;
};

type GalleryMedia =
  | {
      discriminant: "image";
      value: {
        image: string | null;
        fit: "cover" | "contain";
        orientation: "landscape" | "portrait";
        width: number | null;
        height: number | null;
      };
    }
  | {
      discriminant: "video";
      value: {
        file: string | null;
        poster: string | null;
        orientation: "landscape" | "portrait";
      };
    };

type KeystaticGalleryItem = {
  alt: string;
  media: GalleryMedia;
};

type KeystaticProject = {
  slug: string;
  area: string;
  year: string;
  en: LocaleBlock;
  uk: LocaleBlock;
  ru: LocaleBlock;
  cover: {
    image: string | null;
    alt: string;
    orientation: "landscape" | "portrait";
  };
  gallery: readonly KeystaticGalleryItem[];
};

export type Project = {
  slug: string;
  title: string;
  location: string;
  excerpt: string;
  typology: string;
  year: string;
  status?: string;
  cover: ProjectImage;
  gallery: ProjectImage[];
  area?: string;
};

function toLocale(value: string): Locale {
  if (value === "en" || value === "uk" || value === "ru") {
    return value;
  }
  return "uk";
}

function assetUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("/")) return value;
  return `${PORTFOLIO_PUBLIC_PATH}${value}`;
}

function mapGalleryItem(item: KeystaticGalleryItem): ProjectImage | null {
  const { media } = item;

  if (media.discriminant === "video") {
    const src = assetUrl(media.value.file);
    if (!src) return null;

    const image: ProjectImage = {
      src,
      alt: item.alt,
      kind: "video",
    };
    const poster = assetUrl(media.value.poster);
    if (poster) image.poster = poster;
    if (media.value.orientation === "portrait") {
      image.orientation = "portrait";
    }
    return image;
  }

  const src = assetUrl(media.value.image);
  if (!src) return null;

  const image: ProjectImage = {
    src,
    alt: item.alt,
  };
  if (media.value.orientation === "portrait") {
    image.orientation = "portrait";
  }
  if (media.value.fit === "contain") {
    image.fit = "contain";
  }
  if (media.value.width != null) {
    image.width = media.value.width;
  }
  if (media.value.height != null) {
    image.height = media.value.height;
  }
  return image;
}

function mapProject(entry: KeystaticProject, locale: Locale): Project {
  const localized = entry[locale];

  return {
    slug: entry.slug,
    title: localized.title,
    location: localized.location,
    excerpt: localized.excerpt,
    typology: localized.typology,
    year: entry.year,
    status: localized.status || undefined,
    area: entry.area || undefined,
    cover: {
      src: assetUrl(entry.cover.image) ?? "",
      alt: entry.cover.alt,
      orientation:
        entry.cover.orientation === "portrait" ? "portrait" : undefined,
    },
    gallery: entry.gallery
      .map(mapGalleryItem)
      .filter((item): item is ProjectImage => item !== null),
  };
}

export async function getAllProjects(locale: string): Promise<Project[]> {
  const loc = toLocale(locale);
  const items = await reader.collections.projects.all();
  return items.map((item) =>
    mapProject(item.entry as KeystaticProject, loc),
  );
}

export async function getProjectBySlug(
  slug: string,
  locale: string,
): Promise<Project | null> {
  const entry = (await reader.collections.projects.read(
    slug,
  )) as KeystaticProject | null;
  if (!entry) return null;
  return mapProject(entry, toLocale(locale));
}

export async function getAllProjectSlugs(): Promise<string[]> {
  return reader.collections.projects.list();
}
