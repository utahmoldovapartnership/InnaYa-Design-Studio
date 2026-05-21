import { InteriorImage } from "@/components/ui/InteriorImage";
import { getCachedInteriorPhotos } from "@/lib/pexels";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const meta = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: meta("description"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const t = await getTranslations("about");
  const photos = await getCachedInteriorPhotos();
  const photo = photos[7] ?? photos[0] ?? null;

  return (
    <article>
      <div className="mx-auto max-w-page px-5 py-16 md:px-8 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
          <InteriorImage
            photo={photo}
            aspectClass="min-h-[360px] md:min-h-[480px]"
            sizes="(max-width: 768px) 100vw, 50vw"
            className="rounded-sm"
          />
          <div>
            <h1 className="font-serif text-4xl text-ink md:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-muted">
              {t("lead")}
            </p>
            <p className="mt-6 leading-relaxed text-muted">
              {t("experience")}
            </p>
            <p className="mt-4 leading-relaxed text-muted">{t("education")}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-page border-t border-accent/50 px-5 pb-16 md:px-8 md:pb-24">
        <h2 className="mt-14 font-serif text-2xl text-ink md:mt-16">
          {t("regionsTitle")}
        </h2>
        <p className="mt-4 leading-relaxed text-muted">{t("regionsBody")}</p>
        <p className="mt-4 border-l-2 border-accent pl-4 text-sm leading-relaxed text-muted">
          {t("regionsNote")}
        </p>
        <h2 className="mt-14 font-serif text-2xl text-ink">{t("storyTitle")}</h2>
        <p className="mt-4 leading-relaxed text-muted">{t("storyBody")}</p>
      </div>
    </article>
  );
}
