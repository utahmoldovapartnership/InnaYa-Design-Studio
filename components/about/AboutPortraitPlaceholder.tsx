import Image from "next/image";

type Props = {
  alt: string;
};

export function AboutPortraitPlaceholder({ alt }: Props) {
  return (
    <figure className="aspect-square w-full shrink-0 md:w-[300px] md:max-w-[300px]">
      <div className="relative h-full w-full overflow-hidden rounded-sm">
        <Image
          src="/images/inna-efimenko.png"
          alt={alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 300px"
        />
      </div>
    </figure>
  );
}
