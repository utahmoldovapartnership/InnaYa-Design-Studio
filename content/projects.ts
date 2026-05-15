export const projectList = [
  { slug: "lakeside-retreat" },
  { slug: "urban-atelier" },
  { slug: "soft-hotel-suite" },
  { slug: "residential-loft" },
] as const;

export type ProjectSlug = (typeof projectList)[number]["slug"];

export function getProjectBySlug(slug: string) {
  return projectList.find((p) => p.slug === slug);
}
