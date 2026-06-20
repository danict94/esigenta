import {
  RequestsPage,
  type RequestsPageProps,
} from "../../../../area-impresa/private/opportunita/richieste/requests-page";

export const dynamic = "force-dynamic";

export default function Page({
  searchParams,
}: RequestsPageProps) {
  return <RequestsPage searchParams={searchParams} />;
}
