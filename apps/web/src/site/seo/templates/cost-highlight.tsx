export type CostHighlightProps = {
  label: string;
  value: string;
};

export function CostHighlight({ label, value }: CostHighlightProps) {
  return (
    <div className="eg-panel p-5">
      <p className="eg-metric-label">{label}</p>
      <p className="mt-3 text-2xl font-semibold leading-tight text-eg-brand-strong">
        {value}
      </p>
    </div>
  );
}
