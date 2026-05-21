import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function SlideUnderline({ children, className = "" }: Props) {
  return (
    <span
      className={`relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-300 after:ease-out group-hover:after:scale-x-100 motion-reduce:after:transition-none ${className}`}
    >
      {children}
    </span>
  );
}
