import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = requireAuth(req);
    const { id } = params;
    const data = await req.json();
    const updated = await prisma.account.update({
      where: { id },
      data,
    });
    if (updated.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ account: updated });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update account" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = requireAuth(req);
    const { id } = params;
    const acc = await prisma.account.findUnique({ where: { id } });
    if (!acc || acc.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await prisma.account.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete account" }, { status: 400 });
  }
}


