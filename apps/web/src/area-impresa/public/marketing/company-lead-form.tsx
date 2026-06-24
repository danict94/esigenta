"use client"

import type {
  FormEvent,
} from "react"

import {
  useMemo,
  useState,
} from "react"
import {
  useRouter,
} from "next/navigation"
import Link from "next/link"

import {
  Button,
  Card,
  Select,
} from "@esigenta/ui"

import {
  isGeoPlace,
  type GeoPlace,
} from "@esigenta/shared"

import {
  CityAutocomplete,
} from "../../../ui/location/city-autocomplete"

export type CompanyLeadCategoryOption = {
  slug: string
  name: string
}

type CompanyLeadFormProps = {
  categories: CompanyLeadCategoryOption[]
}

export function CompanyLeadForm({
  categories,
}: CompanyLeadFormProps) {
  const router =
    useRouter()

  const [categorySlug, setCategorySlug] =
    useState("")

  const [location, setLocation] =
    useState<GeoPlace | null>(null)

  const [error, setError] =
    useState<string | null>(null)

  const selectedCategory =
    useMemo(
      () =>
        categories.find(
          (category) =>
            category.slug === categorySlug,
        ) ?? null,
      [categories, categorySlug],
    )

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      !selectedCategory ||
      !isGeoPlace(location)
    ) {
      setError(
        "Seleziona la tua attività e scegli la città dai suggerimenti.",
      )
      return
    }

    const params =
      new URLSearchParams()

    params.set(
      "categorySlug",
      selectedCategory.slug,
    )
    params.set(
      "activity",
      selectedCategory.name,
    )
    params.set(
      "geoPlace",
      JSON.stringify(location),
    )

    router.push(
      `/area-impresa/iscriviti?${params.toString()}`,
    )
  }

  return (
    <Card className="p-5 md:p-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cantiere-ink">
            Inizia da qui
          </p>

          <p className="mt-2 text-sm leading-6 text-cantiere-ink-secondary">
            Seleziona la tua attività e la zona da cui vuoi iniziare a
            ricevere richieste.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="company-category"
            className="text-sm font-medium text-cantiere-ink"
          >
            Di cosa ti occupi?
          </label>

          <Select
            id="company-category"
            required
            value={categorySlug}
            onChange={(event) => {
              setCategorySlug(event.target.value)
              setError(null)
            }}
            className={!categorySlug ? "text-cantiere-ink-secondary" : undefined}
          >
            <option value="">
              Seleziona la tua categoria
            </option>

            {categories.map((category) => (
              <option
                key={category.slug}
                value={category.slug}
              >
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="company-city"
            className="text-sm font-medium text-cantiere-ink"
          >
            In quale città lavori?
          </label>

          <CityAutocomplete
            id="company-city"
            value={location}
            onChange={(nextLocation) => {
              setLocation(nextLocation)
              setError(null)
            }}
            placeholder="Cerca città o comune"
          />
        </div>

        {error ? (
          <p className="border border-cantiere-accent bg-cantiere-linen px-4 py-3 text-sm text-cantiere-ink">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="w-full"
        >
          Continua gratuitamente
        </Button>

        <p className="text-xs leading-5 text-cantiere-ink-secondary">
          Nel passaggio successivo completerai i dati aziendali e creerai
          l&apos;accesso impresa.
        </p>

        <p className="text-xs leading-5 text-cantiere-ink-secondary">
          I dati saranno usati per ricontattarti e gestire la richiesta. Leggi
          l&apos;
          <Link href="/privacy" className="font-medium text-cantiere-accent">
            informativa privacy
          </Link>
          .
        </p>
      </form>
    </Card>
  )
}
