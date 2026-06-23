import { NextResponse } from "next/server";
import { loadDashboardData } from "@/lib/excel-parser";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = loadDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка чтения файла";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
