import {
  ProfilePage,
  type ProfilePageProps,
} from "../../../../area-impresa/private/account/profilo/profile-page";

export const dynamic = "force-dynamic";

export default function Page({
  searchParams,
}: ProfilePageProps) {
  return <ProfilePage searchParams={searchParams} />;
}
