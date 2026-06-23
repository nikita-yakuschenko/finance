"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { FinanceTable, pctCell, rubCell } from "@/components/finance-table";
import { SectionCards } from "@/components/section-cards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRub } from "@/lib/format";
import type { BddsRow, DashboardData } from "@/lib/types";
import { cn } from "@/lib/utils";

const netCfConfig = {
  value: { label: "Net CF", color: "var(--chart-4)" },
} satisfies ChartConfig;

function BddsTable({ rows }: { rows: BddsRow[] }) {
  return (
    <FinanceTable
      rows={rows}
      getRowKey={(r) => r.name}
      rowClassName={(r) => (r.level <= 1 ? "font-medium bg-muted/40" : undefined)}
      columns={[
        {
          key: "name",
          header: "Статья",
          render: (r) => (
            <span style={{ paddingLeft: `${Math.max(0, r.level - 1) * 12}px` }}>{r.name}</span>
          ),
        },
        {
          key: "plan",
          header: "План",
          align: "right",
          render: (r) => rubCell(r.plan),
        },
        {
          key: "fact",
          header: "Факт",
          align: "right",
          render: (r) => rubCell(r.fact),
        },
        {
          key: "dev",
          header: "Отклонение",
          align: "right",
          render: (r) => (
            <span className={cn(r.deviation < 0 && "text-red-600", r.deviation > 0 && "text-emerald-600")}>
              {rubCell(r.deviation)}
            </span>
          ),
        },
        {
          key: "devPct",
          header: "Откл. %",
          align: "right",
          render: (r) => pctCell(r.deviationPct),
        },
      ]}
    />
  );
}

type Props = {
  data: DashboardData;
};

