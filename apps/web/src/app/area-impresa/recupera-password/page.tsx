import {
  CompanyForgotPasswordPage,
  type CompanyForgotPasswordPageProps,
} from "../../../area-impresa/public/auth/recover-password-page";

export default function Page({
  searchParams,
}: CompanyForgotPasswordPageProps) {
  return <CompanyForgotPasswordPage searchParams={searchParams} />;
}
