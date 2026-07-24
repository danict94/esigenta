import Link from "next/link";

import { buttonClassName, cn } from "@esigenta/ui";

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
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-6",
        headerHeightClassName,
        headerGutterClassName,
        headerSurfaceClassName,
      )}
    >
      <Link href="/" className="flex items-center no-underline" aria-label="Esigenta — area professionisti" prefetch={false}>
        <ProBrand />
      </Link>

      {action ? (
        <Link
          href={action.href}
          prefetch={false}
          className={buttonClassName({
            variant: "ghost",
            size: "sm",
            className:
              "border-eg-border text-eg-brand-strong hover:bg-eg-brand-soft hover:text-eg-brand-strong focus-visible:ring-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eg-brand-strong max-[420px]:px-3",
          })}
        >
          {action.label}
        </Link>
      ) : null}
    </header>
  );
}
