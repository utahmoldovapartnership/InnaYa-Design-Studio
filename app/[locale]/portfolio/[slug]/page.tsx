import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProjectImageRail } from "@/components/portfolio/ProjectImageRail";
import { getProjectBySlug, projectList } from "@/content/projects";
import { routing } from "@/i18n/routing";
import { getCachedInteriorPhotos } from "@/lib/pexels";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return projectList.flatMap((p) =>
    routing.locales.map((locale) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  const tp = await getTranslations({ locale, namespace: "portfolioItems" });
  return {
    title: tp(`${slug}.title`),
    description: tp(`${slug}.excerpt`),
    alternates: {
      languages: {
        en: `/en/portfolio/${slug}`,
        uk: `/uk/portfolio/${slug}`,
        ru: `/ru/portfolio/${slug}`,
      },
    },
  };
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const t = await getTranslations("portfolio.detail");
  const tp = await getTranslations("portfolioItems");
  const tMeta = await getTranslations("meta");
  const photos = await getCachedInteriorPhotos();
  const index = projectList.findIndex((p) => p.slug === slug);
  const gallery =
    photos.length > 0
      ? Array.from({ length: 10 }, (_, offset) => {
          return photos[(index + 7 + offset) % photos.length] ?? null;
        })
      : Array.from({ length: 10 }, () => null);

  return (
    <article className="h-screen overflow-hidden bg-white px-5 pb-6 md:px-8 md:pb-8">
      <div className="no-scrollbar mx-auto grid h-full w-full max-w-[1400px] gap-8 overflow-y-auto pt-4 md:grid-cols-[360px_minmax(0,1fr)] md:gap-10 md:pt-6">
        <aside className="md:sticky md:top-0 md:self-start md:pr-8">
          <Link
            href="/portfolio"
            className="text-xs uppercase tracking-[0.2em] text-muted hover:text-ink"
          >
            &lsaquo; {t("backShort")}
          </Link>
          <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">
            {tp(`${slug}.title`)}
          </h1>
          <dl className="mt-8 space-y-5 border-t border-accent/40 pt-6">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-2">
                {t("firm")}
              </dt>
              <dd className="mt-1 text-ink">{tMeta("siteName")}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-2">
                {t("location")}
              </dt>
              <dd className="mt-1 text-ink">{tp(`${slug}.location`)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-2">
                {t("year")}
              </dt>
              <dd className="mt-1 text-ink">{tp(`${slug}.year`)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-2">
                {t("typology")}
              </dt>
              <dd className="mt-1 text-ink">{tp(`${slug}.typology`)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-2">
                {t("status")}
              </dt>
              <dd className="mt-1 text-ink">{t("statusValue")}</dd>
            </div>
          </dl>
        </aside>

        <ProjectImageRail gallery={gallery} />
      </div>
    </article>
  );
}
