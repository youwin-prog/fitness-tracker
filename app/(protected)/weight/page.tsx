import { getWeightModuleData } from "@/actions/weight-actions";
import { WeightCrud } from "@/components/weight-crud";

export default async function WeightPage() {
  const data = await getWeightModuleData();

  return <WeightCrud entries={data.entries} heightCm={data.heightCm} />;
}
