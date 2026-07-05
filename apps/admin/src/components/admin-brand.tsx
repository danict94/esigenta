"use client";

import Link from "next/link";

import { cn } from "@esigenta/ui";

type AdminBrandProps = {
  href?: string;
  onClick?: () => void;
  className?: string;
};

function AdminBrandContent() {
  return (
    <>
    <img
      src="/logo%20esigenta.svg"
      alt=""
      className="block h-6 w-auto"
      aria-hidden="true"
    />
    <span className="text-lg font-semibold leading-none">
      esigenta
    </span>
    <span className="font-mono text-xs font-medium uppercase tracking-widest text-eg-cotto-dark">
      / admin
    </span>
    </>
  );
}

export function AdminBrand({ href, onClick, className }: AdminBrandProps) {
  const brandClassName = cn(
    "inline-flex items-center gap-2 text-eg-terra focus:outline-none focus-visible:ring-1 focus-visible:ring-eg-terra",
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={brandClassName}
        aria-label="esigenta Admin"
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
