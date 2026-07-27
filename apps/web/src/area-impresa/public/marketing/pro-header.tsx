import Link from "next/link";

import { cn } from "@esigenta/ui";

import {
  headerGutterClassName,
  headerHeightClassName,
  headerSurfaceClassName,
} from "../../../site/shell/header-gutter";
import { ProBrand } from "../../shared/pro-brand";

export type ProHeaderAction = {
  label: string;
  href: string;
};

type ProHeaderProps = {
  action?: ProHeaderAction | null;
};

const defaultAction: ProHeaderAction = {
  label: "Ho gia un account",
  href: "/area-impresa/accedi",
};

export function ProHeader({ action = defaultAction }: ProHeaderProps) {
  return (
    <header className={cn("fixed inset-x-0 top-0 z-50", headerSurfaceClassName)}>
      <div
        className={cn(
          "mx-auto flex items-center justify-between gap-6",
          headerHeightClassName,
          headerGutterClassName,
        )}
      >
        <Link href="/" className="flex items-center no-underline" aria-label="Esigenta — area professionisti" prefetch={false}>
          <ProBrand />
        </Link>

        {action ? (
          <Link
            href={action.href}
            prefetch={false}
            className="flex items-center gap-1.5 text-sm text-eg-text-muted transition-colors hover:text-eg-brand-strong"
          >
            {action.label}
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        ) : null}
      </div>
    </header>
  );
}
