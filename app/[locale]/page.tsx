import { FaInstagram, FaTiktok } from "react-icons/fa6";
import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations("nav");

  return (
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
      <div className="flex h-full flex-col justify-end px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-8 md:pb-8">
        <div className="flex items-center justify-end gap-4">
          <a
            href="https://www.instagram.com/innaya_d_studio/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white transition-opacity hover:opacity-75"
            aria-label={`${t("brand")} Instagram`}
          >
            <FaInstagram className="h-6 w-6" />
          </a>
          <a
            href="https://www.tiktok.com/@innaya.design"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white transition-opacity hover:opacity-75"
            aria-label={`${t("brand")} TikTok`}
          >
            <FaTiktok className="h-6 w-6" />
          </a>
        </div>
      </div>
    </EdgeToEdgeHero>
  );
}
