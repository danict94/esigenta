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
  CityAutocomplete,
  type NormalizedLocation,
} from "../../../../components/location/city-autocomplete"

export type CompanyLeadCategoryOption = {
  slug: string
  name: string
}

type CompanyLeadFormProps = {
  categories: CompanyLeadCategoryOption[]
}

function appendParam(
  params: URLSearchParams,
  key: string,
  value: string | number | undefined,
) {
  if (
    value === undefined ||
    value === ""
  ) {
    return
  }

  params.set(key, String(value))
}

export function CompanyLeadForm({
  categories,
}: CompanyLeadFormProps) {
  const router =
    useRouter()

  const [categorySlug, setCategorySlug] =
    useState("")

  const [location, setLocation] =
    useState<NormalizedLocation>({})

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

    const normalizedCity =
      location.city?.trim()

    if (
      !selectedCategory ||
      !normalizedCity ||
      location.latitude === undefined ||
      location.longitude === undefined
    ) {
      setError(
        "Seleziona la tua attività e scegli la città dai suggerimenti.",
      )
      return
    }

    const params =
      new URLSearchParams()

    appendParam(
      params,
      "categorySlug",
      selectedCategory.slug,
    )
    appendParam(
      params,
      "activity",
      selectedCategory.name,
    )
    appendParam(
      params,
      "city",
      normalizedCity,
    )
    appendParam(
      params,
      "postalCode",
      location.postalCode?.trim(),
    )
    appendParam(
      params,
      "address",
      location.address?.trim(),
    )
    appendParam(
      params,
      "latitude",
      location.latitude,
    )
    appendParam(
      params,
      "longitude",
      location.longitude,
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
          <p className="text-sm font-semibold uppercase tracking-wide text-text-primary">
            Inizia da qui
          </p>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Seleziona la tua attività e la zona da cui vuoi iniziare a
            ricevere richieste.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="company-category"
            className="text-sm font-medium text-text-primary"
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
            className={!categorySlug ? "text-text-muted" : undefined}
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
            className="text-sm font-medium text-text-primary"
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
          <p className="border border-border-focus bg-surface-secondary px-4 py-3 text-sm text-text-primary">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="w-full"
        >
          Continua gratuitamente
        </Button>

        <p className="text-xs leading-5 text-text-muted">
          Nel passaggio successivo completerai i dati aziendali e creerai
          l&apos;accesso impresa.
        </p>

        <p className="text-xs leading-5 text-text-muted">
          I dati saranno usati per ricontattarti e gestire la richiesta. Leggi
          l&apos;
          <Link href="/privacy" className="font-medium text-brand-primary">
            informativa privacy
          </Link>
          .
        </p>
      </form>
    </Card>
  )
}
