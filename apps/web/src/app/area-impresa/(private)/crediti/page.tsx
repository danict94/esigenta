import {
  CreditsPage,
  type CreditsPageProps,
} from "../../../../area-impresa/private/billing/crediti/credits-page";

export const dynamic = "force-dynamic";

export default function Page({ searchParams }: CreditsPageProps) {
  return <CreditsPage searchParams={searchParams} />;
}
