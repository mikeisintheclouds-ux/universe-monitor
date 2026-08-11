import { NextRequest, NextResponse } from "next/server";
import { fetchSbdb } from "@/lib/cneos";

export const runtime = "nodejs";

/** Server-side SBDB lookup — keeps one-at-a-time discipline off the client */
export async function GET(req: NextRequest) {
  const des = req.nextUrl.searchParams.get("des")?.trim();
  if (!des) {
    return NextResponse.json({ error: "des required" }, { status: 400 });
  }
  const data = await fetchSbdb(des);
  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(data, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
  });
}
