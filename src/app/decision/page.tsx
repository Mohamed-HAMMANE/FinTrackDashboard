import { getStrategicMetrics } from "@/lib/strategy";
import DecisionClient from "./DecisionClient";

export const dynamic = "force-dynamic";

export default function DecisionPage() {
    const data = getStrategicMetrics();
    return <DecisionClient data={data} />;
}
