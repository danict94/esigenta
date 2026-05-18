'use client'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Input,
} from '@fixpro/ui'

export type NormalizedLocation = {
  address?: string
  city?: string
  postalCode?: string
  latitude?: number
  longitude?: number
}

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
  'fixpro-google-maps-places'

let googleMapsPlacesPromise:
  | Promise<void>
  | null = null

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value),
  )
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

export function getLocationAnswer(
  value: unknown,
): NormalizedLocation {
  if (typeof value === 'string') {
    return {
      address: value,
    }
  }

  if (!isRecord(value)) {
    return {}
  }

  return {
    address:
      typeof value.address === 'string'
        ? value.address
        : '',
    city:
      typeof value.city === 'string'
        ? value.city
        : '',
    postalCode:
      typeof value.postalCode ===
      'string'
        ? value.postalCode
        : '',
    latitude:
      typeof value.latitude ===
        'number' &&
      Number.isFinite(value.latitude)
        ? value.latitude
        : undefined,
    longitude:
      typeof value.longitude ===
        'number' &&
      Number.isFinite(value.longitude)
        ? value.longitude
        : undefined,
  }
}

export function isLocationComplete(
  value: unknown,
) {
  const location =
    getLocationAnswer(value)

  return Boolean(
    location.address &&
      location.city &&
      typeof location.latitude ===
        'number' &&
      Number.isFinite(
        location.latitude,
      ) &&
      typeof location.longitude ===
        'number' &&
      Number.isFinite(
        location.longitude,
      ),
  )
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
    getLocationAnswer(value)

  const [
    inputValue,
    setInputValue,
  ] = useState(
    location.address ?? '',
  )

  const [message, setMessage] =
    useState<string | null>(null)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

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

    let active = true

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
                isLocationComplete(
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
      listenerRef.current?.remove()
      listenerRef.current = null
    }
  }, [])

  return (
    <div className="grid gap-2">
      <Input
        id={id}
        ref={inputRef}
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
        className={className}
      />

      {message ? (
        <p className="text-xs text-text-muted">
          {message}
        </p>
      ) : null}
    </div>
  )
}

