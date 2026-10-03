import { getProfileData } from "@/actions/profile-actions";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const data = await getProfileData();

  return <ProfileForm profile={data.profile} />;
}