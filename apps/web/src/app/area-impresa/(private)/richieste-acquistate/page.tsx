import {
  PurchasedRequestsPage,
  type PurchasedRequestsPageProps,
} from "../../../../area-impresa/private/opportunita/richieste-acquistate/purchased-requests-page";

export const dynamic = "force-dynamic";

export default function Page({
  searchParams,
}: PurchasedRequestsPageProps) {
  return <PurchasedRequestsPage searchParams={searchParams} />;
}
