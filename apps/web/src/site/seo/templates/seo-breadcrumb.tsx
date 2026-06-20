import Link from "next/link";

import { cn } from "@esigenta/ui";

export type SeoBreadcrumbItem = {
  label: string;
  href?: string;
};

export type SeoBreadcrumbProps = {
  items: readonly SeoBreadcrumbItem[];
};

export function SeoBreadcrumb({ items }: SeoBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${item.href ?? "current"}`}
              className="flex items-center gap-2"
            >
              {index > 0 ? (
                <span aria-hidden={true} className="text-text-muted">
                  /
                </span>
              ) : null}

              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className={cn(
                    "font-medium text-action-primary underline-offset-4 hover:text-action-primary-hover hover:underline",
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className="font-medium text-text-primary"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
