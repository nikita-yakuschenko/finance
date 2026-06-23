import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";
import type {
  AccumulatedCfRow,
  BddsMonth,
  BddsRow,
  CfArticleRow,
  CfWeeklyPoint,
  CreditLineRow,
  DashboardData,
  MgmtBalanceRow,
  MonthlyBalance,
  NetCfPoint,
  OrganizationBalance,
  PnlPeriod,
  SnapshotColumn,
  WarehouseRow,
} from "./types";

const SNAPSHOT_SHEET = "Основные данные за месяц";
const CF_SHEET = "CF по неделям";
const BDDS_SHEET = "БДДС";

const SNAPSHOT_PAIRS: Array<{ labelCol: string; valueCol: string }> = [
  { labelCol: "A", valueCol: "C" },
  { labelCol: "E", valueCol: "G" },
  { labelCol: "I", valueCol: "K" },
  { labelCol: "M", valueCol: "O" },
  { labelCol: "Q", valueCol: "S" },
  { labelCol: "U", valueCol: "W" },
  { labelCol: "Y", valueCol: "AA" },
];

const BDDS_MONTHS: Array<{ id: string; labelCol: string; planCol: string; factCol: string }> = [
  { id: "feb", labelCol: "B", planCol: "J", factCol: "K" },
  { id: "mar", labelCol: "N", planCol: "X", factCol: "Y" },
  { id: "apr", labelCol: "AB", planCol: "AL", factCol: "AM" },
  { id: "may", labelCol: "AO", planCol: "AW", factCol: "AX" },
  { id: "jun", labelCol: "AZ", planCol: "BJ", factCol: "BK" },
];

const CF_IN_COLS = ["B", "C", "D", "E", "F", "G", "H"];
const CF_OUT_COLS = ["K", "L", "M", "N", "O", "P", "Q"];

function resolveExcelPath(): string {
  if (process.env.EXCEL_PATH) {
    return path.resolve(process.env.EXCEL_PATH);
  }

  const dataDir = path.resolve(process.cwd(), "data");
  const canonical = path.join(dataDir, "ДДС.xlsx");
  if (fs.existsSync(canonical)) return canonical;

  if (fs.existsSync(dataDir)) {
    const xlsxFiles = fs.readdirSync(dataDir).filter((f) => f.toLowerCase().endsWith(".xlsx"));
    const dds = xlsxFiles.find((f) => f.toLowerCase().includes("ддс") || f.toLowerCase() === "dds.xlsx");
    if (dds) return path.join(dataDir, dds);
    if (xlsxFiles[0]) return path.join(dataDir, xlsxFiles[0]);
  }

  const rootDds = path.join(process.cwd(), "ДДС.xlsx");
  if (fs.existsSync(rootDds)) return rootDds;

  return canonical;
}

