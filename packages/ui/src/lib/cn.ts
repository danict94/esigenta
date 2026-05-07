type ClassValue = string | false | null | undefined

export function cn(...classes: ClassValue[]): string {
  const seen = new Set<string>()
  const result: string[] = []

  for (const classValue of classes) {
    if (!classValue) {
      continue
    }

    for (const className of classValue.split(/\s+/)) {
      if (!className || seen.has(className)) {
        continue
      }

      seen.add(className)
      result.push(className)
    }
  }

  return result.join(' ')
}
