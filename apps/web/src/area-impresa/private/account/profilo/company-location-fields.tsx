"use client"

import {
  useState,
} from "react"

import {
  Input,
} from "@esigenta/ui"

import {
  type GeoPlace,
} from "@esigenta/shared"

import {
  CityAutocomplete,
} from "../../../../ui/location/city-autocomplete"

type CompanyLocationFieldsProps = {
  geoPlace: GeoPlace | null
}

function getLocationSummary(
  geoPlace: GeoPlace | null,
) {
  if (!geoPlace) {
    return "Nessuna sede salvata"
  }

  return [
    geoPlace.city,
    geoPlace.postalCode,
  ]
    .filter(Boolean)
    .join(" · ")
}

export function CompanyLocationFields({
  geoPlace: initialGeoPlace,
}: CompanyLocationFieldsProps) {
  const [
    geoPlace,
    setGeoPlace,
  ] = useState<GeoPlace | null>(
    initialGeoPlace,
  )

  return (
    <div className="grid gap-5">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-eg-ink">
          Sede operativa
        </span>

        <CityAutocomplete
          value={geoPlace}
          onChange={setGeoPlace}
          placeholder="Cerca città o indirizzo operativo"
        />

        <span className="text-xs leading-5 text-eg-text-muted">
          Seleziona un suggerimento per aggiornare la sede. La sede operativa
          e il raggio determinano quali richieste vengono mostrate di base.
        </span>
      </label>

      <Input
        type="hidden"
        name="geoPlace"
        value={
          geoPlace
            ? JSON.stringify(geoPlace)
            : ""
        }
        readOnly
      />

      <div className="rounded-lg border border-eg-border bg-eg-surface-muted px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-eg-text-muted">
          Sede selezionata
        </p>

        <p className="mt-1 text-sm font-semibold text-eg-ink">
          {getLocationSummary(geoPlace)}
        </p>

        {!geoPlace ? (
          <p className="mt-2 text-xs leading-5 text-eg-text-muted">
            Scegli un suggerimento per impostare la sede salvata.
          </p>
        ) : null}
      </div>
    </div>
  )
}
