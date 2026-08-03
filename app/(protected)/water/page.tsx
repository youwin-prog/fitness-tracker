import { getWaterModuleData } from "@/actions/water-actions";
import { WaterCrud } from "@/components/water-crud";

export default async function WaterPage() {
  const data = await getWaterModuleData();

  return <WaterCrud entries={data.entries} goalMl={data.goalMl} />;
}