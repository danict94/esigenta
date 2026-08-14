import { IBM_Plex_Mono } from "next/font/google"

// Accento tecnico: eyebrow, label, numerazioni, badge, metadata e KPI.
export const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--eg-font-mono",
  display: "swap",
})
