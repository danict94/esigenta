import {
  SavedRequestsPage,
  type SavedRequestsPageProps,
} from "../../../../area-impresa/private/opportunita/richieste-salvate/saved-requests-page";

export const dynamic = "force-dynamic";

export default function Page({
  searchParams,
}: SavedRequestsPageProps) {
  return <SavedRequestsPage searchParams={searchParams} />;
}
