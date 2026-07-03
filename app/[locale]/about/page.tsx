import { getTranslations } from "next-intl/server";
import { PinnedSocialLinks } from "@/components/layout/PinnedSocialLinks";
import { EdgeToEdgeHero } from "@/components/ui/EdgeToEdgeHero";
import { buildLocaleAlternates } from "@/lib/seo";
import { getAboutBackgroundSrc, getAboutParagraphs } from "@/lib/site-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: buildLocaleAlternates(locale, "/about"),
    other: {
      "theme-color": "#0a0a0a",
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("about");
  const paragraphs = await getAboutParagraphs(locale);
  const backgroundSrc = await getAboutBackgroundSrc();

  return (
    <>
      <EdgeToEdgeHero
        media={
          // eslint-disable-next-line @next/next/no-img-element -- hero backdrop uses custom viewport CSS
          <img
            src={backgroundSrc}
            alt=""
            className="hero-fixed-backdrop__media"
          />
        }
      >
        <div className="relative flex h-full min-h-0 items-start overflow-hidden px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[calc(var(--header-height)*0.75+2.5rem)] md:px-8">
          <div className="mx-auto w-full min-w-0 max-w-[1200px] lg:flex">
            <div
              className="hidden shrink-0 lg:block lg:w-[36%]"
              aria-hidden
            />
            <div className="min-w-0 w-full max-h-[calc(100dvh-var(--header-height)-2rem)] overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-1 [&::-webkit-scrollbar]:hidden">
              <h1 className="sr-only">{t("title")}</h1>
              <div className="space-y-4 text-left md:space-y-5">
                {paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="text-base leading-[1.55] text-white/90 md:text-lg"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </EdgeToEdgeHero>
      <PinnedSocialLinks />
    </>
  );
}
