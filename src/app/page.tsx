import { DashboardShell } from "@/components/dashboard-shell";
import { loadDashboardData } from "@/lib/excel-parser";

export const dynamic = "force-dynamic";

export default function Page() {
  const data = loadDashboardData();

  const updatedAtLabel = data.dataAvailable
    ? new Date(data.updatedAt).toLocaleString("ru-RU", {
        timeZone: "Europe/Moscow",
      })
    : undefined;

  return <DashboardShell data={data} updatedAtLabel={updatedAtLabel} />;
}
