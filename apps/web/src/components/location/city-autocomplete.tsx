'use client'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  MapPin,
} from 'lucide-react'

import {
  Button,
  cn,
  Input,
  tokens,
} from '@esigenta/ui'

import {
  isRuntimeLocationAnswerComplete,
  readRuntimeLocationAnswer,
} from '@esigenta/db/funnel-normalization'

import type {
  RequestGeoDraft,
} from '@esigenta/db'
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  hasFunctionalCookieConsent,
  openCookiePreferences,
} from '../privacy/cookie-consent-storage'

export type NormalizedLocation =
  RequestGeoDraft

type GoogleAddressComponent = {
  long_name: string
  short_name: string
  types: string[]
}

type GooglePlaceResult = {
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
  value: unknown
  onChange: (value: NormalizedLocation) => void
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

function getAddressComponent(
  place: GooglePlaceResult,
  types: string[],
) {
  return place.address_components
    ?.find((component) =>
      types.some((type) =>
        component.types.includes(type),
      ),
    )
    ?.long_name
}

function normalizeGooglePlace(
  place: GooglePlaceResult,
  fallbackAddress: string,
): NormalizedLocation {
  const address =
    place.formatted_address ??
    fallbackAddress.trim()

  const city =
    getAddressComponent(place, [
      'locality',
      'postal_town',
      'administrative_area_level_3',
      'administrative_area_level_2',
    ])

  const postalCode =
    getAddressComponent(place, [
      'postal_code',
    ])

  const latitude =
    place.geometry?.location?.lat()

  const longitude =
    place.geometry?.location?.lng()

  return {
    ...(address
      ? {
          address,
        }
      : {}),
    ...(city
      ? {
          city,
        }
      : {}),
    ...(postalCode
      ? {
          postalCode,
        }
      : {}),
    ...(typeof latitude ===
      'number' &&
    Number.isFinite(latitude)
      ? {
          latitude,
        }
      : {}),
    ...(typeof longitude ===
      'number' &&
    Number.isFinite(longitude)
      ? {
          longitude,
        }
      : {}),
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

  const location =
    readRuntimeLocationAnswer(
      value,
    )

  const [
    inputValue,
    setInputValue,
  ] = useState(
    location.address ?? '',
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
      location.address

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
    location.address,
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
              const fallback =
                inputRef.current?.value ?? ''

              const normalized =
                normalizeGooglePlace(
                  autocomplete.getPlace(),
                  fallback,
                )

              setInputValue(
                normalized.address ??
                  fallback,
              )

              onChangeRef.current(
                normalized,
              )

              setMessage(
                isRuntimeLocationAnswerComplete(
                  normalized,
                )
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
        <Input
          id={id}
          ref={inputRef}
          size="lg"
          value={inputValue}
          onChange={(event) => {
            const address =
              event.target.value

            setInputValue(address)
            onChange({
              address,
            })
            setMessage(
              address.trim()
                ? 'Seleziona un indirizzo dai suggerimenti.'
                : null,
            )
          }}
          placeholder={placeholder}
          className={cn(
            tokens.radius.lg,
            "h-16 pr-14 text-lg",
            className,
          )}
        />

        <MapPin
          className="pointer-events-none absolute right-6 top-1/2 size-7 -translate-y-1/2 text-text-secondary"
          aria-hidden="true"
          strokeWidth={1.5}
        />
      </div>

      {message ? (
        <div className="grid gap-2">
          <p className="text-xs text-text-muted">
            {message}
          </p>

          {!hasFunctionalConsent &&
          hasGoogleMapsApiKey ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-fit"
              onClick={openCookiePreferences}
            >
              Abilita suggerimenti
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

