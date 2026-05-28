import { getTranslations } from "next-intl/server";
import { InteriorImage } from "@/components/ui/InteriorImage";
import { projectList } from "@/content/projects";
import { getCachedInteriorPhotos } from "@/lib/pexels";
import { Link } from "@/i18n/navigation";

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
  await params;
  const tp = await getTranslations("portfolioItems");
  const photos = await getCachedInteriorPhotos();
  const projectPhotoOffsets = [2, 9, 5, 12, 1, 6];
  const totalTiles = projectList.length;
  const projectAreaBySlug: Record<string, string> = {
    "lakeside-retreat": "130",
    "urban-atelier": "95",
    "soft-hotel-suite": "72",
    "residential-loft": "118",
    "sholomitska-residence": "130",
    "riverbank-flat": "88",
  };

  return (
    <div className="px-5 pt-10 pb-16 md:px-8 md:pt-14 md:pb-24">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: totalTiles }, (_, index) => {
            const project = projectList[index];
            const projectPhoto =
              photos.length > 0
                ? photos[
                    projectPhotoOffsets[index % projectPhotoOffsets.length] %
                      photos.length
                  ] ?? null
                : null;
            const photo = projectPhoto;
            const title = tp(`${project.slug}.title`);
            const location = tp(`${project.slug}.location`);
            const locationLabel = location.split("—").pop()?.trim() ?? location;
            const area = projectAreaBySlug[project.slug] ?? "120";

            return (
              <Link
                key={project.slug}
                href={`/portfolio/${project.slug}`}
                className="group relative block"
              >
                <InteriorImage
                  photo={photo}
                  alt={title}
                  aspectClass="aspect-[4/3]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="relative rounded-sm"
                />
                <div
                  className="pointer-events-none absolute inset-0 rounded-sm bg-black/25"
                  aria-hidden
                />
                <div className="pointer-events-none absolute bottom-6 left-7 md:bottom-8 md:left-8">
                  <h2 className="text-[clamp(0.95rem,0.85vw+0.72rem,1.55rem)] font-semibold leading-[1.1] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]">
                    {title}
                  </h2>
                  <div className="mt-1 flex items-center gap-1.5 text-[clamp(0.72rem,0.35vw+0.62rem,1rem)] font-medium leading-none text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">
                    <span>{area} m²</span>
                    <span>{locationLabel}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
