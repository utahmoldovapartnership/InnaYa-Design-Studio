import type { ReactElement } from "react";

type BrandMarkProps = {
  colorScheme: "light" | "dark";
};

export function EmptyBrandMark(_props: BrandMarkProps): ReactElement {
  return <></>;
}
