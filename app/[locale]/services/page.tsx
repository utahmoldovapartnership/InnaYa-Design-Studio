import { InteriorImage } from "@/components/ui/InteriorImage";
import { ParallaxInteriorImage } from "@/components/ui/ParallaxInteriorImage";
import { getCachedInteriorPhotos } from "@/lib/pexels";
import type { PexelsPhoto } from "@/lib/pexels";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  const meta = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: meta("description"),
  };
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-muted leading-relaxed">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span
            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function pickPhoto(photos: PexelsPhoto[], index: number): PexelsPhoto | null {
  if (photos.length === 0) return null;
  return photos[index % photos.length] ?? null;
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const t = await getTranslations("services");
  const photos = await getCachedInteriorPhotos();

  const consultationPrepareItems = t.raw("consultationPrepareItems") as string[];
  const consultationExpectItems = t.raw("consultationExpectItems") as string[];
  const spaceItems = t.raw("spacePlanningItems") as string[];
  const extrasItems = t.raw("extrasItems") as string[];
  const pricingItems = t.raw("pricingItems") as string[];

  return (
    <article>
      <div className="mx-auto max-w-page px-5 pt-16 pb-12 md:px-8 md:pt-24 md:pb-14">
        <h1 className="font-serif text-4xl text-ink md:text-5xl">{t("title")}</h1>
        <p className="mt-8 text-lg leading-relaxed text-muted">{t("intro")}</p>
        <p className="mt-6 text-sm leading-relaxed text-muted-2">
          {t("pricingLead")}
        </p>
      </div>

      <ParallaxInteriorImage
        photo={pickPhoto(photos, 0)}
        aspectClass="min-h-[42vh] md:min-h-[52vh]"
        sizes="100vw"
        priority
      />

      <div className="mx-auto max-w-page px-5 py-16 md:px-8 md:py-20">
        <section>
          <h2 className="font-serif text-2xl text-ink md:text-3xl">
            {t("consultationTitle")}
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            {t("consultationBody")}
          </p>
          <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h3 className="font-serif text-xl text-ink">
                {t("consultationPrepareTitle")}
              </h3>
              <div className="mt-4">
                <List items={consultationPrepareItems} />
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl text-ink">
                {t("consultationExpectTitle")}
              </h3>
              <div className="mt-4">
                <List items={consultationExpectItems} />
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="border-t border-accent/50 bg-accent/20">
        <div className="grid lg:grid-cols-2 lg:items-stretch">
          <InteriorImage
            photo={pickPhoto(photos, 2)}
            aspectClass="min-h-[360px] lg:min-h-[480px] lg:h-full"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="h-full w-full"
          />
          <div className="flex flex-col justify-center px-5 py-16 md:px-8 md:py-20 lg:px-12 lg:py-24 xl:px-16">
            <h2 className="font-serif text-2xl text-ink md:text-3xl">
              {t("spacePlanningTitle")}
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              {t("spacePlanningIntro")}
            </p>
            <div className="mt-4">
              <List items={spaceItems} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-accent/50">
        <div className="mx-auto max-w-page px-5 py-16 md:px-8 md:py-20">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <InteriorImage
              photo={pickPhoto(photos, 4)}
              aspectClass="aspect-[4/5]"
              sizes="(max-width: 640px) 100vw, 50vw"
              className="rounded-sm"
            />
            <InteriorImage
              photo={pickPhoto(photos, 3)}
              aspectClass="aspect-[4/5] sm:mt-12"
              sizes="(max-width: 640px) 100vw, 50vw"
              className="rounded-sm"
            />
          </div>
          <div className="mt-14 grid gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="font-serif text-2xl text-ink">{t("interiorTitle")}</h2>
              <p className="mt-4 leading-relaxed text-muted">{t("interiorBody")}</p>
            </div>
            <div>
              <h2 className="font-serif text-2xl text-ink">{t("productTitle")}</h2>
              <p className="mt-4 leading-relaxed text-muted">{t("productBody")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-accent/50">
        <div className="mx-auto max-w-page px-5 md:px-8">
          <div className="grid items-center gap-10 py-16 md:gap-12 md:py-20 lg:grid-cols-2 lg:py-24">
            <div>
              <h2 className="font-serif text-2xl text-ink md:text-3xl">
                {t("extrasTitle")}
              </h2>
              <div className="mt-4">
                <List items={extrasItems} />
              </div>
            </div>
            <div className="grid min-h-[280px] grid-cols-2 gap-px bg-accent/40 sm:min-h-[360px] lg:min-h-[420px]">
              <InteriorImage
                photo={pickPhoto(photos, 5)}
                aspectClass="min-h-[200px] h-full"
                sizes="(max-width: 1024px) 100vw, 25vw"
                className="h-full w-full"
              />
              <InteriorImage
                photo={pickPhoto(photos, 6)}
                aspectClass="min-h-[200px] h-full"
                sizes="(max-width: 1024px) 100vw, 25vw"
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-page border-t border-accent/50 px-5 py-16 md:px-8 md:py-20">
        <section>
          <h2 className="font-serif text-2xl text-ink">{t("pricingTitle")}</h2>
          <div className="mt-4">
            <List items={pricingItems} />
          </div>
        </section>
      </div>
    </article>
  );
}
