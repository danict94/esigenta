import type { ReactNode } from "react";
import { monoFont } from "@esigenta/ui/fonts/mono";

import { AreaImpresaPrivateLayout } from "../../../area-impresa/private/shell/area-impresa-private-layout";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={monoFont.variable}>
      <AreaImpresaPrivateLayout>{children}</AreaImpresaPrivateLayout>
    </div>
  );
}
