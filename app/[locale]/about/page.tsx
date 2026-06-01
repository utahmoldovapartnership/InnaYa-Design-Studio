import { getTranslations } from "next-intl/server";
import { PinnedSocialLinks } from "@/components/layout/PinnedSocialLinks";
import { EdgeToEdgeHero } from "@/components/ui/EdgeToEdgeHero";

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
  await params;
  const t = await getTranslations("about");

  return (
    <>
    <EdgeToEdgeHero
      media={
        <img
          src="https://images.pexels.com/photos/4621657/pexels-photo-4621657.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt=""
          className="hero-fixed-backdrop__media"
        />
      }
    >
      <div className="relative h-full min-h-0 overflow-hidden">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-5 md:px-8">
          <div className="mx-auto flex w-full max-w-[1200px] justify-end">
            <div className="w-full max-w-xl space-y-5 text-left">
              <p className="text-lg leading-[1.55] text-white/90 md:text-xl">
                {t("lead")}
              </p>
              <p className="text-lg leading-[1.55] text-white/85 md:text-xl">
                {t("experience")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </EdgeToEdgeHero>
    <PinnedSocialLinks />
    </>
  );
}
