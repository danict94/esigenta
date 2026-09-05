"use client";

import Link from "next/link";

import { ESIGENTA_LOGO_PATH, EsigentaLogo, cn } from "@esigenta/ui";

type AdminBrandProps = {
  href?: string;
  onClick?: () => void;
  className?: string;
};

const publicSiteOrigin = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://www.esigenta.it"
).replace(/\/+$/, "");

const adminLogoSrc = `${publicSiteOrigin}${ESIGENTA_LOGO_PATH}`;

function AdminBrandContent() {
  return (
    <>
    <EsigentaLogo
      decorative
      src={adminLogoSrc}
      className="block h-10 w-auto"
    />
    <span className="font-(family-name:--eg-font-mono) text-xs font-medium uppercase tracking-widest text-eg-brand-strong">
      / admin
    </span>
    </>
  );
}

export function AdminBrand({ href, onClick, className }: AdminBrandProps) {
  const brandClassName = cn(
    "inline-flex items-center gap-2 text-eg-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-eg-brand-strong",
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        className={brandClassName}
        aria-label="esigenta Admin"
        {...(onClick ? { onClick } : {})}
      >
        <AdminBrandContent />
      </Link>
    );
  }

  return (
    <div className={brandClassName}>
      <AdminBrandContent />
    </div>
  );
}
