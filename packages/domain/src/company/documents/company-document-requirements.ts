import type { CompanyDocumentType } from "@prisma/client"

// Type-only import: erased at compile time, so this file never pulls the
// R2/AWS SDK runtime (packages/uploads/src/r2-client.ts) into whatever
// bundles this config — including any future client component that reads
// requirement labels for a form. The literal MIME lists below match
// COMPANY_DOCUMENT_ALLOWED_MIME_TYPES exactly; keep them in sync if that
// list changes.
import type { CompanyDocumentMimeType } from "@esigenta/uploads/r2"

const ALL_ACCEPTED_MIME_TYPES: readonly CompanyDocumentMimeType[] = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]

const DEFAULT_MAX_SIZE_BYTES = 15 * 1024 * 1024

export type CompanyDocumentRequirement = {
  type: CompanyDocumentType
  label: string
  description: string
  requiredByDefault: boolean
  acceptedMimeTypes: readonly CompanyDocumentMimeType[]
  maxSizeBytes: number
  /**
   * Reserved for future per-category requirements (e.g. DURC mandatory
   * only for categories with on-site crews). Empty/undefined today means
   * "applies the same way to every category" — no category-specific logic
   * exists yet, this is only the extension point.
   */
  categorySlugs?: readonly string[]
}

/**
 * THE single source of truth for which document types exist, their
 * MVP obbligatorietà, and their upload constraints. Purely static
 * configuration — no DB read, no business logic. Consumed by both
 * deriveCompanyDocumentsStatus (missing/required calculation) and any
 * future upload UI (labels, accepted types).
 */
export const COMPANY_DOCUMENT_REQUIREMENTS: readonly CompanyDocumentRequirement[] = [
  {
    type: "VISURA_CAMERALE",
    label: "Visura camerale",
    description: "Estratto aggiornato del registro delle imprese.",
    requiredByDefault: true,
    acceptedMimeTypes: ALL_ACCEPTED_MIME_TYPES,
    maxSizeBytes: DEFAULT_MAX_SIZE_BYTES,
  },
  {
    type: "ID_RAPPRESENTANTE",
    label: "Documento del rappresentante legale",
    description:
      "Carta d'identità o documento equivalente del rappresentante legale.",
    requiredByDefault: true,
    acceptedMimeTypes: ALL_ACCEPTED_MIME_TYPES,
    maxSizeBytes: DEFAULT_MAX_SIZE_BYTES,
  },
  {
    type: "DURC",
    label: "DURC",
    description:
      "Documento Unico di Regolarità Contributiva, se applicabile alla tua attività.",
    requiredByDefault: false,
    acceptedMimeTypes: ALL_ACCEPTED_MIME_TYPES,
    maxSizeBytes: DEFAULT_MAX_SIZE_BYTES,
  },
  {
    type: "ASSICURAZIONE_RC",
    label: "Assicurazione RC",
    description: "Polizza di responsabilità civile, se già disponibile.",
    requiredByDefault: false,
    acceptedMimeTypes: ALL_ACCEPTED_MIME_TYPES,
    maxSizeBytes: DEFAULT_MAX_SIZE_BYTES,
  },
  {
    type: "CERTIFICAZIONE",
    label: "Certificazioni",
    description:
      "Certificazioni o patentini specifici per la categoria, se richiesti in futuro.",
    requiredByDefault: false,
    acceptedMimeTypes: ALL_ACCEPTED_MIME_TYPES,
    maxSizeBytes: DEFAULT_MAX_SIZE_BYTES,
  },
]

export function getRequiredCompanyDocumentTypes(): CompanyDocumentType[] {
  return COMPANY_DOCUMENT_REQUIREMENTS.filter(
    (requirement) => requirement.requiredByDefault,
  ).map((requirement) => requirement.type)
}
