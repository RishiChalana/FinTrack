import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = requireAuth(req);
    const { id } = params;
    const data = await req.json();
    const existing = await prisma.budget.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const updated = await prisma.budget.update({ where: { id }, data });
    return NextResponse.json({ budget: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update budget" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = requireAuth(req);
    const { id } = params;
    const existing = await prisma.budget.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await prisma.budget.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete budget" }, { status: 400 });
  }
}


