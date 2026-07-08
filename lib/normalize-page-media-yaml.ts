const PAGE_MEDIA_PUBLIC_PATH = "/media/pages/";
const PAGE_MEDIA_REPO_PREFIX = "public/media/pages/";

export function normalizePageMediaFilename(
  value: unknown,
): string | null | undefined {
  if (value == null) return value as null | undefined;
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith(PAGE_MEDIA_PUBLIC_PATH)) {
    return trimmed.slice(PAGE_MEDIA_PUBLIC_PATH.length);
  }

  if (trimmed.startsWith(PAGE_MEDIA_REPO_PREFIX)) {
    return trimmed.slice(PAGE_MEDIA_REPO_PREFIX.length);
  }

  return trimmed;
}

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizePageMediaYaml(
  path: string,
  data: unknown,
): unknown {
  if (!isObject(data)) return data;

  if (path === "content/home/index.yaml") {
    return {
      ...data,
      heroVideo: normalizePageMediaFilename(data.heroVideo),
    };
  }

  if (path === "content/about/index.yaml") {
    return {
      ...data,
      background: normalizePageMediaFilename(data.background),
    };
  }

  if (path === "content/technologies/index.yaml") {
    const next: JsonObject = { ...data };

    if (isObject(data.vr)) {
      next.vr = {
        ...data.vr,
        image: normalizePageMediaFilename(data.vr.image),
      };
    }

    return next;
  }

  return data;
}

export function isPageSingletonYamlPath(path: string): boolean {
  return (
    path === "content/home/index.yaml" ||
    path === "content/about/index.yaml" ||
    path === "content/technologies/index.yaml"
  );
}
