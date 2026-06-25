export type GalleryMediaValue = {
  image?: string | null;
  file?: string | null;
  poster?: string | null;
  fit?: string;
  orientation?: string;
  width?: number | null;
  height?: number | null;
};

export type GalleryItem = {
  alt?: string;
  media?: {
    discriminant?: string;
    value?: GalleryMediaValue;
  };
};

export type ProjectYaml = {
  cover?: {
    image?: string | null;
    alt?: string;
    orientation?: string;
  };
  gallery?: GalleryItem[];
};

function mergeGalleryItem(
  incoming: GalleryItem,
  existing: GalleryItem | undefined,
): GalleryItem {
  if (!existing?.media?.value || !incoming.media?.value) {
    return incoming;
  }

  if (incoming.media.discriminant !== existing.media.discriminant) {
    return incoming;
  }

  const inValue = incoming.media.value;
  const exValue = existing.media.value;

  if (incoming.media.discriminant === "image") {
    if (!inValue.image && exValue.image) {
      return {
        ...incoming,
        media: {
          ...incoming.media,
          value: { ...inValue, image: exValue.image },
        },
      };
    }
    return incoming;
  }

  if (incoming.media.discriminant === "video") {
    const nextValue = { ...inValue };
    if (!nextValue.file && exValue.file) {
      nextValue.file = exValue.file;
    }
    if (!nextValue.poster && exValue.poster) {
      nextValue.poster = exValue.poster;
    }
    return {
      ...incoming,
      media: {
        ...incoming.media,
        value: nextValue,
      },
    };
  }

  return incoming;
}

export function mergeProjectMedia(
  incoming: ProjectYaml,
  existing: ProjectYaml,
): ProjectYaml {
  const merged: ProjectYaml = { ...incoming };

  if (incoming.cover || existing.cover) {
    merged.cover = { ...existing.cover, ...incoming.cover };
    if (!incoming.cover?.image && existing.cover?.image) {
      merged.cover = { ...merged.cover, image: existing.cover.image };
    }
  }

  const incomingGallery = incoming.gallery;
  const existingGallery = existing.gallery;

  if (Array.isArray(existingGallery) && existingGallery.length > 0) {
    if (!Array.isArray(incomingGallery) || incomingGallery.length === 0) {
      merged.gallery = existingGallery;
    } else {
      merged.gallery = incomingGallery.map((item, index) =>
        mergeGalleryItem(item, existingGallery[index]),
      );
      if (existingGallery.length > incomingGallery.length) {
        merged.gallery.push(...existingGallery.slice(incomingGallery.length));
      }
    }
  }

  return merged;
}

export function isProjectYamlPath(filePath: string): boolean {
  return (
    filePath.startsWith("content/projects/") && filePath.endsWith(".yaml")
  );
}
