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

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
      <h1 className="font-serif text-4xl text-ink md:text-5xl">{t("title")}</h1>
      <p className="mt-8 text-lg leading-relaxed text-muted">{t("lead")}</p>
      <p className="mt-6 leading-relaxed text-muted">{t("experience")}</p>
      <p className="mt-4 leading-relaxed text-muted">{t("education")}</p>
      <h2 className="mt-14 font-serif text-2xl text-ink">{t("regionsTitle")}</h2>
      <p className="mt-4 leading-relaxed text-muted">{t("regionsBody")}</p>
      <p className="mt-4 border-l-2 border-accent pl-4 text-sm leading-relaxed text-muted">
        {t("regionsNote")}
      </p>
      <h2 className="mt-14 font-serif text-2xl text-ink">{t("storyTitle")}</h2>
      <p className="mt-4 leading-relaxed text-muted">{t("storyBody")}</p>
    </article>
  );
}
