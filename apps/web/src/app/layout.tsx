import type { Metadata } from "next"
import type { ReactNode } from "react"
import localFont from "next/font/local"

import "./globals.css"

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

export const metadata: Metadata = {
  title: "FixPro",
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
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface-primary font-sans text-text-primary">
        {children}
      </body>
    </html>
  )
}
