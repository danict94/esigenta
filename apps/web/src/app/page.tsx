import type { Metadata } from "next"

import { HomePage } from "../site/home/home-page"

const homeTitle = "Esigenta — Preventivi da professionisti qualificati"
const homeDescription =
  "Racconta il lavoro da fare — bagno, tetto, impianti, energia o clima — e confronta preventivi da professionisti qualificati nella tua zona. Gratis e senza impegno."

export const metadata: Metadata = {
  title: homeTitle,
  description: homeDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    type: "website",
    url: "/",
    siteName: "Esigenta",
  },
}

export default function Page() {
  return <HomePage />
}
