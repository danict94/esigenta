'use client'

import {
  type MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  type GeoPlace,
  resolvePlaceFromGooglePlace,
} from '@esigenta/shared'
import { cn } from '@esigenta/ui'

// Google Maps/Places è disponibilità tecnica del funnel, non un servizio
// facoltativo: deve inizializzarsi indipendentemente dal consenso cookie
// "Funzionali" (nessuna scelta, rifiuto o accettazione producono lo stesso
// caricamento). Per questo il componente non legge più
// site/shell/cookie-consent-storage — vedi audit consenso/Maps. GA4 e Google
// Ads restano invece gated sulle rispettive categorie in
// site/analytics/ga4-events.ts e site/shell/ga4-minimal-loader.tsx, qui
// non toccati.

type GoogleAddressComponent = {
  long_name: string
  short_name: string
  types: string[]
}

type GooglePlaceResult = {
  place_id?: string
  formatted_address?: string
  address_components?: GoogleAddressComponent[]
  geometry?: {
    location?: {
      lat: () => number
      lng: () => number
    }
  }
}

type GoogleAutocompleteListener = {
  remove: () => void
}

type GoogleAutocomplete = {
  addListener: (
    eventName: 'place_changed',
    handler: () => void,
  ) => GoogleAutocompleteListener
  getPlace: () => GooglePlaceResult
}

type GoogleMapsWindow = Window &
  typeof globalThis & {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (
            input: HTMLInputElement,
            options: {
              fields: string[]
              componentRestrictions: {
                country: string
              }
              types: string[]
            },
          ) => GoogleAutocomplete
        }
      }
    }
  }

type CityAutocompleteProps = {
  id?: string
  value: GeoPlace | null
  onChange: (value: GeoPlace | null) => void
  query?: string
  onQueryChange?: (value: string) => void
  inputRef?: MutableRefObject<HTMLInputElement | null>
  placeholder?: string
  className?: string
}

const GOOGLE_MAPS_SCRIPT_ID =
  'esigenta-google-maps-places'

let googleMapsPlacesPromise:
  | Promise<void>
  | null = null

function getGoogleMapsWindow() {
  return window as GoogleMapsWindow
}

function hasGooglePlaces() {
  return Boolean(
    getGoogleMapsWindow().google?.maps
      ?.places?.Autocomplete,
  )
}

function loadGoogleMapsPlaces(
  apiKey: string,
) {
  if (hasGooglePlaces()) {
    return Promise.resolve()
  }

  if (googleMapsPlacesPromise) {
    return googleMapsPlacesPromise
  }

  googleMapsPlacesPromise =
    new Promise<void>(
      (resolve, reject) => {
        const existingScript =
          document.getElementById(
            GOOGLE_MAPS_SCRIPT_ID,
          ) as HTMLScriptElement | null

        const handleLoad = () => {
          if (hasGooglePlaces()) {
            resolve()
            return
          }

          reject(
            new Error(
              'Google Places library unavailable',
            ),
          )
        }

        const handleError = () => {
          reject(
            new Error(
              'Google Maps script failed to load',
            ),
          )
        }

        if (existingScript) {
          existingScript.addEventListener(
            'load',
            handleLoad,
            {
              once: true,
            },
          )
          existingScript.addEventListener(
            'error',
            handleError,
            {
              once: true,
            },
          )
          return
        }

        const script =
          document.createElement('script')

        script.id =
          GOOGLE_MAPS_SCRIPT_ID
        script.async = true
        script.defer = true
        script.src =
          `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&language=it&region=IT`

        script.addEventListener(
          'load',
          handleLoad,
          {
            once: true,
          },
        )
        script.addEventListener(
          'error',
          handleError,
          {
            once: true,
          },
        )

        document.head.appendChild(script)
      },
    )

  return googleMapsPlacesPromise
}

/**
 * Unica condizione per inizializzare Maps/Places: la presenza della API
 * key. Deliberatamente NON accetta alcun parametro di consenso — a
 * differenza di GA4/Ads (site/analytics/consent-signals.ts, gated su
 * analytics/marketing), Google Maps/Places nel funnel non deve mai
 * dipendere dalla scelta cookie dell'utente: nessuna scelta, rifiuto o
 * accettazione producono lo stesso risultato. Estratta come funzione pura
 * così l'invariante è verificabile senza montare il componente/il DOM —
 * vedi city-autocomplete.test.ts.
 */
export function canLoadGoogleMapsPlaces(
  apiKey: string | null | undefined,
): apiKey is string {
  return Boolean(apiKey)
}

function toResolverInput(
  place: GooglePlaceResult,
) {
  return {
    placeId: place.place_id,
    formattedAddress: place.formatted_address,
    addressComponents: place.address_components?.map(
      (component) => ({
        longName: component.long_name,
        shortName: component.short_name,
        types: component.types,
      }),
    ),
    latitude: place.geometry?.location?.lat(),
    longitude: place.geometry?.location?.lng(),
  }
}

