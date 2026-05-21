import { InteriorImage } from "@/components/ui/InteriorImage";
import { ButtonLink } from "@/components/ui/Button";
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
          <ButtonLink href={ctaHref}>{ctaLabel}</ButtonLink>
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
