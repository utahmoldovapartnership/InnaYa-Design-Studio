import { getTranslations } from "next-intl/server";
import { InteriorImage } from "@/components/ui/InteriorImage";
import type { PexelsPhoto } from "@/lib/pexels";
import { Link } from "@/i18n/navigation";

type Props = {
  photo: PexelsPhoto | null;
};

export async function Hero({ photo }: Props) {
  const t = await getTranslations("home.hero");

  return (
    <section className="relative">
      <div className="grid min-h-[70vh] md:grid-cols-2">
        <div className="flex flex-col justify-center gap-6 px-5 py-16 md:px-12 lg:px-16">
          <p className="text-xs uppercase tracking-[0.25em] text-muted">
            {t("eyebrow")}
          </p>
          <h1 className="font-serif text-4xl leading-tight text-ink md:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-muted">
            {t("subtitle")}
          </p>
          <div>
            <Link
              href="/contact"
              className="inline-block border border-ink bg-ink px-8 py-3 text-sm tracking-wide text-background transition-colors hover:bg-background hover:text-ink"
            >
              {t("cta")}
            </Link>
          </div>
        </div>
        <InteriorImage
          photo={photo}
          aspectClass="min-h-[50vh] w-full md:min-h-[70vh]"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          showCredit={!!photo}
        />
      </div>
    </section>
  );
}
