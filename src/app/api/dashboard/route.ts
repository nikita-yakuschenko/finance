import { NextResponse } from "next/server";
import { loadDashboardData } from "@/lib/excel-parser";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = loadDashboardData();
  return NextResponse.json(data);
}
