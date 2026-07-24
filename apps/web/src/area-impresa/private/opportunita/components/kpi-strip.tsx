import Link from "next/link";

export type KpiStripItem = {
  value: number;
  label: string;
  href?: string;
  accent?: boolean;
};

export function KpiStrip({ items }: { items: KpiStripItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className="grid border-b border-eg-border"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item, index) => {
        const content = (
          <>
            <p
              className={
                item.accent
                  ? "eg-kpi-value text-eg-brand-strong"
                  : "eg-kpi-value text-eg-ink"
              }
            >
              {item.value}
            </p>
            <p className="mt-1 text-[12.5px] text-eg-text-muted">{item.label}</p>
          </>
        );
        const className =
          index === 0
            ? "px-8 py-[22px]"
            : "border-l border-eg-border px-8 py-[22px]";

        if (item.href) {
          return (
            <Link
              key={item.label}
              href={item.href}
              prefetch={false}
              className={`${className} transition-colors hover:bg-eg-surface-muted`}
            >
              {content}
            </Link>
          );
        }

        return (
          <div key={item.label} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
