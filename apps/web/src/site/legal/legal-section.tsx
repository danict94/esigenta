import { Card } from "@esigenta/ui"

export function LegalSection({
  items,
  title,
}: {
  items: string[]
  title: string
}) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-cantiere-ink">{title}</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-cantiere-ink-secondary">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  )
}
