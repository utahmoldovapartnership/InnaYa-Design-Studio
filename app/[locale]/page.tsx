import { getTranslations } from "next-intl/server";
import { EditorialSection } from "@/components/home/EditorialSection";
import { Hero } from "@/components/home/Hero";
import { SelectedWork } from "@/components/home/SelectedWork";
import { getCachedInteriorPhotos } from "@/lib/pexels";

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
  const photos = await getCachedInteriorPhotos();
  const t = await getTranslations("home");

  return (
    <>
      <Hero photo={photos[0] ?? null} />
      <section className="bg-accent/25 px-5 py-20 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-muted">
            {t("values.eyebrow")}
          </p>
          <h2 className="mt-4 font-serif text-3xl text-ink md:text-4xl">
            {t("values.title")}
          </h2>
          <div className="mt-6 space-y-4 text-muted leading-relaxed">
            {(t.raw("values.body") as string[]).map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </div>
      </section>
      <SelectedWork photos={photos.slice(1, 5)} />
      <EditorialSection
        eyebrow={t("editorial1.eyebrow")}
        title={t("editorial1.title")}
        body={t.raw("editorial1.body") as string[]}
        photo={photos[5] ?? null}
        imageSide="left"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <EditorialSection
        eyebrow={t("editorial2.eyebrow")}
        title={t("editorial2.title")}
        body={t.raw("editorial2.body") as string[]}
        photo={photos[6] ?? null}
        imageSide="right"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <section className="border-t border-accent/50 bg-background px-5 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.25em] text-muted">
            {t("process.eyebrow")}
          </p>
          <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
            {t("process.title")}
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-2">
            {(t.raw("process.steps") as string[]).map((step, i) => (
              <li
                key={i}
                className="flex gap-4 border-l-2 border-accent pl-5 text-muted leading-relaxed"
              >
                <span className="font-serif text-2xl text-ink/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
