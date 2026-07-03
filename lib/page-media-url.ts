export const PAGE_MEDIA_PUBLIC_PATH = "/media/pages/";

export function pageAssetUrl(
  value: string | null | undefined,
): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  if (trimmed.startsWith("http") || trimmed.startsWith("/")) {
    return trimmed;
  }
  return `${PAGE_MEDIA_PUBLIC_PATH}${trimmed}`;
}
