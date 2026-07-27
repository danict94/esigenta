import { Caveat } from "next/font/google"

// Font "a penna" (grafia) — usato SOLO per i post-it della Hero
// (docs/esigenta-brand). Non tocca corpo/titoli/UI.
export const scriptFont = Caveat({
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
})
