export { metadata } from "../../area-impresa/public/marketing/area-impresa-marketing-page";

import { AreaImpresaMarketingPage } from "../../area-impresa/public/marketing/area-impresa-marketing-page";
import { Ga4MinimalLoader } from "../../site/shell/ga4-minimal-loader";

export default function Page() {
  return (
    <>
      <AreaImpresaMarketingPage />
      <Ga4MinimalLoader />
    </>
  );
}
