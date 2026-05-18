import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Plus_Jakarta_Sans } from "next/font/google"

import "./globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
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
