import {
  ServicesConfigurationPage,
  type ServicesConfigurationPageProps,
} from "../../../../area-impresa/private/account/servizi/services-configuration-page";

export const dynamic = "force-dynamic";

export default function Page({
  searchParams,
}: ServicesConfigurationPageProps) {
  return <ServicesConfigurationPage searchParams={searchParams} />;
}
