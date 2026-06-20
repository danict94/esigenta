import {
  AreaImpresaSignupPage,
  type AreaImpresaSignupPageProps,
} from "../../../area-impresa/public/auth/signup-page";

export default function Page({
  searchParams,
}: AreaImpresaSignupPageProps) {
  return <AreaImpresaSignupPage searchParams={searchParams} />;
}
