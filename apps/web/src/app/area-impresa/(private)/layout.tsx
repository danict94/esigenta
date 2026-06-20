import type { ReactNode } from "react";

import { AreaImpresaPrivateLayout } from "../../../area-impresa/private/shell/area-impresa-private-layout";

export default function Layout({ children }: { children: ReactNode }) {
  return <AreaImpresaPrivateLayout>{children}</AreaImpresaPrivateLayout>;
}
