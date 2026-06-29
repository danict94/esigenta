export type RuntimeCapabilityRenderer =
  | "contact"
  | "location"
  | "single-select"
  | "multi-select"
  | "number"
  | "photo-upload"
  | "textarea"

export function resolveCapabilityRenderer(
  type: string,
): RuntimeCapabilityRenderer {
  switch (type) {
    case "contact":
      return "contact"

    case "location":
      return "location"

    case "single_select":
      return "single-select"

    case "multi_select":
      return "multi-select"

    case "number":
      return "number"

    case "photo_upload":
      return "photo-upload"

    default:
      return "textarea"
  }
}