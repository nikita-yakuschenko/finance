export interface OrganizationBalance {
  name: string;
  current: number;
  previous: number;
  delta: number;
  deltaPct: number | null;
}

export interface SnapshotColumn {
  id: string;
  label: string;
  col: string;
  balance: number;
  orgTotal: number;
  organizations: Array<{ name: string; amount: number }>;
}

export interface CreditLineRow {
  name: string;
  amounts: Record<string, number | null>;
}

export interface AccumulatedCfRow {
  name: string;
  amount: number | null;
  month?: string;
}

export interface WarehouseRow {
  name: string;
  amount: number | null;
}

export interface PnlPeriod {
  period: string;
  rows: Array<{ label: string; value: number | null }>;
}

export interface MgmtBalanceRow {
  assetLabel: string;
  assetValue: number | null;
  liabilityLabel: string | null;
  liabilityValue: number | null;
}

export interface MonthlyBalance {
  month: string;
  value: number;
}

export interface NetCfPoint {
  month: string;
  value: number;
}

export interface CfWeeklyPoint {
  week: string;
  cashIn: number;
  cashOut: number;
}

export interface BddsRow {
  name: string;
  level: number;
  plan: number;
  fact: number;
  deviation: number;
  deviationPct: number | null;
}

export interface BddsMonth {
  id: string;
  label: string;
  planCol: string;
  factCol: string;
  rows: BddsRow[];
}

export interface CfArticleRow {
  name: string;
  level: number;
  type: "in" | "out" | "section";
  weeks: Record<string, number | null>;
}

export interface DashboardData {
  sourceFile: string;
  updatedAt: string;
  balance: number;
  balanceLabel: string;
  previousBalance: number;
  changeRub: number;
  changePct: number | null;
  creditLine: number | null;
  accumulatedCf: number | null;
  balancesMonthly: MonthlyBalance[];
  organizations: OrganizationBalance[];
  netCf: NetCfPoint[];
  cfWeekly: CfWeeklyPoint[];
  bddsJune: BddsRow[];
  warnings: string[];
  // extended
  snapshots: SnapshotColumn[];
  creditLines: CreditLineRow[];
  accumulatedCfRows: AccumulatedCfRow[];
  warehouses: WarehouseRow[];
  pnl: PnlPeriod[];
  mgmtBalance: MgmtBalanceRow[];
  bddsMonths: BddsMonth[];
  cfArticles: CfArticleRow[];
  cfWeekLabels: string[];
}
