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
  title: "FixPro Admin",
}

export default function AdminRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html
      lang="it"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-surface-primary font-sans text-text-primary">
        {children}
      </body>
    </html>
  )
}
