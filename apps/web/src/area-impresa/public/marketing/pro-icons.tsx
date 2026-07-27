import type { SVGProps } from "react";

type ProIconProps = SVGProps<SVGSVGElement>;

function ProIcon({
  children,
  ...props
}: ProIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ProCheckIcon(props: ProIconProps) {
  return (
    <ProIcon {...props}>
      <path d="m5.7 12.4 4 4 8.6-8.8" />
    </ProIcon>
  );
}
