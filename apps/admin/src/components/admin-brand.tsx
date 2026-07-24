"use client";

import Link from "next/link";

import { EsigentaLogo, cn } from "@esigenta/ui";

type AdminBrandProps = {
  href?: string;
  onClick?: () => void;
  className?: string;
};

function AdminBrandContent() {
  return (
    <>
    <EsigentaLogo decorative className="block h-6 w-auto" />
    <span className="font-(family-name:--eg-font-ui) text-xs font-medium uppercase tracking-widest text-eg-brand-strong">
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
