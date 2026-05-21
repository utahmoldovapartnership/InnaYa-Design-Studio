import { getTranslations } from "next-intl/server";
import { InteriorImage } from "@/components/ui/InteriorImage";
import { SlideUnderline } from "@/components/ui/SlideUnderline";
import type { PexelsPhoto } from "@/lib/pexels";
import { projectList } from "@/content/projects";
import { Link } from "@/i18n/navigation";

type Props = {
  photos: PexelsPhoto[];
};

export async function SelectedWork({ photos }: Props) {
  const t = await getTranslations("home.selected");
  const tp = await getTranslations("portfolioItems");

  return (
    <section className="border-t border-accent/60 bg-background px-5 py-20 md:px-8">
      <div className="mx-auto max-w-page">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">
          {t("eyebrow")}
        </p>
        <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
          {t("title")}
        </h2>
        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          {projectList.map((project, index) => {
            const photo = photos[index] ?? null;
            return (
              <Link
                key={project.slug}
                href={`/portfolio/${project.slug}`}
                className="group block"
              >
                <InteriorImage
                  photo={photo}
                  aspectClass="aspect-[4/5]"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="rounded-sm"
                />
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl text-ink">
                      <SlideUnderline>{tp(`${project.slug}.title`)}</SlideUnderline>
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {tp(`${project.slug}.location`)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs uppercase tracking-wider text-muted-2">
                    {t("view")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
