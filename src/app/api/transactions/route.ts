import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const categoryId = searchParams.get("categoryId");
    const accountId = searchParams.get("accountId");
    const where: any = { userId };
    if (start || end) where.date = { gte: start ? new Date(start) : undefined, lte: end ? new Date(end) : undefined };
    if (categoryId) where.categoryId = categoryId;
    if (accountId) where.accountId = accountId;
    const transactions = await prisma.transaction.findMany({ where, orderBy: { date: "desc" } });
    return NextResponse.json({ transactions });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const body = await req.json();
    const txn = await prisma.transaction.create({ data: { ...body, userId } });
    return NextResponse.json({ transaction: txn }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 400 });
  }
}


