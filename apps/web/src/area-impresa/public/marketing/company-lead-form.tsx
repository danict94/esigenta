"use client";

import type { FormEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { isGeoPlace, type GeoPlace } from "@esigenta/shared";

import { CityAutocomplete } from "../../../ui/location/city-autocomplete";

type CompanyLeadCategoryOption = {
  slug: string;
  name: string;
};

type CompanyLeadFormProps = {
  categories: CompanyLeadCategoryOption[];
};

const exampleCities = ["Milano", "Roma", "Torino", "Napoli", "Bologna", "Firenze"] as const;

function getLocationLabel(location: GeoPlace | null) {
  if (!location) {
    return null;
  }

  return [location.city, location.province].filter(Boolean).join(" / ");
}

export function CompanyLeadForm({ categories }: CompanyLeadFormProps) {
  const router = useRouter();
  const [categorySlug, setCategorySlug] = useState("");
  const [location, setLocation] = useState<GeoPlace | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.slug === categorySlug) ?? null,
    [categories, categorySlug],
  );
  const locationLabel = getLocationLabel(location);
  const canContinue = Boolean(selectedCategory && isGeoPlace(location));

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
    <form onSubmit={handleSubmit} className="border border-eg-hairline bg-eg-calce-2">
      <div className="flex items-center justify-between gap-4 border-b border-eg-hairline px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.1em] text-eg-ardesia">
        <span>Configura il tuo profilo</span>
        <span>2 passi</span>
      </div>

      <div className="px-[26px] py-7 max-[860px]:px-5">
        <fieldset>
          <legend className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.04em] text-eg-cotto-dark">
            <span className="inline-flex size-[18px] items-center justify-center rounded-full border border-eg-cotto-dark text-[10px]">
              1
            </span>
            Che professionista sei?
          </legend>

          {categories.length > 0 ? (
            <div className="mt-3.5 flex flex-wrap gap-2" aria-label="Categorie professionali">
              {categories.map((category) => {
                const isSelected = category.slug === categorySlug;

                return (
                  <button
                    key={category.slug}
                    type="button"
                    aria-pressed={isSelected}
                    className={[
                      "border px-[15px] py-2 text-sm transition-colors",
                      "rounded-full",
                      isSelected
                        ? "border-eg-terra bg-eg-terra text-eg-calce"
                        : "border-eg-hairline bg-eg-calce text-eg-terra hover:border-eg-terra",
                    ].join(" ")}
                    onClick={() => {
                      setCategorySlug(category.slug);
                      setError(null);
                    }}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="eg-alert mt-4">
              Le categorie professionali non sono disponibili in questo momento.
            </p>
          )}
        </fieldset>

        <div className="mt-7">
          <label
            htmlFor="company-city"
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.04em] text-eg-cotto-dark"
          >
            <span className="inline-flex size-[18px] items-center justify-center rounded-full border border-eg-cotto-dark text-[10px]">
              2
            </span>
            Dove operi?
          </label>

          <div className="mt-3.5">
            <CityAutocomplete
              id="company-city"
              value={location}
              onChange={(nextLocation) => {
                setLocation(nextLocation);
                setError(null);
              }}
              placeholder="Citta o provincia - es. Torino"
              className="text-[15px]"
            />
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Esempi di citta">
            {exampleCities.map((city) => (
              <span
                key={city}
                className="rounded-full border border-eg-hairline px-2.5 py-1 font-mono text-[11px] text-eg-ardesia"
              >
                {city}
              </span>
            ))}
          </div>
        </div>

        {error ? <p className="eg-alert mt-5">{error}</p> : null}
      </div>

      <div
        className={[
          "overflow-hidden border-t transition-[max-height,border-color] duration-500",
          canContinue ? "max-h-56 border-eg-hairline" : "max-h-0 border-transparent",
        ].join(" ")}
        aria-live="polite"
      >
        <div className="flex flex-wrap items-center justify-between gap-5 px-[26px] py-6 max-[860px]:px-5">
          <p className="max-w-[46ch] text-base leading-[1.5] text-eg-terra">
            Profilo per{" "}
            <b className="font-mono text-[21px] font-medium text-eg-cotto-dark">
              {selectedCategory?.name ?? "-"}
            </b>{" "}
            in{" "}
            <b className="font-mono text-[21px] font-medium text-eg-cotto-dark">
              {locationLabel ?? "-"}
            </b>
            . Completa l&apos;attivazione gratuita.
            <span className="mt-1.5 block font-mono text-[13px] text-eg-salvia">
              Zona protetta: configuri tu raggio e categorie nel profilo.
            </span>
          </p>

          <button type="submit" className="eg-button-primary whitespace-nowrap">
            Attiva il profilo <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>

      <p className="px-[26px] pb-5 text-[13px] leading-[1.55] text-eg-ardesia max-[860px]:px-5">
        I dati saranno usati per preparare il profilo e ricontattarti. Leggi l&apos;
        <Link href="/privacy" className="font-medium text-eg-cotto-dark">
          informativa privacy
        </Link>
        .
      </p>
    </form>
  );
}
