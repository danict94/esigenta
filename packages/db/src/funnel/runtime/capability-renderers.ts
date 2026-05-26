export type RuntimeCapabilityRenderer =
  | "contact"
  | "location"
  | "single-select"
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

    case "number":
      return "number"

    case "photo_upload":
      return "photo-upload"

    default:
      return "textarea"
  }
}