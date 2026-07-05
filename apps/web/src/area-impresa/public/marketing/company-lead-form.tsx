"use client";

import type { FormEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { isGeoPlace, type GeoPlace } from "@esigenta/shared";
import { Select } from "@esigenta/ui";

import { CityAutocomplete } from "../../../ui/location/city-autocomplete";

type CompanyLeadCategoryOption = {
  slug: string;
  name: string;
};

type CompanyLeadFormProps = {
  categories: CompanyLeadCategoryOption[];
};

export function CompanyLeadForm({ categories }: CompanyLeadFormProps) {
  const router = useRouter();
  const [categorySlug, setCategorySlug] = useState("");
  const [location, setLocation] = useState<GeoPlace | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.slug === categorySlug) ?? null,
    [categories, categorySlug],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCategory || !isGeoPlace(location)) {
      setError("Seleziona la tua attivita e scegli la citta dai suggerimenti.");
      return;
    }

    const params = new URLSearchParams();

    params.set("categorySlug", selectedCategory.slug);
    params.set("activity", selectedCategory.name);
    params.set("geoPlace", JSON.stringify(location));

    router.push(`/area-impresa/iscriviti?${params.toString()}`);
  }

  return (
    <div className="eg-panel p-5 md:p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="eg-mono-label text-eg-cotto-dark">Inizia da qui</p>
          <p className="eg-body-muted mt-3">
            Seleziona il mestiere e la zona: nel passaggio dopo completi il
            profilo impresa.
          </p>
        </div>

        <div className="eg-form-field">
          <label htmlFor="company-category" className="eg-form-label">
            Di cosa ti occupi?
          </label>
          <Select
            id="company-category"
            required
            value={categorySlug}
            onChange={(event) => {
              setCategorySlug(event.target.value);
              setError(null);
            }}
            className={!categorySlug ? "text-eg-ardesia" : undefined}
          >
            <option value="">Seleziona la tua categoria</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="eg-form-field">
          <label htmlFor="company-city" className="eg-form-label">
            In quale citta lavori?
          </label>
          <CityAutocomplete
            id="company-city"
            value={location}
            onChange={(nextLocation) => {
              setLocation(nextLocation);
              setError(null);
            }}
            placeholder="Cerca citta o comune"
          />
        </div>

        {error ? <p className="eg-alert">{error}</p> : null}

        <button type="submit" className="eg-button-primary w-full">
          Continua gratuitamente <span aria-hidden="true">&rarr;</span>
        </button>

        <p className="eg-form-help">
          Nessun abbonamento obbligatorio: scegli tu quali richieste aprire.
        </p>

        <p className="eg-form-help">
          I dati saranno usati per ricontattarti e gestire la richiesta. Leggi
          l&apos;
          <Link href="/privacy" className="font-medium text-eg-cotto-dark">
            informativa privacy
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
