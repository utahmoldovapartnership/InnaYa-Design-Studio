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
    <article>
      <section className="bg-white px-5 pt-10 pb-10 md:px-8 md:pt-14 md:pb-12">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="flex flex-col gap-10 md:grid md:grid-cols-2 md:items-center md:gap-x-10">
            <div className="min-w-0">
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

            <p className="text-base leading-relaxed text-muted md:text-lg">
              {t("technologiesLead")}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#b69274]/22 px-5 py-14 md:px-8 md:py-20">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="flex flex-col gap-10 md:grid md:grid-cols-2 md:items-center md:gap-x-10">
            <div className="space-y-5">
              <h2 className="font-serif text-xl text-ink md:text-2xl">
                {t("measurementTitle")}
              </h2>
              <p className="text-base leading-relaxed text-muted md:text-lg">
                {t("measurementBody")}
              </p>
            </div>

            <div className="w-full md:flex md:justify-end">
              <div className="group relative w-full overflow-hidden rounded-sm md:max-w-[540px]">
                <Image
                  src="/images/measurement-tool.jpg"
                  alt={t("measurementImageAlt")}
                  width={800}
                  height={533}
                  className="h-auto w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
