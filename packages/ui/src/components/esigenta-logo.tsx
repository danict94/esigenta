import type { ImgHTMLAttributes } from "react";

export const ESIGENTA_LOGO_PATH = "/assets/brand/esigenta-logo.svg";
export const ESIGENTA_LOGO_ON_DARK_PATH = "/assets/brand/esigenta-logo-on-dark.svg";

type EsigentaLogoProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "alt" | "src"
> & {
  title?: string;
  decorative?: boolean;
  src?: string;
};

export function EsigentaLogo({
  title = "Esigenta",
  decorative = false,
  src = ESIGENTA_LOGO_PATH,
  ...props
}: EsigentaLogoProps) {
  return (
    <img
      {...props}
      src={src}
      alt={decorative ? "" : title}
      {...(decorative ? { "aria-hidden": true as const } : {})}
    />
  );
}
