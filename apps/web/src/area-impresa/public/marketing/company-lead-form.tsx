"use client";

import type { FormEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { isGeoPlace, type GeoPlace } from "@esigenta/shared";
import { cn } from "@esigenta/ui";

import { blueprintEyebrowClassName } from "../../../site/shared/section-header";
import { CityAutocomplete } from "../../../ui/location/city-autocomplete";

type CompanyLeadCategoryOption = {
  slug: string;
  name: string;
};

type CompanyLeadFormProps = {
  categories: CompanyLeadCategoryOption[];
};

function getLocationLabel(location: GeoPlace | null) {
  if (!location) {
    return null;
  }

  return [location.city, location.province].filter(Boolean).join(" / ");
}

export function CompanyLeadForm({ categories }: CompanyLeadFormProps) {
  const router = useRouter();
  const [categorySlug, setCategorySlug] = useState("");
  const [cityQuery, setCityQuery] = useState("");
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
    <form onSubmit={handleSubmit} className="border border-eg-border bg-eg-surface shadow-eg-slab">
      <div className="flex items-center justify-between gap-4 border-b border-eg-border px-6.5 py-5.5">
        <span className={blueprintEyebrowClassName}>Configura il tuo profilo</span>
        <span className="font-(family-name:--eg-font-brand) text-xs text-eg-text-muted">2 passi</span>
      </div>

      <div className="px-[26px] py-7 max-[860px]:px-5">
        <fieldset>
          <legend className="mb-3 flex items-center gap-2 font-(family-name:--eg-font-brand) text-[11.5px] font-bold uppercase text-eg-accent">
            <span className="inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-eg-accent text-[10.5px] font-bold text-eg-on-brand">
              1
            </span>
            Che professionista sei?
          </legend>

          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-2" aria-label="Categorie professionali">
              {categories.map((category) => {
                const isSelected = category.slug === categorySlug;

                return (
                  <button
                    key={category.slug}
                    type="button"
                    aria-pressed={isSelected}
                    className={cn(
                      "border px-[15px] py-2 text-sm transition-colors",
                      isSelected
                        ? "border-eg-brand-strong bg-eg-brand-strong text-eg-on-brand"
                        : "border-eg-border bg-eg-surface text-eg-ink hover:border-eg-brand",
                    )}
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
            <p className="eg-alert eg-alert-error mt-4">
              Le categorie professionali non sono disponibili in questo momento.
            </p>
          )}
        </fieldset>

        <div className="mt-7">
          <label
            htmlFor="company-city"
            className="mb-3 flex items-center gap-2 font-(family-name:--eg-font-brand) text-[11.5px] font-bold uppercase text-eg-accent"
          >
            <span className="inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-eg-accent text-[10.5px] font-bold text-eg-on-brand">
              2
            </span>
            Dove operi?
          </label>

          <div>
            <CityAutocomplete
              id="company-city"
              value={location}
              query={cityQuery}
              onQueryChange={setCityQuery}
              onChange={(nextLocation) => {
                setLocation(nextLocation);
                if (nextLocation) {
                  setCityQuery(nextLocation.formattedAddress);
                }
                setError(null);
              }}
              placeholder="Citta o provincia - es. Torino"
              className="text-[15px]"
            />
          </div>
        </div>

        {error ? <p className="eg-alert eg-alert-error mt-5">{error}</p> : null}
      </div>

      <div
        className={cn(
          "overflow-hidden border-t transition-[max-height,border-color] duration-500",
          canContinue ? "max-h-56 border-eg-border" : "max-h-0 border-transparent",
        )}
        aria-live="polite"
      >
        <div className="flex flex-wrap items-center justify-between gap-5 px-[26px] py-6 max-[860px]:px-5">
          <p className="max-w-[46ch] text-base leading-[1.5] text-eg-ink">
            Profilo per{" "}
            <b className="font-(family-name:--eg-font-ui) text-[21px] font-medium text-eg-brand-strong">
              {selectedCategory?.name ?? "-"}
            </b>{" "}
            in{" "}
            <b className="font-(family-name:--eg-font-ui) text-[21px] font-medium text-eg-brand-strong">
              {locationLabel ?? "-"}
            </b>
            . Completa l&apos;attivazione gratuita.
            <span className="mt-1.5 block font-(family-name:--eg-font-ui) text-[13px] text-eg-text-muted">
              Configuri tu zona e categorie nel profilo.
            </span>
          </p>

          <button
            type="submit"
            className="eg-button-primary whitespace-nowrap"
          >
            Attiva il profilo <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>

      <p className="px-[26px] pb-5 text-[13px] leading-[1.55] text-eg-text-muted max-[860px]:px-5">
        I dati saranno usati per preparare il profilo e ricontattarti. Leggi l&apos;
        <Link href="/privacy" className="font-medium text-eg-brand-strong hover:text-eg-brand">
          informativa privacy
        </Link>
        .
      </p>
    </form>
  );
}
