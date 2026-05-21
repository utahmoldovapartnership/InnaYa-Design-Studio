import { InteriorImage } from "@/components/ui/InteriorImage";
import { Link } from "@/i18n/navigation";
import type { PexelsPhoto } from "@/lib/pexels";

type Props = {
  eyebrow: string;
  title: string;
  body: string[];
  photo: PexelsPhoto | null;
  imageSide: "left" | "right";
  sizes: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function EditorialSection({
  eyebrow,
  title,
  body,
  photo,
  imageSide,
  sizes,
  ctaHref,
  ctaLabel,
}: Props) {
  const textBlock = (
    <div className="flex flex-col justify-center gap-5 px-5 py-12 md:px-10 lg:px-16">
      <p className="text-xs uppercase tracking-[0.25em] text-muted">{eyebrow}</p>
      <h2 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
        {title}
      </h2>
      <div className="space-y-4 leading-relaxed text-muted">
        {body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      {ctaHref && ctaLabel ? (
        <div className="pt-2">
          <Link
            href={ctaHref}
            className="inline-block rounded-full bg-ink px-5 py-2 text-sm font-medium tracking-wide text-background transition-colors hover:bg-ink/90"
          >
            {ctaLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );

  const imageBlock = (
    <InteriorImage
      photo={photo}
      aspectClass="min-h-[320px] md:min-h-[420px]"
      sizes={sizes}
      className="md:min-h-full"
    />
  );

  return (
    <section className="border-t border-accent/50">
      <div className="grid md:grid-cols-2">
        {imageSide === "left" ? (
          <>
            {imageBlock}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {imageBlock}
          </>
        )}
      </div>
    </section>
  );
}
