import type { DashboardData } from "@/lib/types";
import { formatPercent, formatRub } from "@/lib/format";
import { schema } from "@/components/data-table";
import type { z } from "zod";

export type TableRow = z.infer<typeof schema>;

export function mapOrganizationsToTable(data: DashboardData): TableRow[] {
  return data.organizations.map((org, index) => ({
    id: index + 1,
    header: org.name.trim(),
    type: "Организация",
    status: org.delta >= 0 ? "Done" : "In Process",
    target: formatRub(org.current),
    limit: formatRub(org.previous),
    reviewer: formatPercent(org.deltaPct),
  }));
}

export function mapBddsToTable(data: DashboardData): TableRow[] {
  return data.bddsJune.map((row, index) => ({
    id: index + 100,
    header: row.name,
    type: "БДДС",
    status: row.deviation >= 0 ? "Done" : "In Process",
    target: formatRub(row.fact),
    limit: formatRub(row.plan),
    reviewer: formatPercent(row.deviationPct),
  }));
}
