/**
 * Esigenta V2 — Photos Capability
 *
 * FOUNDATION CAPABILITY
 *
 * IMPORTANT:
 * This file defines ONLY the runtime acquisition contract.
 *
 * It does NOT implement:
 * - uploads
 * - storage
 * - UploadThing
 * - image optimization
 * - moderation
 * - frontend rendering
 *
 * Photos are important for:
 * - lead quality
 * - quotation quality
 * - professional confidence
 * - request clarity
 */

import type {
  RuntimeCapability,
} from "../types/capability"

export const photosCapability: RuntimeCapability = {
  /**
   * Stable runtime acquisition identifier.
   */
  id: "photos",

  /**
   * Runtime rendering type.
   */
  type: "photo_upload",

  /**
   * User-facing acquisition question.
   */
  question: "Hai foto del lavoro?",

  /**
   * Lightweight helper copy.
   */
  description:
    "Le foto aiutano il professionista a capire meglio la situazione, ma puoi continuare anche senza.",

  /**
   * Photos should be strongly encouraged,
   * but not aggressively mandatory.
   *
   * IMPORTANT:
   * Lightweight UX first.
   */
  optional: true,
}
