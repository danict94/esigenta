import type { ImgHTMLAttributes } from "react";

export const ESIGENTA_LOGO_PATH = "/assets/brand/esigenta-logo.svg";
export const ESIGENTA_LOGO_ON_DARK_PATH = "/assets/brand/esigenta-logo-on-dark.svg";
const ESIGENTA_LOGO_INTRINSIC_WIDTH = 682;
const ESIGENTA_LOGO_INTRINSIC_HEIGHT = 184;

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
  width,
  height,
  ...props
}: EsigentaLogoProps) {
  return (
    <img
      {...props}
      src={src}
      width={width ?? ESIGENTA_LOGO_INTRINSIC_WIDTH}
      height={height ?? ESIGENTA_LOGO_INTRINSIC_HEIGHT}
      alt={decorative ? "" : title}
      {...(decorative ? { "aria-hidden": true as const } : {})}
    />
  );
}
