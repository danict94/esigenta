import {
  ConversationPage,
  type ConversationPageProps,
} from "../../../../../area-impresa/private/comunicazioni/conversazione/conversation-page";

export const dynamic = "force-dynamic";

export default function Page({
  params,
  searchParams,
}: Pick<ConversationPageProps, "params" | "searchParams">) {
  return (
    <ConversationPage
      params={params}
      searchParams={searchParams}
      kind="CUSTOMER"
      eyebrow="Contatti"
      title="Messaggi cliente"
      hrefBase="/area-impresa/contatti"
      listPath="/area-impresa/contatti"
    />
  );
}
