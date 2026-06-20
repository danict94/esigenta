import {
  RequestDetailPage,
  type RequestDetailPageProps,
} from "../../../../../area-impresa/private/opportunita/richiesta-dettaglio/request-detail-page";

export const dynamic = "force-dynamic";

export default function Page({
  params,
  searchParams,
}: RequestDetailPageProps) {
  return <RequestDetailPage params={params} searchParams={searchParams} />;
}
