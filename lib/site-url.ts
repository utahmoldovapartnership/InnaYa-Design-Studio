/** Canonical production origin for sitemap, robots, and metadata. */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://innayastudio.vercel.app";
}
