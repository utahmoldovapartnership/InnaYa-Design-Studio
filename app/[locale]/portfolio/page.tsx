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
  const t = await getTranslations("portfolio");
  const tp = await getTranslations("portfolioItems");
  const photos = await getCachedInteriorPhotos();

  return (
    <div className="px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-page">
        <h1 className="font-serif text-4xl text-ink md:text-5xl">{t("title")}</h1>
        <p className="mt-4 text-muted leading-relaxed">{t("subtitle")}</p>
        <div className="mt-14 grid gap-10 sm:grid-cols-2">
          {projectList.map((project, index) => {
            const photo = photos[index + 7] ?? photos[index] ?? null;
            return (
              <Link
                key={project.slug}
                href={`/portfolio/${project.slug}`}
                className="group block"
              >
                <InteriorImage
                  photo={photo}
                  aspectClass="aspect-[4/5]"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="rounded-sm"
                />
                <h2 className="mt-4 font-serif text-2xl text-ink group-hover:underline group-hover:underline-offset-4">
                  {tp(`${project.slug}.title`)}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {tp(`${project.slug}.location`)}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-2">
                  {tp(`${project.slug}.excerpt`)}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