export function DashboardSections({ data }: Props) {
  const snapshotCols = data.snapshots.map((s) => ({
    id: s.id,
    label: s.label,
  }));

  return (
    <div className="flex flex-col gap-8">
      <section id="overview" className="scroll-mt-24">
        <SectionCards
          balanceLabel={data.balanceLabel}
          balance={data.balance}
          changePct={data.changePct}
          changeRub={data.changeRub}
          creditLine={data.creditLine}
          accumulatedCf={data.accumulatedCf}
        />
      </section>

      <section id="charts" className="scroll-mt-24 px-4 lg:px-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartAreaInteractive
            balancesMonthly={data.balancesMonthly}
            cfWeekly={data.cfWeekly}
            netCf={data.netCf}
          />
          <Card>
            <CardHeader>
              <CardTitle>Net CF по месяцам</CardTitle>
              <CardDescription>Накопленный денежный поток</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <ChartContainer config={netCfConfig} className="aspect-auto h-[250px] w-full">
                <AreaChart data={data.netCf}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={(v) => formatRub(Number(v))} />
                    }
                  />
                  <Area
                    dataKey="value"
                    type="natural"
                    fill="var(--color-value)"
                    fillOpacity={0.2}
                    stroke="var(--color-value)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="organizations" className="scroll-mt-24 px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Остатки по организациям</CardTitle>
            <CardDescription>
              Все снимки: {data.snapshots.map((s) => s.label).join(" · ")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FinanceTable
              rows={data.snapshots[0]?.organizations ?? []}
              getRowKey={(r) => r.name}
              columns={[
                { key: "name", header: "Организация", render: (r) => r.name },
                ...snapshotCols.map((col) => ({
                  key: col.id,
                  header: col.label,
                  align: "right" as const,
                  render: (r: { name: string; amount: number }) => {
                    const snap = data.snapshots.find((s) => s.id === col.id);
                    const org = snap?.organizations.find((o) => o.name === r.name);
                    return rubCell(org?.amount);
                  },
                })),
              ]}
            />
            <div className="mt-4">
              <FinanceTable
                rows={[{ label: "Итого организации" }, { label: "Остаток ДС (с кредитами)" }]}
                getRowKey={(r) => r.label}
                rowClassName={() => "font-semibold bg-muted/30"}
                columns={[
                  { key: "label", header: "Показатель", render: (r) => r.label },
                  ...snapshotCols.map((col) => ({
                    key: col.id,
                    header: col.label,
                    align: "right" as const,
                    render: (r: { label: string }) => {
                      const snap = data.snapshots.find((s) => s.id === col.id);
                      if (r.label.includes("Итого")) return rubCell(snap?.orgTotal);
                      return rubCell(snap?.balance);
                    },
                  })),
                ]}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="credit" className="scroll-mt-24 px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Кредитные линии</CardTitle>
            <CardDescription>Строки 18–23, все снимки дат</CardDescription>
          </CardHeader>
          <CardContent>
            <FinanceTable
              rows={data.creditLines}
              getRowKey={(r) => r.name}
              columns={[
                { key: "name", header: "Статья", render: (r) => r.name },
                ...snapshotCols.map((col) => ({
                  key: col.id,
                  header: col.label,
                  align: "right" as const,
                  render: (r: (typeof data.creditLines)[0]) => rubCell(r.amounts[col.id]),
                })),
              ]}
            />
          </CardContent>
        </Card>
      </section>

      <section id="accumulated" className="scroll-mt-24 px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Накопленный CF</CardTitle>
            <CardDescription>Детализация по месяцам и займам</CardDescription>
          </CardHeader>
          <CardContent>
            <FinanceTable
              rows={data.accumulatedCfRows}
              getRowKey={(r, i) => `${r.name}-${i}`}
              columns={[
                { key: "name", header: "Статья", render: (r) => r.name },
                {
                  key: "amount",
                  header: "Сумма",
                  align: "right",
                  render: (r) => rubCell(r.amount),
                },
              ]}
            />
          </CardContent>
        </Card>
      </section>

      <section id="warehouses" className="scroll-mt-24 px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Склады</CardTitle>
            <CardDescription>Остатки на {data.snapshots[1]?.label ?? "снимок"}</CardDescription>
          </CardHeader>
          <CardContent>
            <FinanceTable
              rows={data.warehouses}
              getRowKey={(r) => r.name}
              columns={[
                { key: "name", header: "Склад / актив", render: (r) => r.name },
                {
                  key: "amount",
                  header: "Сумма",
                  align: "right",
                  render: (r) => rubCell(r.amount),
                },
              ]}
            />
          </CardContent>
        </Card>
      </section>

      <section id="pnl" className="scroll-mt-24 px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>P&L</CardTitle>
            <CardDescription>Отчёт о прибылях и убытках</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            {data.pnl.map((period) => (
              <div key={period.period}>
                <h3 className="mb-3 font-semibold">{period.period}</h3>
                <FinanceTable
                  rows={period.rows}
                  getRowKey={(r) => r.label}
                  columns={[
                    { key: "label", header: "Статья", render: (r) => r.label },
                    {
                      key: "value",
                      header: "Сумма",
                      align: "right",
                      render: (r) => rubCell(r.value),
                    },
                  ]}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section id="mgmt-balance" className="scroll-mt-24 px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Управленческий баланс</CardTitle>
            <CardDescription>Активы и пассивы (декабрь / январь)</CardDescription>
          </CardHeader>
          <CardContent>
            <FinanceTable
              rows={data.mgmtBalance}
              getRowKey={(r, i) => `${r.assetLabel}-${i}`}
              rowClassName={(r) =>
                r.assetLabel.startsWith("Итого") || r.assetLabel === "Сальдо"
                  ? "font-semibold bg-muted/30"
                  : undefined
              }
              columns={[
                { key: "asset", header: "Актив", render: (r) => r.assetLabel },
                {
                  key: "assetVal",
                  header: "Сумма",
                  align: "right",
                  render: (r) => rubCell(r.assetValue),
                },
                { key: "liab", header: "Пассив", render: (r) => r.liabilityLabel ?? "—" },
                {
                  key: "liabVal",
                  header: "Сумма",
                  align: "right",
                  render: (r) => rubCell(r.liabilityValue),
                },
              ]}
            />
          </CardContent>
        </Card>
      </section>

      <section id="bdds" className="scroll-mt-24 px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>БДДС</CardTitle>
            <CardDescription>
              Бюджет движения денежных средств — {data.bddsMonths.length} месяцев, полная иерархия
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={data.bddsMonths.at(-1)?.id ?? "jun"}>
              <TabsList className="mb-4 flex-wrap h-auto">
                {data.bddsMonths.map((m) => (
                  <TabsTrigger key={m.id} value={m.id}>
                    {m.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {data.bddsMonths.map((m) => (
                <TabsContent key={m.id} value={m.id}>
                  <BddsTable rows={m.rows} />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </section>

      <section id="cf-weekly" className="scroll-mt-24 px-4 lg:px-6 pb-8">
        <Card>
          <CardHeader>
            <CardTitle>CF по неделям</CardTitle>
            <CardDescription>
              {data.cfArticles.length} статей · недели: {data.cfWeekLabels.join(", ")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FinanceTable
              rows={data.cfArticles}
              getRowKey={(r, i) => `${r.name}-${i}`}
              rowClassName={(r) =>
                r.level <= 1 || r.name === "Итог" ? "font-medium bg-muted/40" : undefined
              }
              columns={[
                {
                  key: "name",
                  header: "Статья",
                  render: (r) => (
                    <span style={{ paddingLeft: `${Math.max(0, r.level - 1) * 10}px` }}>
                      {r.name}
                    </span>
                  ),
                },
                ...data.cfWeekLabels.map((week) => ({
                  key: week,
                  header: week,
                  align: "right" as const,
                  className: "min-w-[90px]",
                  render: (r: (typeof data.cfArticles)[0]) => rubCell(r.weeks[week]),
                })),
              ]}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
