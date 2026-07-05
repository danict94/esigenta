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

export function ProQualityIcon(props: ProIconProps) {
  return (
    <ProIcon {...props}>
      <path d="m6.5 12.2 3.2 3.2 7.8-7.8" />
      <path d="M12 3.8a8.2 8.2 0 1 1 0 16.4 8.2 8.2 0 0 1 0-16.4Z" />
    </ProIcon>
  );
}

export function ProReturnIcon(props: ProIconProps) {
  return (
    <ProIcon {...props}>
      <path d="M7.5 8H4.2V4.7" />
      <path d="M4.6 8a8 8 0 1 1 1.9 8.1" />
    </ProIcon>
  );
}

export function ProTimeIcon(props: ProIconProps) {
  return (
    <ProIcon {...props}>
      <path d="M12 5.1a6.9 6.9 0 1 1 0 13.8 6.9 6.9 0 0 1 0-13.8Z" />
      <path d="M12 8.4v4l2.7 1.7" />
    </ProIcon>
  );
}

export function ProUsersIcon(props: ProIconProps) {
  return (
    <ProIcon {...props}>
      <path d="M9.4 11.1a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M3.8 18.7c.8-2.7 2.7-4.1 5.6-4.1 2.8 0 4.7 1.4 5.5 4.1" />
      <path d="M16.4 11.4a2.5 2.5 0 1 0 0-5" />
      <path d="M17.2 14.7c1.7.4 2.8 1.7 3.3 3.7" />
    </ProIcon>
  );
}

export function ProCheckIcon(props: ProIconProps) {
  return (
    <ProIcon {...props}>
      <path d="m5.7 12.4 4 4 8.6-8.8" />
    </ProIcon>
  );
}
