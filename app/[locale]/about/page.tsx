import { getTranslations } from "next-intl/server";
import { AboutPortraitPlaceholder } from "@/components/about/AboutPortraitPlaceholder";
import { PinnedSocialLinks } from "@/components/layout/PinnedSocialLinks";

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
  const paragraphs = t.raw("paragraphs") as string[];

  return (
    <>
      <article>
        <section className="relative -mt-[var(--header-height)] min-h-[42vh] overflow-hidden md:min-h-[48vh]">
          <img
            src="https://images.pexels.com/photos/4621657/pexels-photo-4621657.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-ink/55" />
        </section>

        <section className="px-5 py-14 md:px-8 md:py-20">
          <div className="mx-auto grid w-full max-w-[1200px] items-center gap-12 md:grid-cols-[auto_1fr] md:gap-16 lg:gap-20">
            <h1 className="sr-only">{t("title")}</h1>
            <AboutPortraitPlaceholder alt={t("photoAlt")} />
            <div className="space-y-6">
              {paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="text-base leading-relaxed text-muted md:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
      </article>
      <PinnedSocialLinks />
    </>
  );
}
