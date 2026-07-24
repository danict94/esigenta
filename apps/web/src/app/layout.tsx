import type { Metadata } from "next"
import type { ReactNode } from "react"
import { fontVariables } from "@esigenta/ui/fonts"

import "./globals.css"
import { CookieConsent } from "../site/shell/cookie-consent"
import { resolveSiteOrigin } from "../site/seo/engine/site-url"

export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteOrigin()),
  title: "Esigenta",
  description: "Trova professionisti verificati per i tuoi interventi.",
  applicationName: "Esigenta",
  openGraph: {
    siteName: "Esigenta",
  },
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html
      lang="it"
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
