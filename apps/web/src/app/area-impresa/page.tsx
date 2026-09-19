export { metadata } from "../../area-impresa/public/marketing/area-impresa-marketing-page";

import { AreaImpresaMarketingPage } from "../../area-impresa/public/marketing/area-impresa-marketing-page";
import { PublicAnalyticsLoader } from "../../site/shell/public-analytics-loader";

export default function Page() {
  return (
    <>
      <AreaImpresaMarketingPage />
      <PublicAnalyticsLoader />
    </>
  );
}
