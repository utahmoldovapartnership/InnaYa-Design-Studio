import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getAllProjectSlugs } from "@/lib/projects";
import { getSiteUrl } from "@/lib/site-url";

const staticPaths = ["", "/about", "/contact", "/technologies", "/portfolio"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const slugs = await getAllProjectSlugs();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : path === "/portfolio" ? 0.9 : 0.8,
      });
    }

    for (const slug of slugs) {
      entries.push({
        url: `${siteUrl}/${locale}/portfolio/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
