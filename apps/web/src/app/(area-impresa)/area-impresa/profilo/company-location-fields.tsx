"use client"

import {
  useState,
} from "react"

import {
  Input,
} from "@fixpro/ui"

import {
  CityAutocomplete,
  type NormalizedLocation,
} from "../../../../components/location/city-autocomplete"

type CompanyLocationFieldsProps = {
  address: string | null
  city: string | null
  postalCode: string | null
  province: string | null
  latitude: number | null
  longitude: number | null
}

type SavedLocationState = {
  address: string
  city: string
  postalCode: string
  latitude: number | null
  longitude: number | null
}

function hasValidCoordinates(
  location: NormalizedLocation,
) {
  return (
    typeof location.latitude === "number" &&
    Number.isFinite(location.latitude) &&
    typeof location.longitude === "number" &&
    Number.isFinite(location.longitude)
  )
}

function toInitialSavedLocation({
  address,
  city,
  postalCode,
  latitude,
  longitude,
}: Omit<
  CompanyLocationFieldsProps,
  "province"
>): SavedLocationState {
  return {
    address:
      address ?? "",
    city:
      city ?? "",
    postalCode:
      postalCode ?? "",
    latitude:
      typeof latitude === "number"
        ? latitude
        : null,
    longitude:
      typeof longitude === "number"
        ? longitude
        : null,
  }
}

function getLocationSummary(
  location: SavedLocationState,
) {
  const mainLabel =
    location.city || location.address

  if (!mainLabel) {
    return "Nessuna sede salvata"
  }

  return [
    mainLabel,
    location.postalCode,
  ]
    .filter(Boolean)
    .join(" · ")
}

export function CompanyLocationFields({
  address,
  city,
  postalCode,
  province,
  latitude,
  longitude,
}: CompanyLocationFieldsProps) {
  const initialLocation =
    toInitialSavedLocation({
      address,
      city,
      postalCode,
      latitude,
      longitude,
    })

  const [
    selectedLocation,
    setSelectedLocation,
  ] = useState<SavedLocationState>(
    initialLocation,
  )

  const [
    draftAddress,
    setDraftAddress,
  ] = useState(
    initialLocation.address ||
      initialLocation.city,
  )

  const [
    hasUnselectedDraft,
    setHasUnselectedDraft,
  ] = useState(false)

  function handleLocationChange(
    nextLocation: NormalizedLocation,
  ) {
    const nextAddress =
      nextLocation.address ??
      nextLocation.city ??
      ""

    setDraftAddress(nextAddress)

    if (!hasValidCoordinates(nextLocation)) {
      setHasUnselectedDraft(
        nextAddress.trim() !==
          selectedLocation.address.trim(),
      )
      return
    }

    const nextSelectedLocation = {
      address:
        nextLocation.address ?? "",
      city:
        nextLocation.city ?? "",
      postalCode:
        nextLocation.postalCode ?? "",
      latitude:
        nextLocation.latitude ?? null,
      longitude:
        nextLocation.longitude ?? null,
    }

    setSelectedLocation(
      nextSelectedLocation,
    )
    setDraftAddress(
      nextSelectedLocation.address ||
        nextSelectedLocation.city,
    )
    setHasUnselectedDraft(false)
  }

  return (
    <div className="grid gap-5">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-text-primary">
          Sede operativa
        </span>

        <CityAutocomplete
          value={draftAddress}
          onChange={handleLocationChange}
          placeholder="Cerca città o indirizzo operativo"
        />

        <span className="text-xs leading-5 text-text-secondary">
          Seleziona un suggerimento per aggiornare la sede. La sede operativa
          e il raggio determinano quali richieste vengono mostrate di base.
        </span>
      </label>

      <Input
        type="hidden"
        name="address"
        value={selectedLocation.address}
        readOnly
      />
      <Input
        type="hidden"
        name="city"
        value={selectedLocation.city}
        readOnly
      />
      <Input
        type="hidden"
        name="postalCode"
        value={selectedLocation.postalCode}
        readOnly
      />
      <Input
        type="hidden"
        name="latitude"
        value={selectedLocation.latitude ?? ""}
        readOnly
      />
      <Input
        type="hidden"
        name="longitude"
        value={selectedLocation.longitude ?? ""}
        readOnly
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border-primary bg-surface-secondary px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Sede selezionata
          </p>

          <p className="mt-1 text-sm font-semibold text-text-primary">
            {getLocationSummary(
              selectedLocation,
            )}
          </p>

          {hasUnselectedDraft ? (
            <p className="mt-2 text-xs leading-5 text-text-secondary">
              Hai modificato il testo: scegli un suggerimento per aggiornare
              la sede salvata.
            </p>
          ) : null}
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-text-primary">
            Provincia
          </span>
          <Input
            name="province"
            defaultValue={province ?? ""}
            maxLength={2}
            placeholder="CT"
          />
        </label>
      </div>
    </div>
  )
}