function num(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function str(value: unknown): string {
  return value == null ? "" : String(value).trim();
}

function cell(sheet: XLSX.WorkSheet, address: string): unknown {
  return sheet[address]?.v;
}

function sumRange(sheet: XLSX.WorkSheet, col: string, r1: number, r2: number): number {
  let total = 0;
  for (let r = r1; r <= r2; r++) {
    total += num(cell(sheet, `${col}${r}`)) ?? 0;
  }
  return total;
}

function colSumOrCached(
  sheet: XLSX.WorkSheet,
  totalRow: number,
  col: string,
  orgStart = 8,
  orgEnd = 15,
): number {
  const cached = num(cell(sheet, `${col}${totalRow}`));
  if (cached != null) return cached;
  return sumRange(sheet, col, orgStart, orgEnd);
}

function bddsLevel(name: string): number {
  const m = name.match(/^(\d+(?:\.\d+)*)/);
  if (!m) return 0;
  return m[1].split(".").length;
}

function shortSnapshotLabel(full: string): string {
  const m = full.match(/(\d{2}\.\d{2}\.\d{4}|\d{2}\.\d{2})/);
  return m ? m[1] : full.replace("Остаток ДС на ", "").trim();
}

function parseSnapshots(sheet: XLSX.WorkSheet): SnapshotColumn[] {
  return SNAPSHOT_PAIRS.map(({ labelCol, valueCol }) => {
    const fullLabel = str(cell(sheet, `${labelCol}3`));
    const balance = num(cell(sheet, `${valueCol}3`)) ?? colSumOrCached(sheet, 16, valueCol);
    const organizations: Array<{ name: string; amount: number }> = [];
    for (let r = 8; r <= 15; r++) {
      const name = str(cell(sheet, `A${r}`));
      if (!name) continue;
      organizations.push({ name, amount: num(cell(sheet, `${valueCol}${r}`)) ?? 0 });
    }
    return {
      id: valueCol,
      label: shortSnapshotLabel(fullLabel),
      col: valueCol,
      balance,
      orgTotal: sumRange(sheet, valueCol, 8, 15),
      organizations,
    };
  });
}

function parseOrganizations(sheet: XLSX.WorkSheet): OrganizationBalance[] {
  const rows: OrganizationBalance[] = [];
  for (let r = 8; r <= 15; r++) {
    const name = str(cell(sheet, `A${r}`));
    if (!name) continue;
    const current = num(cell(sheet, `C${r}`)) ?? 0;
    const previous = num(cell(sheet, `G${r}`)) ?? 0;
    const delta = current - previous;
    const deltaPct = previous !== 0 ? delta / previous : null;
    rows.push({ name, current, previous, delta, deltaPct });
  }
  return rows;
}

function parseCreditLines(sheet: XLSX.WorkSheet): CreditLineRow[] {
  const cols = SNAPSHOT_PAIRS.map((p) => p.valueCol);
  const rows: CreditLineRow[] = [];
  for (let r = 18; r <= 23; r++) {
    const name = str(cell(sheet, `A${r}`));
    if (!name) continue;
    const amounts: Record<string, number | null> = {};
    for (const col of cols) {
      amounts[col] = num(cell(sheet, `${col}${r}`));
    }
    rows.push({ name, amounts });
  }
  return rows;
}

function parseAccumulatedCf(sheet: XLSX.WorkSheet): AccumulatedCfRow[] {
  const rows: AccumulatedCfRow[] = [];
  for (let r = 25; r <= 41; r++) {
    const name = str(cell(sheet, `A${r}`));
    const amount = num(cell(sheet, `C${r}`));
    if (!name && amount == null) continue;
    rows.push({ name: name || "—", amount });
  }
  return rows;
}

function parseWarehouses(sheet: XLSX.WorkSheet): WarehouseRow[] {
  const rows: WarehouseRow[] = [];
  for (let r = 44; r <= 78; r++) {
    const name = str(cell(sheet, `A${r}`));
    if (!name) continue;
    rows.push({ name, amount: num(cell(sheet, `C${r}`)) });
  }
  return rows;
}

function parsePnl(sheet: XLSX.WorkSheet): PnlPeriod[] {
  const periods: PnlPeriod[] = [];

  const decRows: Array<{ label: string; value: number | null }> = [];
  for (let r = 3; r <= 10; r++) {
    const label = str(cell(sheet, `AC${r}`));
    if (!label) continue;
    decRows.push({ label, value: num(cell(sheet, `AE${r}`)) });
  }
  if (decRows.length) periods.push({ period: "Декабрь 2025", rows: decRows });

  const janRows: Array<{ label: string; value: number | null }> = [];
  for (let r = 14; r <= 20; r++) {
    const label = str(cell(sheet, `AC${r}`));
    if (!label) continue;
    janRows.push({ label, value: num(cell(sheet, `AE${r}`)) });
  }
  if (janRows.length) periods.push({ period: "Январь 2026", rows: janRows });

  return periods;
}

function parseMgmtBalance(sheet: XLSX.WorkSheet): MgmtBalanceRow[] {
  const rows: MgmtBalanceRow[] = [];
  for (let r = 4; r <= 23; r++) {
    const assetLabel = str(cell(sheet, `AG${r}`));
    const liabilityLabel = str(cell(sheet, `AI${r}`));
    if (!assetLabel && !liabilityLabel) continue;
    rows.push({
      assetLabel: assetLabel || "—",
      assetValue: num(cell(sheet, `AH${r}`)),
      liabilityLabel: liabilityLabel || null,
      liabilityValue: num(cell(sheet, `AJ${r}`)),
    });
  }
  return rows;
}

function parseSnapshotSheet(sheet: XLSX.WorkSheet, warnings: string[]) {
  const balanceLabel = str(cell(sheet, "A3")) || "Остаток ДС";
  const snapshots = parseSnapshots(sheet);

  let creditLine = num(cell(sheet, "C18"));
  if (creditLine == null) {
    creditLine =
      (num(cell(sheet, "C19")) ?? 0) +
      (num(cell(sheet, "C20")) ?? 0) +
      (num(cell(sheet, "C21")) ?? 0) +
      (num(cell(sheet, "C22")) ?? 0) +
      (num(cell(sheet, "C23")) ?? 0);
    if (creditLine === 0) creditLine = null;
  }

  let balance = num(cell(sheet, "C3"));
  if (balance == null) {
    balance = (snapshots[0]?.orgTotal ?? 0) + (creditLine ?? 0);
    warnings.push("Остаток ДС вычислен из суммы организаций + кредитная линия.");
  }

  let previousBalance = num(cell(sheet, "G3"));
  if (previousBalance == null) {
    previousBalance = (snapshots[1]?.orgTotal ?? 0) + (num(cell(sheet, "G18")) ?? 0);
  }

  let changeRub = num(cell(sheet, "C5"));
  if (changeRub == null) changeRub = balance - previousBalance;

  let changePct = num(cell(sheet, "C4"));
  if (changePct == null && previousBalance !== 0) {
    changePct = changeRub / previousBalance;
  }

  const balancesMonthly: MonthlyBalance[] = snapshots.slice(2).map((s) => ({
    month: s.label,
    value: s.balance,
  }));

  const netCf: NetCfPoint[] = [];
  const monthCols = ["I", "J", "K", "L", "M", "N"];
  for (const col of monthCols) {
    const month = str(cell(sheet, `${col}26`));
    const value = num(cell(sheet, `${col}27`));
    if (month) netCf.push({ month, value: value ?? 0 });
  }

  const accumulatedCf = num(cell(sheet, "C25"));

  return {
    balanceLabel,
    balance,
    previousBalance,
    changeRub,
    changePct,
    creditLine,
    accumulatedCf,
    balancesMonthly,
    organizations: parseOrganizations(sheet),
    netCf,
    snapshots,
    creditLines: parseCreditLines(sheet),
    accumulatedCfRows: parseAccumulatedCf(sheet),
    warehouses: parseWarehouses(sheet),
    pnl: parsePnl(sheet),
    mgmtBalance: parseMgmtBalance(sheet),
  };
}

function parseBddsMonth(
  sheet: XLSX.WorkSheet,
  id: string,
  labelCol: string,
  planCol: string,
  factCol: string,
): BddsMonth {
  const monthLabel =
    str(cell(sheet, `${labelCol}8`)) ||
    str(cell(sheet, `${planCol}8`)) ||
    id;

  const rows: BddsRow[] = [];
  for (let r = 11; r <= 120; r++) {
    const name = str(cell(sheet, `A${r}`));
    if (!name) continue;
    const plan = num(cell(sheet, `${planCol}${r}`)) ?? 0;
    const fact = num(cell(sheet, `${factCol}${r}`)) ?? 0;
    const deviation = fact - plan;
    const deviationPct = plan !== 0 ? deviation / plan : null;
    rows.push({
      name,
      level: bddsLevel(name),
      plan,
      fact,
      deviation,
      deviationPct,
    });
  }

  return { id, label: monthLabel.trim(), planCol, factCol, rows };
}

function parseBddsAll(sheet: XLSX.WorkSheet): BddsMonth[] {
  return BDDS_MONTHS.map(({ id, labelCol, planCol, factCol }) =>
    parseBddsMonth(sheet, id, labelCol, planCol, factCol),
  );
}

function parseBddsJune(sheet: XLSX.WorkSheet): BddsRow[] {
  const jun = parseBddsMonth(sheet, "jun", "BJ", "BK");
  return jun.rows.filter((r) => [0, 1, 2].includes(r.level) || r.name.startsWith("ЧДП"));
}

function parseCfWeekly(sheet: XLSX.WorkSheet): CfWeeklyPoint[] {
  const points: CfWeeklyPoint[] = [];
  for (let i = 0; i < CF_IN_COLS.length; i++) {
    const week = str(cell(sheet, `${CF_IN_COLS[i]}21`));
    if (!week) continue;
    points.push({
      week,
      cashIn: num(cell(sheet, `${CF_IN_COLS[i]}25`)) ?? 0,
      cashOut: num(cell(sheet, `${CF_OUT_COLS[i]}25`)) ?? 0,
    });
  }
  return points;
}

function parseCfArticles(sheet: XLSX.WorkSheet): { articles: CfArticleRow[]; weekLabels: string[] } {
  const weekLabels = CF_IN_COLS.map((c) => str(cell(sheet, `${c}21`))).filter(Boolean);
  const articles: CfArticleRow[] = [];

  for (let r = 24; r <= 132; r++) {
    const name = str(cell(sheet, `A${r}`));
    if (!name) continue;

    const weeks: Record<string, number | null> = {};
    let hasIn = false;
    let hasOut = false;

    for (let i = 0; i < CF_IN_COLS.length; i++) {
      const label = weekLabels[i];
      if (!label) continue;
      const inVal = num(cell(sheet, `${CF_IN_COLS[i]}${r}`));
      const outVal = num(cell(sheet, `${CF_OUT_COLS[i]}${r}`));
      const val = inVal ?? outVal;
      if (inVal != null) hasIn = true;
      if (outVal != null) hasOut = true;
      weeks[label] = val;
    }

    let type: CfArticleRow["type"] = "section";
    if (hasIn && !hasOut) type = "in";
    else if (hasOut && !hasIn) type = "out";
    else if (hasIn && hasOut) type = "section";

    articles.push({
      name,
      level: bddsLevel(name),
      type,
      weeks,
    });
  }

  return { articles, weekLabels };
}

export function getExcelPath(): string {
  return resolveExcelPath();
}

export function loadDashboardData(): DashboardData {
  const sourceFile = getExcelPath();
  const warnings: string[] = [];

  if (!fs.existsSync(sourceFile)) {
    throw new Error(`Файл не найден: ${sourceFile}`);
  }

  const stat = fs.statSync(sourceFile);
  const workbook = XLSX.read(fs.readFileSync(sourceFile), { type: "buffer", cellDates: true });

  if (!workbook.Sheets[SNAPSHOT_SHEET]) {
    throw new Error(`Лист «${SNAPSHOT_SHEET}» не найден в ${sourceFile}`);
  }

  const snapshot = parseSnapshotSheet(workbook.Sheets[SNAPSHOT_SHEET], warnings);

  const cfSheet = workbook.Sheets[CF_SHEET];
  const cfWeekly = cfSheet ? parseCfWeekly(cfSheet) : [];
  const cfParsed = cfSheet ? parseCfArticles(cfSheet) : { articles: [], weekLabels: [] };

  const bddsSheet = workbook.Sheets[BDDS_SHEET];
  const bddsMonths = bddsSheet ? parseBddsAll(bddsSheet) : [];
  const bddsJune = bddsSheet ? parseBddsJune(bddsSheet) : [];

  if (sourceFile.toLowerCase().includes("source.xlsx")) {
    warnings.push("Читается source.xlsx — для полных данных используйте data/ДДС.xlsx.");
  }

  return {
    sourceFile,
    updatedAt: stat.mtime.toISOString(),
    ...snapshot,
    cfWeekly,
    bddsJune,
    bddsMonths,
    cfArticles: cfParsed.articles,
    cfWeekLabels: cfParsed.weekLabels,
    warnings,
  };
}
