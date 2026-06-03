import type { ReactNode } from "react";
import Image from "next/image";

export type TechBenefit = {
  title: string;
  body: string;
};

type FeatureProps = {
  eyebrow: string;
  title: string;
  intro: string[];
  imageSide?: "left" | "right";
  media: ReactNode;
  benefits?: TechBenefit[];
  benefitsTitle?: string;
  closing?: string[];
  compactTop?: boolean;
  topOffset?: boolean;
};

function BenefitsPanel({
  items,
  title,
  closing = [],
}: {
  items: TechBenefit[];
  title?: string;
  closing?: string[];
}) {
  if (items.length === 0 && closing.length === 0) return null;

  return (
    <div className="mt-12 rounded-sm bg-neutral-50 px-6 py-10 md:mt-14 md:px-10 md:py-12">
      {title ? (
        <h3 className="font-serif text-xl text-ink md:text-2xl">{title}</h3>
      ) : null}
      {items.length > 0 ? (
        <dl
          className={`grid gap-8 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-9 ${title ? "mt-8" : ""}`}
        >
          {items.map((item) => (
            <div key={item.title}>
              <dt className="text-sm font-medium uppercase tracking-wide text-ink">
                {item.title}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted md:text-[0.95rem]">
                {item.body}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {closing.length > 0 ? (
        <div
          className={`space-y-3 text-sm leading-relaxed text-muted md:text-[0.95rem] ${items.length > 0 || title ? "mt-8 border-t border-accent/30 pt-8" : ""}`}
        >
          {closing.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function TechFeatureBlock({
  eyebrow,
  title,
  intro,
  imageSide = "right",
  media,
  benefits = [],
  benefitsTitle,
  closing = [],
  compactTop = false,
  topOffset = false,
}: FeatureProps) {
  const textFirst = imageSide === "right";
  const pt = topOffset
    ? "pt-[calc(var(--header-height)+2rem)] md:pt-[calc(var(--header-height)+2.75rem)]"
    : "";
  const spacing = compactTop ? "pb-16 md:pb-24" : "py-16 md:py-24";

  const copy = (
    <div className="flex flex-col justify-center">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-2">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-serif text-2xl leading-snug text-ink md:text-[1.85rem]">
        {title}
      </h2>
      <div className="mt-5 space-y-4 text-base leading-relaxed text-muted">
        {intro.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </div>
    </div>
  );

  return (
    <section className={`border-t border-accent/40 ${spacing} ${pt}`}>
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
        <div className={textFirst ? "order-2 md:order-1" : "order-2"}>
          {copy}
        </div>
        <div className={textFirst ? "order-1 md:order-2" : "order-1"}>
          {media}
        </div>
      </div>
      <BenefitsPanel
        items={benefits}
        title={benefitsTitle}
        closing={closing}
      />
    </section>
  );
}

export function TechFeatureImage({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, 540px",
  priority = false,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <figure className="group relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-sm md:max-w-none">
      <div className="absolute inset-0 transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.02] motion-reduce:group-hover:scale-100">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
          sizes={sizes}
        />
      </div>
    </figure>
  );
}
