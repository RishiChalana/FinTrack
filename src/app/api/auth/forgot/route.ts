import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Stub: accept email, respond OK without sending email (add provider later)
  const { email } = await req.json().catch(() => ({ email: null }));
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
  return NextResponse.json({ ok: true });
}


