import { Link } from "@/i18n/navigation";
import type { ComponentProps } from "react";

const buttonBase =
  "inline-flex cursor-pointer items-center justify-center rounded-full text-sm font-medium tracking-wide shadow-none transition-[background-color,border-color,box-shadow,opacity] duration-200 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50";

export const buttonVariants = {
  primary:
    "bg-ink px-5 py-2 text-background hover:bg-ink/90 hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)]",
  light:
    "border border-background/90 bg-background px-5 py-2 text-ink hover:border-background hover:bg-background/90 hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)] md:px-6 md:py-2.5",
  outline:
    "border border-ink/90 px-6 py-3 text-ink hover:border-ink hover:bg-ink/[0.04] hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)]",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;

export function buttonClassName(
  variant: ButtonVariant,
  className?: string,
): string {
  return [buttonBase, buttonVariants[variant], className]
    .filter(Boolean)
    .join(" ");
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
};

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ButtonLinkProps) {
  return <Link className={buttonClassName(variant, className)} {...props} />;
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
};

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName(variant, className)}
      {...props}
    />
  );
}
