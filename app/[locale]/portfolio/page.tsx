import { getTranslations } from "next-intl/server";
import { PinnedSocialLinks } from "@/components/layout/PinnedSocialLinks";
import { InteriorImage } from "@/components/ui/InteriorImage";
import { coverAspectClass } from "@/content/projects";
import { Link } from "@/i18n/navigation";
import { getAllProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portfolio" });
  const meta = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: meta("description"),
  };
}

export default async function PortfolioIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const projects = await getAllProjects(locale);

  return (
    <>
      <div className="px-5 pt-10">
        <div className="-translate-y-[calc(var(--header-height)/4)] transform">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {projects.map((project, index) => {
              const locationLabel =
                project.location.split("—").pop()?.trim() ?? project.location;
              const area = project.area;

              return (
                <Link
                  key={project.slug}
                  href={`/portfolio/${project.slug}`}
                  className="group relative block"
                >
                  <InteriorImage
                    photo={project.cover}
                    alt={project.title}
                    aspectClass={coverAspectClass(project.cover)}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="relative rounded-sm"
                    colorOnHover
                    priority={index < 2}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 rounded-sm bg-black/25"
                    aria-hidden
                  />
                  <div className="pointer-events-none absolute bottom-6 left-7 md:bottom-8 md:left-8">
                    <h2 className="text-[clamp(0.95rem,0.85vw+0.72rem,1.55rem)] font-semibold leading-[1.1] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]">
                      {project.title}
                    </h2>
                    <div className="mt-1 flex items-center gap-1.5 text-[clamp(0.72rem,0.35vw+0.62rem,1rem)] font-medium leading-none text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">
                      {area ? <span>{area} m²</span> : null}
                      <span>{locationLabel}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <PinnedSocialLinks />
    </>
  );
}
