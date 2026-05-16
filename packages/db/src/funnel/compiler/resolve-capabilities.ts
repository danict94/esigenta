/**
 * FixPro V2 — Runtime Capability Resolver
 *
 * FOUNDATION COMPILER
 *
 * IMPORTANT:
 * This file resolves final runtime acquisition
 * capabilities from:
 *
 * - runtime presets
 * - runtime composition
 * - future runtime inference
 *
 * This layer MUST remain:
 * - deterministic
 * - lightweight
 * - anti-overengineering
 *
 * Avoid:
 * - workflow engines
 * - branching graphs
 * - complex orchestration systems
 */

import type {
  RuntimeCapabilityId,
  RuntimePresetSlug,
} from "../types/runtime-profile"

import {
  interiorWorkPreset,
} from "../presets/interior-work"

import {
  exteriorWorkPreset,
} from "../presets/exterior-work"

import {
  emergencyRepairPreset,
} from "../presets/emergency-repair"

import {
  renovationPreset,
} from "../presets/renovation"

import {
  quickServicePreset,
} from "../presets/quick-service"

import {
  paintingPreset,
} from "../presets/painting"

import {
  plumbingEmergencyPreset,
} from "../presets/plumbing-emergency"

import {
  homeRenovationPreset,
} from "../presets/home-renovation"

import {
  bathroomRenovationPreset,
} from "../presets/bathroom-renovation"

import {
  electricalWorkPreset,
} from "../presets/electrical-work"

import {
  genericPreset,
} from "../presets/generic"

/**
 * Runtime preset registry.
 *
 * IMPORTANT:
 * Keep lightweight and explicit.
 */
const PRESET_CAPABILITIES: Record<
  RuntimePresetSlug,
  RuntimeCapabilityId[]
> = {
  INTERIOR_WORK:
    interiorWorkPreset.capabilities,

  EXTERIOR_WORK:
    exteriorWorkPreset.capabilities,

  EMERGENCY_REPAIR:
    emergencyRepairPreset.capabilities,

  RENOVATION:
    renovationPreset.capabilities,

  QUICK_SERVICE:
    quickServicePreset.capabilities,

  PAINTING:
    paintingPreset.capabilities,

  PLUMBING_EMERGENCY:
    plumbingEmergencyPreset.capabilities,

  HOME_RENOVATION:
    homeRenovationPreset.capabilities,

  BATHROOM_RENOVATION:
    bathroomRenovationPreset.capabilities,

  ELECTRICAL_WORK:
    electricalWorkPreset.capabilities,

  GENERIC:
    genericPreset.capabilities,
}

/**
 * Resolve final runtime acquisition capabilities.
 *
 * IMPORTANT:
 * Runtime capabilities are acquisition primitives.
 *
 * They are NOT:
 * - semantic meaning
 * - taxonomy definitions
 * - intervention ownership
 */
export function resolveCapabilities(
  presetSlugs: RuntimePresetSlug[],
): RuntimeCapabilityId[] {
  const capabilities =
    new Set<RuntimeCapabilityId>()

  for (const presetSlug of presetSlugs) {
    const presetCapabilities =
      PRESET_CAPABILITIES[presetSlug]

    if (!presetCapabilities) {
      continue
    }

    for (const capability of presetCapabilities) {
      capabilities.add(capability)
    }
  }

  /**
   * Stable deterministic output.
   */
  return Array.from(capabilities)
}
