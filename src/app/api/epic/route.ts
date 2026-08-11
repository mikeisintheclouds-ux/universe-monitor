import { NextRequest, NextResponse } from "next/server";
import { fetchEpic, fetchEpicByDate } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  const frame = date ? await fetchEpicByDate(date) : await fetchEpic();
  if (!frame) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(frame);
}
