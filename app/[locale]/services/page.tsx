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
    <ul className="mt-4 space-y-2 text-muted leading-relaxed">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const t = await getTranslations("services");

  const spaceItems = t.raw("spacePlanningItems") as string[];
  const extrasItems = t.raw("extrasItems") as string[];
  const pricingItems = t.raw("pricingItems") as string[];

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
      <h1 className="font-serif text-4xl text-ink md:text-5xl">{t("title")}</h1>
      <p className="mt-8 text-lg leading-relaxed text-muted">{t("intro")}</p>
      <p className="mt-6 text-sm leading-relaxed text-muted-2">{t("pricingLead")}</p>

      <section className="mt-16">
        <h2 className="font-serif text-2xl text-ink">{t("consultationTitle")}</h2>
        <p className="mt-4 leading-relaxed text-muted">{t("consultationBody")}</p>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-2xl text-ink">{t("spacePlanningTitle")}</h2>
        <p className="mt-4 leading-relaxed text-muted">{t("spacePlanningIntro")}</p>
        <List items={spaceItems} />
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-2xl text-ink">{t("interiorTitle")}</h2>
        <p className="mt-4 leading-relaxed text-muted">{t("interiorBody")}</p>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-2xl text-ink">{t("productTitle")}</h2>
        <p className="mt-4 leading-relaxed text-muted">{t("productBody")}</p>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-2xl text-ink">{t("extrasTitle")}</h2>
        <List items={extrasItems} />
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-2xl text-ink">{t("pricingTitle")}</h2>
        <List items={pricingItems} />
      </section>
    </article>
  );
}
