'use client'

import { useEffect, useRef, useState, } from 'react'

import {
  type GeoPlace,
  resolvePlaceFromGooglePlace,
} from '@esigenta/shared'

import {
  COOKIE_CONSENT_CHANGED_EVENT,
  hasFunctionalCookieConsent,
  openCookiePreferences,
} from '../../site/shell/cookie-consent-storage'

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
  placeholder?: string
  className?: string
}

const GOOGLE_MAPS_SCRIPT_ID =
  'esigenta-google-maps-places'

let googleMapsPlacesPromise:
  | Promise<void>
  | null = null

function joinClasses(
  ...classes: Array<string | false | null | undefined>
) {
  return classes.filter(Boolean).join(' ')
}

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
  placeholder = 'Cerca indirizzo o comune',
  className,
}: CityAutocompleteProps) {
  const inputRef =
    useRef<HTMLInputElement | null>(
      null,
    )

  const onChangeRef =
    useRef(onChange)

  const listenerRef =
    useRef<GoogleAutocompleteListener | null>(
      null,
    )

  const [
    inputValue,
    setInputValue,
  ] = useState(
    value?.formattedAddress ?? '',
  )

  const [message, setMessage] =
    useState<string | null>(null)
  const [
    hasFunctionalConsent,
    setHasFunctionalConsent,
  ] = useState(false)

  const hasGoogleMapsApiKey = Boolean(
    process.env
      .NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  )

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    function syncFunctionalConsent() {
      setHasFunctionalConsent(
        hasFunctionalCookieConsent(),
      )
    }

    const syncTimeout =
      window.setTimeout(
        syncFunctionalConsent,
        0,
      )

    window.addEventListener(
      COOKIE_CONSENT_CHANGED_EVENT,
      syncFunctionalConsent,
    )

    return () => {
      window.clearTimeout(syncTimeout)
      window.removeEventListener(
        COOKIE_CONSENT_CHANGED_EVENT,
        syncFunctionalConsent,
      )
    }
  }, [])

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
  ])

  useEffect(() => {
    const apiKey =
      process.env
        .NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
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

    if (!hasFunctionalConsent) {
      const messageTimeout =
        window.setTimeout(() => {
          setMessage(
            'I suggerimenti automatici usano Google Maps. Puoi abilitarli dalle preferenze cookie.',
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
          !inputRef.current
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
            inputRef.current,
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

              setInputValue(
                resolved?.formattedAddress ??
                  inputRef.current?.value ??
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
  }, [hasFunctionalConsent])

  return (
    <div className="grid gap-2">
      <div className="relative">
        <input
          id={id}
          ref={inputRef}
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
          className={joinClasses(
            "h-16 w-full border-0 border-b border-eg-terra bg-transparent pr-14 text-lg text-eg-terra outline-none placeholder:text-eg-ardesia-2 focus:border-eg-cotto-dark",
            className,
          )}
        />

        <span
          className="pointer-events-none absolute right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-eg-cotto-dark"
          aria-hidden="true"
        />
      </div>

      {message ? (
        <div className="grid gap-2">
          <p className="eg-form-help">
            {message}
          </p>

          {!hasFunctionalConsent &&
          hasGoogleMapsApiKey ? (
            <button
              type="button"
              className="eg-button-ghost min-h-9 w-fit px-4"
              onClick={openCookiePreferences}
            >
              Abilita suggerimenti
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
