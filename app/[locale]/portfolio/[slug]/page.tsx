import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { InteriorImage } from "@/components/ui/InteriorImage";
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
  const hero = photos[index + 7] ?? photos[index] ?? null;
  const gallery = [photos[index + 8], photos[index + 9]].filter(
    (p): p is NonNullable<typeof p> => !!p?.src,
  );

  const body = tp.raw(`${slug}.body`) as string[];

  return (
    <article>
      <div className="border-b border-accent/50 px-5 py-10 md:px-8 md:py-14">
        <Link
          href="/portfolio"
          className="text-xs uppercase tracking-[0.2em] text-muted hover:text-ink"
        >
          {t("back")}
        </Link>
        <h1 className="mt-6 font-serif text-4xl text-ink md:text-5xl lg:text-6xl">
          {tp(`${slug}.title`)}
        </h1>
        <dl className="mt-10 grid gap-6 border-t border-accent/40 pt-8 sm:grid-cols-2 md:grid-cols-4">
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
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wider text-muted-2">
              {t("status")}
            </dt>
            <dd className="mt-1 text-ink">{t("statusValue")}</dd>
          </div>
        </dl>
      </div>

      <InteriorImage
        photo={hero}
        aspectClass="aspect-[21/9] max-h-[70vh]"
        sizes="100vw"
        className="w-full"
        priority
        showCredit={!!hero}
      />

      <div className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <div className="space-y-6 text-lg leading-relaxed text-muted">
          {body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>

      {gallery.length > 0 ? (
        <div className="grid gap-px bg-accent/40 md:grid-cols-2">
          {gallery.map((photo) => (
            <InteriorImage
              key={photo.id}
              photo={photo}
              aspectClass="aspect-[4/3]"
              sizes="50vw"
              showCredit
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}
