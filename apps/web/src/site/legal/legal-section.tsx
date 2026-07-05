export function LegalSection({
  items,
  title,
}: {
  items: string[];
  title: string;
}) {
  return (
    <section className="eg-panel p-6">
      <h2 className="eg-h3">{title}</h2>
      <ul className="eg-body-muted mt-4 list-disc space-y-2 pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
