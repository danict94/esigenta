"use client";

import { ArrowRight } from "lucide-react";

import { Button, Input, cn } from "@esigenta/ui";

export type GeoRequestFormProps = {
  funnelSlug: string;
};

export function GeoRequestForm({ funnelSlug }: GeoRequestFormProps) {
  const requestHref = `/richiesta/${funnelSlug}`;

  return (
    <form
      action={requestHref}
      method="get"
      className={cn(
        "rounded-lg",
        "space-y-4 border border-cantiere-hairline bg-cantiere-paper p-5",
      )}
    >
      <div className="space-y-2">
        <h3 className="text-xl font-semibold leading-7 text-cantiere-ink">
          Trova professionisti nella tua zona
        </h3>

        <p className="text-sm leading-6 text-cantiere-ink-secondary">
          Inserisci il comune e continua con la richiesta.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="seo-geo-city"
          className="text-sm font-medium text-cantiere-ink"
        >
          Comune o città
        </label>

        <Input
          id="seo-geo-city"
          type="text"
          size="lg"
          autoComplete="address-level2"
          placeholder="Inserisci il comune"
          aria-describedby="seo-geo-city-help"
        />
      </div>

      <Button type="submit" variant="brand" size="lg" className="w-full gap-2">
        Richiedi preventivi nella tua zona
        <ArrowRight className="size-4" aria-hidden={true} />
      </Button>

      <p id="seo-geo-city-help" className="text-sm leading-6 text-cantiere-ink-secondary">
        Potrai confermare il comune nel passaggio successivo.
      </p>
    </form>
  );
}
