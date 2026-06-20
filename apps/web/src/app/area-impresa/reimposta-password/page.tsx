import {
  CompanyResetPasswordPage,
  type CompanyResetPasswordPageProps,
} from "../../../area-impresa/public/auth/reset-password-page";

export default function Page({
  searchParams,
}: CompanyResetPasswordPageProps) {
  return <CompanyResetPasswordPage searchParams={searchParams} />;
}
