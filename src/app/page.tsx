import { DashboardShell } from "@/components/dashboard-shell";
import { loadDashboardData } from "@/lib/excel-parser";

export const dynamic = "force-dynamic";

export default function Page() {
  let data;
  let error: string | null = null;

  try {
    data = loadDashboardData();
  } catch (e) {
    error = e instanceof Error ? e.message : "Не удалось загрузить данные";
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-lg rounded-xl border p-8">
          <h1 className="text-xl font-bold">Ошибка загрузки</h1>
          <p className="mt-3 text-muted-foreground">{error}</p>
        </div>
      </main>
    );
  }

  const updatedAtLabel = new Date(data.updatedAt).toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
  });

  return <DashboardShell data={data} updatedAtLabel={updatedAtLabel} />;
}
