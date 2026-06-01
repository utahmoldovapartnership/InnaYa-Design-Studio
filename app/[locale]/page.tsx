import { getTranslations } from "next-intl/server";
import { PinnedSocialLinks } from "@/components/layout/PinnedSocialLinks";
import { EdgeToEdgeHero } from "@/components/ui/EdgeToEdgeHero";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: {
      default: t("siteName"),
      template: `%s · ${t("siteName")}`,
    },
    description: t("description"),
    other: {
      "theme-color": "#0a0a0a",
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;

  return (
    <>
      <EdgeToEdgeHero
        media={
          <video
            className="hero-fixed-backdrop__media"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden
          >
            <source
              src="https://www.pexels.com/download/video/5384977/"
              type="video/mp4"
            />
          </video>
        }
      >
        <div className="h-full" aria-hidden />
      </EdgeToEdgeHero>
      <PinnedSocialLinks />
    </>
  );
}
