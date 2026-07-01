"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { DashboardSections } from "@/components/dashboard-sections";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { DashboardData } from "@/lib/types";

type Props = {
  data: DashboardData;
  updatedAtLabel?: string;
};

export function DashboardShell({ data, updatedAtLabel }: Props) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader
          updatedAtLabel={updatedAtLabel}
          sourceFile={data.dataAvailable ? data.sourceFile : undefined}
        />
        {!data.dataAvailable && (
          <div className="mx-4 mt-4 rounded-lg border border-dashed px-4 py-4 text-sm lg:mx-6">
            <p className="font-medium">Данные Excel не загружены</p>
            <p className="mt-1 text-muted-foreground">
              Дашборд работает без файла. Положите{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">ДДС.xlsx</code> в{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">data/</code> или задайте{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">EXCEL_PATH</code>, затем
              обновите страницу.
            </p>
            {data.warnings.map((w) => (
              <p key={w} className="mt-2 text-muted-foreground">
                {w}
              </p>
            ))}
          </div>
        )}
        {data.dataAvailable && data.warnings.length > 0 && (
          <div className="mx-4 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 lg:mx-6">
            {data.warnings.map((w) => (
              <p key={w}>{w}</p>
            ))}
          </div>
        )}
        <div className="flex flex-1 flex-col py-4 md:py-6">
          <DashboardSections data={data} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
