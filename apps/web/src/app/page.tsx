import type { Metadata } from "next"

import { HomePage } from "../site/home/home-page"
import { Ga4MinimalLoader } from "../site/shell/ga4-minimal-loader"

const homeTitle = "Esigenta | Trova professionisti e confronta preventivi"
const homeDescription =
  "Trova professionisti qualificati per ristrutturazioni e lavori di casa. Descrivi il tuo intervento, ricevi proposte e confronta preventivi su Esigenta."

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
  return (
    <>
      <HomePage />
      <Ga4MinimalLoader />
    </>
  )
}
