import { FaInstagram, FaTiktok } from "react-icons/fa6";
import { getTranslations } from "next-intl/server";

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
    <section className="relative -mt-[var(--header-height)] h-dvh min-h-dvh w-full overflow-hidden pt-[var(--header-height)]">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-label="Interior video background"
      >
        <source
          src="https://www.pexels.com/download/video/5384977/"
          type="video/mp4"
        />
      </video>
      <div className="absolute inset-0 bg-ink/55" aria-hidden />

      <div className="absolute right-5 bottom-5 z-20 flex items-center gap-4 md:right-8 md:bottom-8">
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
    </section>
  );
}
