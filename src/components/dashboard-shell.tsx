"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { DashboardSections } from "@/components/dashboard-sections";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { DashboardData } from "@/lib/types";

type Props = {
  data: DashboardData;
  updatedAtLabel: string;
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
        <SiteHeader updatedAtLabel={updatedAtLabel} sourceFile={data.sourceFile} />
        {data.warnings.length > 0 && (
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
