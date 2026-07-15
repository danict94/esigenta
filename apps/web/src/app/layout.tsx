import type { Metadata } from "next"
import type { ReactNode } from "react"
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google"

import "./globals.css"
import { CookieConsent } from "../site/shell/cookie-consent"
import { resolveSiteOrigin } from "../site/seo/engine/site-url"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteOrigin()),
  title: "Esigenta",
  description: "Trova professionisti verificati per i tuoi interventi.",
  applicationName: "Esigenta",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html
      lang="it"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-eg-calce font-sans text-eg-terra">
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
