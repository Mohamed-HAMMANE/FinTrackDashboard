import { getDashboardData } from "@/lib/db";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default function Home() {
  const data = getDashboardData();
  return <DashboardClient data={data} />;
}
