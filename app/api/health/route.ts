import { NextResponse } from "next";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "property-platform",
    database: "not-connected",
    locationPrivacy: "fail-closed",
  });
}
