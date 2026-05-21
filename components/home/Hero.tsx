import { getTranslations } from "next-intl/server";
import { HeroSection } from "@/components/home/HeroSection";
import type { PexelsPhoto } from "@/lib/pexels";

type Props = {
  photos: PexelsPhoto[];
};

export async function Hero({ photos }: Props) {
  const t = await getTranslations("home.hero");

  return (
    <HeroSection photos={photos} title={t("title")} cta={t("cta")} />
  );
}
