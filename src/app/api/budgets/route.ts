import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const budgets = await prisma.budget.findMany({ where: { userId }, include: { category: true } });
    return NextResponse.json({ budgets });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const body = await req.json();
    const budget = await prisma.budget.create({ data: { ...body, userId } });
    return NextResponse.json({ budget }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create budget" }, { status: 400 });
  }
}


