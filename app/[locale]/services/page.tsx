import { getTranslations } from "next-intl/server";
import { PinnedSocialLinks } from "@/components/layout/PinnedSocialLinks";
import { MeasurementVideoHero } from "@/components/technology/MeasurementVideoHero";
import {
  TechFeatureBlock,
  TechFeatureImage,
  type TechBenefit,
} from "@/components/technology/TechChapter";
import { revitFeatureImage, vrFeatureImage } from "@/content/tech-photos";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  const meta = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("services"),
    description: meta("description"),
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const t = await getTranslations("services");

  const revitIntro = t.raw("revitIntro") as string[];
  const revitBenefits = t.raw("revitBenefits") as TechBenefit[];
  const vrIntro = t.raw("vrIntro") as string[];
  const vrBenefits = t.raw("vrBenefits") as TechBenefit[];
  const vrClosing = t.raw("vrClosing") as string[];
  const leicaIntro = t.raw("leicaIntro") as string[];
  const leicaBenefits = t.raw("leicaBenefits") as TechBenefit[];
  const leicaClosing = t.raw("leicaClosing") as string[];

  return (
    <>
    <article className="bg-white pb-24 md:pb-32">
      <div className="px-5 pt-10">
        <div className="-translate-y-[calc(var(--header-height)/4)] transform">
          <div className="mx-auto w-full max-w-[1200px]">
            <h1 className="sr-only">{t("title")}</h1>
            <div className="[&>section:first-child]:border-t-0">
              <TechFeatureBlock
                compactTop
                eyebrow={t("revitEyebrow")}
                title={t("revitTitle")}
                intro={revitIntro}
                imageSide="right"
                benefits={revitBenefits}
                benefitsTitle={t("revitBenefitsTitle")}
                media={
                  <TechFeatureImage
                    src={revitFeatureImage.src}
                    alt={t("revitImageAlt")}
                    priority
                  />
                }
              />

              <TechFeatureBlock
                eyebrow={t("vrEyebrow")}
                title={t("vrTitle")}
                intro={vrIntro}
                imageSide="left"
                benefits={vrBenefits}
                closing={vrClosing}
                media={
                  <TechFeatureImage
                    src={vrFeatureImage.src}
                    alt={t("vrImageAlt")}
                  />
                }
              />

              <TechFeatureBlock
                eyebrow={t("leicaEyebrow")}
                title={t("leicaTitle")}
                intro={leicaIntro}
                imageSide="right"
                benefits={leicaBenefits}
                closing={leicaClosing}
                media={
                  <div className="mx-auto w-full max-w-md overflow-hidden rounded-sm md:max-w-none">
                    <MeasurementVideoHero
                      embedded
                      videoId="CpSLmy0iI_g"
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
