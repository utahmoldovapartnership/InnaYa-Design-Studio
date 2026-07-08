import { getTranslations } from "next-intl/server";
import { PinnedSocialLinks } from "@/components/layout/PinnedSocialLinks";
import { MeasurementVideoHero } from "@/components/technology/MeasurementVideoHero";
import {
  TechFeatureBlock,
  TechFeatureImage,
} from "@/components/technology/TechChapter";
import {
  getTechnologiesContent,
  getTechnologiesMedia,
} from "@/lib/site-content";
import { buildLocaleAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = await getTechnologiesContent(locale);
  return {
    title: content.pageTitle,
    description: content.metaDescription,
    alternates: buildLocaleAlternates(locale, "/technologies"),
  };
}

export default async function TechnologiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("services");
  const content = await getTechnologiesContent(locale);
  const { vrImageSrc, leicaVideoId } = await getTechnologiesMedia();

  return (
    <>
    <article className="bg-white pb-24 md:pb-32">
      <div className="px-5 pt-10">
        <div className="-translate-y-[calc(var(--header-height)/4)] transform">
          <div className="mx-auto w-full max-w-[1200px]">
            <h1 className="sr-only">{content.pageTitle}</h1>
            <div className="[&>section:first-child]:border-t-0">
              <TechFeatureBlock
                compactTop
                eyebrow={content.vrEyebrow}
                title={content.vrTitle}
                intro={content.vrIntro}
                imageSide="right"
                benefits={content.vrBenefits}
                closing={content.vrClosing}
                media={
                  <TechFeatureImage
                    src={vrImageSrc}
                    alt={content.vrImageAlt}
                    priority
                  />
                }
              />

              <TechFeatureBlock
                eyebrow={content.leicaEyebrow}
                title={content.leicaTitle}
                intro={content.leicaIntro}
                imageSide="right"
                benefits={content.leicaBenefits}
                closing={content.leicaClosing}
                media={
                  <div className="mx-auto w-full max-w-md overflow-hidden rounded-sm md:max-w-none">
                    <MeasurementVideoHero
                      embedded
                      videoId={leicaVideoId}
                      title={t("measurementVideoTitle")}
                      muteLabel={t("muteVideo")}
                      unmuteLabel={t("unmuteVideo")}
                      volumeLabel={t("volumeControl")}
                      fullscreenLabel={t("fullscreenVideo")}
                      exitFullscreenLabel={t("exitFullscreenVideo")}
                    />
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </article>
    <PinnedSocialLinks />
    </>
  );
}
