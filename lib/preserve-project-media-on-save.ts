import fs from "fs/promises";
import yaml from "js-yaml";
import path from "path";

type GalleryImageValue = {
  image?: string | null;
  file?: string | null;
  poster?: string | null;
  fit?: string;
  orientation?: string;
  width?: number | null;
  height?: number | null;
};

type GalleryItem = {
  alt?: string;
  media?: {
    discriminant?: string;
    value?: GalleryImageValue;
  };
};

type ProjectYaml = {
  cover?: {
    image?: string | null;
    alt?: string;
    orientation?: string;
  };
  gallery?: GalleryItem[];
};

type KeystaticUpdateBody = {
  additions: Array<{ path: string; contents: string }>;
  deletions: Array<{ path: string }>;
};

function decodeContents(encoded: string): string {
  return Buffer.from(encoded, "base64url").toString("utf8");
}

function encodeContents(text: string): string {
  return Buffer.from(text, "utf8").toString("base64url");
}

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

  if (Array.isArray(incoming.gallery) && Array.isArray(existing.gallery)) {
    merged.gallery = incoming.gallery.map((item, index) =>
      mergeGalleryItem(item, existing.gallery?.[index]),
    );
  }

  return merged;
}

async function preserveProjectYamlAddition(addition: {
  path: string;
  contents: string;
}): Promise<{ path: string; contents: string }> {
  if (
    !addition.path.startsWith("content/projects/") ||
    !addition.path.endsWith(".yaml")
  ) {
    return addition;
  }

  const filePath = path.join(process.cwd(), addition.path);
  let existing: ProjectYaml | null = null;

  try {
    existing = yaml.load(await fs.readFile(filePath, "utf8")) as ProjectYaml;
  } catch {
    return addition;
  }

  const incoming = yaml.load(decodeContents(addition.contents)) as ProjectYaml;
  const merged = mergeProjectMedia(incoming, existing);

  return {
    path: addition.path,
    contents: encodeContents(yaml.dump(merged, { lineWidth: -1 })),
  };
}

export async function preserveProjectMediaInUpdateRequest(
  body: KeystaticUpdateBody,
): Promise<KeystaticUpdateBody> {
  const additions = await Promise.all(
    body.additions.map((addition) => preserveProjectYamlAddition(addition)),
  );

  return {
    ...body,
    additions,
  };
}
