import { IBM_Plex_Mono } from "next/font/google"

// Voce display del brand: mono tecnico (tavola cianotipo). Usato per
// titoli/eyebrow/CTA — mai per il corpo del testo (vedi globals.css: body
// di default usa --eg-font-ui, non questo).
export const brandFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-brand",
  display: "swap",
})
