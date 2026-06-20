import {
  AreaImpresaLoginPage,
  type AreaImpresaLoginPageProps,
} from "../../../area-impresa/public/auth/login-page";

export default function Page({
  searchParams,
}: AreaImpresaLoginPageProps) {
  return <AreaImpresaLoginPage searchParams={searchParams} />;
}
