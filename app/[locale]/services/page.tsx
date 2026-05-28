import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { MeasurementVideoHero } from "@/components/technology/MeasurementVideoHero";

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

  return (
    <article className="bg-white">
      <MeasurementVideoHero
        videoId="CpSLmy0iI_g"
        title={t("measurementVideoTitle")}
        muteLabel={t("muteVideo")}
        unmuteLabel={t("unmuteVideo")}
        volumeLabel={t("volumeControl")}
      />

      <section className="bg-[#b69274]/22 px-5 pt-10 pb-12 md:px-8 md:pt-14 md:pb-16">
        <div className="mx-auto grid w-full max-w-[1200px] items-center gap-8 md:grid-cols-[1fr_420px] md:gap-10">
          <div>
            <p className="text-base leading-relaxed text-muted md:text-lg">
              {t("measurementBody")}
            </p>
          </div>

          <div className="w-full justify-self-start md:w-auto md:justify-self-end">
            <Image
              src="/images/measurement-tool.png"
              alt={t("measurementImageAlt")}
              width={320}
              height={320}
              className="h-auto w-full max-w-none rounded-sm object-cover md:max-w-[340px]"
            />
          </div>
        </div>
      </section>
    </article>
  );
}
