import { IBM_Plex_Sans } from "next/font/google"

// Voce principale del prodotto: contenuti, titoli, navigazione, form e UI.
export const primaryFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--eg-font-primary",
  display: "swap",
})
