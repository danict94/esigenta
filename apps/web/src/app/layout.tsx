import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Inter } from "next/font/google"
import localFont from "next/font/local"
import { GeistSans } from "geist/font/sans"

import "./globals.css"
import { CookieConsent } from "../site/shell/cookie-consent"

const plusJakartaSans = localFont({
  src: [
    {
      path: "../../public/fonts/plus-jakarta-sans/plus-jakarta-sans-variable.woff2",
      weight: "200 800",
      style: "normal",
    },
  ],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

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
      className={`${plusJakartaSans.variable} ${inter.variable} ${GeistSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface-primary font-sans text-text-primary">
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
