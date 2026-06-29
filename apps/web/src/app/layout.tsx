import type { Metadata } from "next"
import type { ReactNode } from "react"
import { GeistSans } from "geist/font/sans"

import "./globals.css"
import { CookieConsent } from "../site/shell/cookie-consent"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "Esigenta",
  description: "Trova professionisti verificati per i tuoi interventi.",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html
      lang="it"
      className={`${GeistSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white font-sans text-cantiere-ink">
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
