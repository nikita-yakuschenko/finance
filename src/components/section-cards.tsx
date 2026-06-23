"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPercent, formatRub } from "@/lib/format";
import type { DashboardData } from "@/lib/types";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

type Props = Pick<
  DashboardData,
  "balanceLabel" | "balance" | "changePct" | "changeRub" | "creditLine" | "accumulatedCf"
>;

export function SectionCards({
  balanceLabel,
  balance,
  changePct,
  changeRub,
  creditLine,
  accumulatedCf,
}: Props) {
  const isUp = (changePct ?? 0) >= 0;
  const TrendIcon = isUp ? TrendingUpIcon : TrendingDownIcon;

  const cards = [
    {
      title: balanceLabel.replace(/^Остаток ДС на\s+/i, "Остаток · "),
      value: formatRub(balance),
      badge: formatPercent(changePct),
      badgeUp: isUp,
    },
    {
      title: "Изменение",
      value: formatRub(changeRub),
      badge: formatPercent(changePct),
      badgeUp: isUp,
    },
    {
      title: "Кредитная линия",
      value: creditLine != null ? formatRub(creditLine) : "—",
      badge: null,
      badgeUp: true,
    },
    {
      title: "Накопленный CF",
      value: accumulatedCf != null ? formatRub(accumulatedCf) : "—",
      badge: "2026",
      badgeUp: (accumulatedCf ?? 0) >= 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 px-4 lg:grid-cols-4 lg:px-6">
      {cards.map((card) => (
        <Card key={card.title} size="sm" className="shadow-xs">
          <CardHeader className="gap-1.5">
            <CardDescription className="truncate text-xs">{card.title}</CardDescription>
            <div className="flex items-end justify-between gap-2">
              <CardTitle className="text-lg font-semibold leading-tight tabular-nums lg:text-xl">
                {card.value}
              </CardTitle>
              {card.badge && (
                <Badge variant="outline" className="shrink-0 gap-0.5 px-1.5 text-xs tabular-nums">
                  <TrendIcon className="size-3" />
                  {card.badge}
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
