import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

// GET /api/accounts -> list accounts for user
export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const accounts = await prisma.account.findMany({ where: { userId } });
    return NextResponse.json({ accounts });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST /api/accounts -> create account
export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const body = await req.json();
    const { name, type, currency, startingBalance, color, icon } = body;
    const account = await prisma.account.create({
      data: { userId, name, type, currency, startingBalance, color: color ?? null, icon: icon ?? null },
    });
    return NextResponse.json({ account }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create account" }, { status: 400 });
  }
}


