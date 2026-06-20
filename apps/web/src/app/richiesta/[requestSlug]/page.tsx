import { RequestFlowPage } from "../../../richiesta/flow/request-flow-page";

type Props = {
  params: Promise<{ requestSlug: string }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { requestSlug } = await params;
  const { q } = await searchParams;
  return <RequestFlowPage interventionSlug={requestSlug} query={q} />;
}
