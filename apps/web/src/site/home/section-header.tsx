type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  id?: string;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  id,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={["text-center", className].filter(Boolean).join(" ")}>
      <p className="eg-eyebrow">{eyebrow}</p>
      <h2 id={id} className="eg-h2 mt-4">
        {title}
      </h2>
    </div>
  );
}
