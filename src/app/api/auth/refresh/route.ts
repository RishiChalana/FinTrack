import { NextRequest, NextResponse } from "next/server";
import { verifyToken, signAccessToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();
    if (!refreshToken) {
      return NextResponse.json({ error: "refreshToken required" }, { status: 400 });
    }
    const payload = verifyToken(refreshToken);
    const accessToken = signAccessToken(payload);
    return NextResponse.json({ accessToken });
  } catch (e) {
    return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
  }
}


