"use client"

import {
  openCookiePreferences,
} from "./cookie-consent-storage"

type CookiePreferencesButtonProps = {
  className?: string
}

export function CookiePreferencesButton({
  className,
}: CookiePreferencesButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={openCookiePreferences}
    >
      Preferenze cookie
    </button>
  )
}
