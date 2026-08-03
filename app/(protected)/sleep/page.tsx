import { getSleepModuleData } from "@/actions/sleep-actions";
import { SleepCrud } from "@/components/sleep-crud";

export default async function SleepPage() {
  const data = await getSleepModuleData();

  return <SleepCrud entries={data.entries} />;
}