export function CityAutocomplete({
  id,
  value,
  onChange,
  query,
  onQueryChange,
  inputRef: externalInputRef,
  placeholder = 'Cerca indirizzo o comune',
  className,
}: CityAutocompleteProps) {
  const autocompleteInputRef =
    useRef<HTMLInputElement | null>(
      null,
    )

  const onChangeRef =
    useRef(onChange)

  const setInputValueRef =
    useRef<(nextValue: string) => void>(
      () => {},
    )

  const listenerRef =
    useRef<GoogleAutocompleteListener | null>(
      null,
    )

  const [
    internalInputValue,
    setInternalInputValue,
  ] = useState(
    value?.formattedAddress ?? '',
  )

  const inputValue =
    query ?? internalInputValue

  const setInputValue = useCallback(
    (nextValue: string) => {
      if (query === undefined) {
        setInternalInputValue(nextValue)
      }

      onQueryChange?.(nextValue)
    },
    [query, onQueryChange],
  )

  const [message, setMessage] =
    useState<string | null>(null)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    setInputValueRef.current = setInputValue
  }, [setInputValue])

  useEffect(() => {
    const nextAddress =
      value?.formattedAddress

    if (
      nextAddress &&
      nextAddress !== inputValue
    ) {
      const syncInputTimeout =
        window.setTimeout(() => {
          setInputValue(nextAddress)
        }, 0)

      return () => {
        window.clearTimeout(syncInputTimeout)
      }
    }

    return undefined
  }, [
    inputValue,
    value?.formattedAddress,
    setInputValue,
  ])

  useEffect(() => {
    const apiKey =
      process.env
        .NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!canLoadGoogleMapsPlaces(apiKey)) {
      const messageTimeout =
        window.setTimeout(() => {
          setMessage(
            'Autocomplete indirizzi non configurato.',
          )
        }, 0)

      return () => {
        window.clearTimeout(messageTimeout)
      }
    }

    let active = true
    const clearMessageTimeout =
      window.setTimeout(() => {
        setMessage(null)
      }, 0)

    void loadGoogleMapsPlaces(apiKey)
      .then(() => {
        if (
          !active ||
          !autocompleteInputRef.current
        ) {
          return
        }

        const Autocomplete =
          getGoogleMapsWindow().google
            ?.maps?.places
            ?.Autocomplete

        if (!Autocomplete) {
          setMessage(
            'Autocomplete indirizzi non disponibile.',
          )
          return
        }

        const autocomplete =
          new Autocomplete(
            autocompleteInputRef.current,
            {
              fields: [
                'place_id',
                'formatted_address',
                'address_components',
                'geometry',
              ],
              componentRestrictions: {
                country: 'it',
              },
              types: ['geocode'],
            },
          )

        listenerRef.current =
          autocomplete.addListener(
            'place_changed',
            () => {
              const resolved =
                resolvePlaceFromGooglePlace(
                  toResolverInput(
                    autocomplete.getPlace(),
                  ),
                )

              setInputValueRef.current(
                resolved?.formattedAddress ??
                  autocompleteInputRef.current?.value ??
                  '',
              )

              onChangeRef.current(
                resolved,
              )

              setMessage(
                resolved
                  ? null
                  : 'Seleziona un indirizzo dai suggerimenti.',
              )
            },
          )
      })
      .catch(() => {
        if (!active) {
          return
        }

        setMessage(
          'Autocomplete indirizzi non disponibile.',
        )
      })

    return () => {
      active = false
      window.clearTimeout(
        clearMessageTimeout,
      )
      listenerRef.current?.remove()
      listenerRef.current = null
    }
    // Intenzionalmente []: il caricamento di Maps/Places non deve più
    // ripartire (né essere smontato/reinizializzato) quando il consenso
    // cookie cambia — dipende solo dalla presenza della API key, letta una
    // volta al mount. loadGoogleMapsPlaces ha comunque una guardia
    // idempotente a livello di modulo (googleMapsPlacesPromise +
    // hasGooglePlaces) che previene un doppio <script> anche in caso di
    // più istanze di CityAutocomplete montate insieme (funnel, form lead
    // impresa, profilo impresa).
  }, [])

  return (
    <div className="grid gap-2">
      <div className="relative">
        <input
          id={id}
          ref={(node) => {
            autocompleteInputRef.current = node

            if (externalInputRef) {
              externalInputRef.current = node
            }
          }}
          value={inputValue}
          onChange={(event) => {
            const address =
              event.target.value

            setInputValue(address)

            // Editing the text invalidates any previously selected place —
            // a GeoPlace is only ever produced whole, from a real Google
            // selection (see resolvePlaceFromGooglePlace). There is no
            // partial/typed-only GeoPlace.
            onChange(null)

            setMessage(
              address.trim()
                ? 'Seleziona un indirizzo dai suggerimenti.'
                : null,
            )
          }}
          placeholder={placeholder}
          className={cn(
            "h-16 w-full border-0 border-b border-eg-border bg-transparent pr-14 text-lg text-eg-ink outline-none placeholder:text-eg-text-muted focus:border-eg-brand",
            className,
          )}
        />

        <span
          className="pointer-events-none absolute right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-eg-brand"
          aria-hidden="true"
        />
      </div>

      {message ? (
        <p className="eg-form-help">
          {message}
        </p>
      ) : null}
    </div>
  )
}
