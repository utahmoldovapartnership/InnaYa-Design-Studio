import { getTranslations } from "next-intl/server";
import { FaInstagram, FaTiktok } from "react-icons/fa6";

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
    <section className="relative -mt-[var(--header-height)] h-dvh min-h-dvh w-full overflow-hidden">
      <img
        src="https://images.pexels.com/photos/4621657/pexels-photo-4621657.jpeg?auto=compress&cs=tinysrgb&w=1920"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-ink/55" aria-hidden />

      <div className="relative z-10 mt-[var(--header-height)] flex h-[calc(100dvh-var(--header-height))] -translate-y-4 items-center px-5 md:-translate-y-6 md:px-8">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="ml-auto w-full max-w-xl space-y-5 text-left md:w-1/2">
            <p className="text-lg leading-[1.55] text-white/90 md:text-xl">
              {t("lead")}
            </p>
            <p className="text-lg leading-[1.55] text-white/85 md:text-xl">
              {t("experience")}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute right-5 bottom-5 z-20 flex items-center gap-4 md:right-8 md:bottom-8">
        <a
          href="https://www.instagram.com/innaya_d_studio/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white transition-opacity hover:opacity-75"
          aria-label={`${t("title")} Instagram`}
        >
          <FaInstagram className="h-6 w-6" />
        </a>
        <a
          href="https://www.tiktok.com/@innaya.design"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white transition-opacity hover:opacity-75"
          aria-label={`${t("title")} TikTok`}
        >
          <FaTiktok className="h-6 w-6" />
        </a>
      </div>
    </section>
  );
}
