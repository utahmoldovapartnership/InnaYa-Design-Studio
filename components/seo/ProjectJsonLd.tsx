import type { Project } from "@/lib/projects";
import { getSiteUrl } from "@/lib/site-url";

type Props = {
  locale: string;
  project: Project;
};

export function ProjectJsonLd({ locale, project }: Props) {
  const siteUrl = getSiteUrl();
  const image = project.cover.src.startsWith("http")
    ? project.cover.src
    : `${siteUrl}${project.cover.src}`;

  const data = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.excerpt,
    image,
    dateCreated: project.year,
    contentLocation: {
      "@type": "Place",
      name: project.location,
    },
    url: `${siteUrl}/${locale}/portfolio/${project.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
