import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProjectImageRail } from "@/components/portfolio/ProjectImageRail";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getAllProjectSlugs, getProjectBySlug } from "@/lib/projects";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.flatMap((slug) =>
    routing.locales.map((locale) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug, locale);
  if (!project) return {};
  return {
    title: project.title,
    description: project.excerpt,
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
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug, locale);
  if (!project) notFound();

  const t = await getTranslations("portfolio.detail");
  const tMeta = await getTranslations("meta");
  const isSingleMedia = project.gallery.length === 1;
  const status = project.status ?? t("statusValue");

  return (
    <article className="min-h-screen bg-white px-5 pb-0 md:h-dvh md:overflow-hidden md:px-8 md:pb-0">
      <div
        className={`mx-auto flex w-full max-w-[1400px] flex-col gap-8 md:grid md:h-full md:min-h-0 md:grid-cols-[360px_minmax(0,1fr)] md:gap-10 md:pb-0 ${
          isSingleMedia
            ? "py-4 md:py-6"
            : "no-scrollbar md:overflow-y-auto"
        }`}
      >
        <aside
          className={`shrink-0 pt-4 md:pr-8 ${
            isSingleMedia
              ? "md:self-start md:overflow-y-auto md:pt-0"
              : "md:sticky md:top-0 md:self-start md:pt-6"
          }`}
        >
          <Link
            href="/portfolio"
            className="text-xs uppercase tracking-[0.2em] text-muted hover:text-ink"
          >
            &lsaquo; {t("backShort")}
          </Link>
          <h1 className="mt-5 font-serif text-4xl text-ink md:text-5xl">
            {project.title}
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
              <dd className="mt-1 text-ink">{project.location}</dd>
            </div>
            {project.area ? (
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-2">
                  {t("area")}
                </dt>
                <dd className="mt-1 text-ink">{project.area} m²</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-2">
                {t("year")}
              </dt>
              <dd className="mt-1 text-ink">{project.year}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-2">
                {t("typology")}
              </dt>
              <dd className="mt-1 text-ink">{project.typology}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-2">
                {t("status")}
              </dt>
              <dd className="mt-1 text-ink">{status}</dd>
            </div>
          </dl>
        </aside>

        <ProjectImageRail gallery={project.gallery} />
      </div>
    </article>
  );
}
