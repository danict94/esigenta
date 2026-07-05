"use client";

export type GeoRequestFormProps = {
  funnelSlug: string;
};

export function GeoRequestForm({ funnelSlug }: GeoRequestFormProps) {
  const requestHref = `/richiesta/${funnelSlug}`;

  return (
    <form action={requestHref} method="get" className="eg-panel space-y-5 p-5">
      <div>
        <h3 className="eg-h3 text-[22px]">Trova professionisti nella tua zona</h3>

        <p className="eg-body-muted mt-2">
          Inserisci il comune e continua con la richiesta.
        </p>
      </div>

      <div className="eg-form-field">
        <label htmlFor="seo-geo-city" className="eg-form-label">
          Comune o citt&agrave;
        </label>

        <input
          id="seo-geo-city"
          name="city"
          type="text"
          autoComplete="address-level2"
          placeholder="Inserisci il comune"
          aria-describedby="seo-geo-city-help"
          className="w-full border-0 border-b border-eg-terra bg-transparent px-0 py-3 text-base text-eg-terra outline-none placeholder:text-eg-ardesia-2 focus:border-eg-cotto-dark"
        />
      </div>

      <button type="submit" className="eg-button-primary w-full">
        Richiedi preventivi
      </button>

      <p id="seo-geo-city-help" className="eg-form-help">
        Potrai confermare il comune nel passaggio successivo.
      </p>
    </form>
  );
}
