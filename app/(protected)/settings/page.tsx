import { getUserSettings } from "@/actions/settings-actions";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const initialSettings = await getUserSettings();

  return (
    <div className="space-y-6">
      <SettingsClient initialSettings={initialSettings} />
    </div>
  );
}