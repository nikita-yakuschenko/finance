"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRub } from "@/lib/format";
import type { CfWeeklyPoint, MonthlyBalance, NetCfPoint } from "@/lib/types";

const chartConfig = {
  balance: { label: "Остаток ДС", color: "var(--chart-1)" },
  cashIn: { label: "Cash In", color: "var(--chart-2)" },
  cashOut: { label: "Cash Out", color: "var(--chart-3)" },
} satisfies ChartConfig;

type Props = {
  balancesMonthly: MonthlyBalance[];
  cfWeekly: CfWeeklyPoint[];
  netCf?: NetCfPoint[];
};

export function ChartAreaInteractive({ balancesMonthly, cfWeekly }: Props) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = React.useState(false);
  const [view, setView] = React.useState<"balance" | "cashflow">("balance");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isMobile) setView("balance");
  }, [isMobile]);

  const balanceData = balancesMonthly.map((item) => ({
    label: item.month,
    balance: item.value,
  }));

  const cashflowData = cfWeekly.map((item) => ({
    label: item.week,
    cashIn: item.cashIn,
    cashOut: item.cashOut,
  }));

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{view === "balance" ? "Остаток ДС по месяцам" : "Cash In / Cash Out"}</CardTitle>
        <CardDescription>
          {view === "balance"
            ? "Динамика остатков по снимкам"
            : "Поступления и платежи по неделям"}
        </CardDescription>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={[view]}
            onValueChange={(value) => setView((value[0] as "balance" | "cashflow") ?? "balance")}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="balance">Остатки</ToggleGroupItem>
            <ToggleGroupItem value="cashflow">Cash Flow</ToggleGroupItem>
          </ToggleGroup>
          <Select value={view} onValueChange={(v) => v && setView(v as "balance" | "cashflow")}>
            <SelectTrigger
              className="flex w-40 @[767px]/card:hidden"
              size="sm"
              aria-label="Тип графика"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="balance" className="rounded-lg">Остатки</SelectItem>
              <SelectItem value="cashflow" className="rounded-lg">Cash Flow</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {!mounted ? (
          <Skeleton className="aspect-auto h-[250px] w-full" />
        ) : (
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          {view === "balance" ? (
          <AreaChart data={balanceData}>
            <defs>
              <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-balance)" stopOpacity={1} />
                <stop offset="95%" stopColor="var(--color-balance)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => formatRub(Number(value))}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="balance"
              type="natural"
              fill="url(#fillBalance)"
              stroke="var(--color-balance)"
            />
          </AreaChart>
          ) : (
          <AreaChart data={cashflowData}>
            <defs>
              <linearGradient id="fillCashIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-cashIn)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--color-cashIn)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillCashOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-cashOut)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--color-cashOut)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => formatRub(Number(value))}
                  indicator="dot"
                />
              }
            />
            <Area dataKey="cashIn" type="natural" fill="url(#fillCashIn)" stroke="var(--color-cashIn)" stackId="a" />
            <Area dataKey="cashOut" type="natural" fill="url(#fillCashOut)" stroke="var(--color-cashOut)" stackId="b" />
          </AreaChart>
          )}
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
