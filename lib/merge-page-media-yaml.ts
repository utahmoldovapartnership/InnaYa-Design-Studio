type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasMediaFilename(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function preserveNestedImage(
  incoming: JsonObject | undefined,
  existing: JsonObject | undefined,
): JsonObject | undefined {
  if (!isObject(incoming) && !isObject(existing)) return incoming;
  if (!isObject(incoming)) return existing;
  if (!isObject(existing)) return incoming;

  const incomingImage = incoming.image;
  const existingImage = existing.image;

  if (hasMediaFilename(incomingImage) || !hasMediaFilename(existingImage)) {
    return incoming;
  }

  return {
    ...incoming,
    image: existingImage,
  };
}

export function mergePageMediaYaml(
  path: string,
  incoming: unknown,
  existing: unknown,
): unknown {
  if (!isObject(incoming) || !isObject(existing)) {
    return incoming;
  }

  if (path === "content/home/index.yaml") {
    const next = { ...incoming };
    if (!hasMediaFilename(incoming.heroVideo) && hasMediaFilename(existing.heroVideo)) {
      next.heroVideo = existing.heroVideo;
    }
    return next;
  }

  if (path === "content/about/index.yaml") {
    const next = { ...incoming };
    if (!hasMediaFilename(incoming.background) && hasMediaFilename(existing.background)) {
      next.background = existing.background;
    }
    return next;
  }

  if (path === "content/technologies/index.yaml") {
    const next = { ...incoming };
    const vr = preserveNestedImage(
      isObject(incoming.vr) ? incoming.vr : undefined,
      isObject(existing.vr) ? existing.vr : undefined,
    );

    if (vr) next.vr = vr;

    return next;
  }

  return incoming;
}
