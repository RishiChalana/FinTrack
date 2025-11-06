import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { Parser as Json2CsvParser } from "json2csv";
import jsPDF from "jspdf";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "csv"; // csv | pdf
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const where: any = { userId };
    if (start || end) where.date = { gte: start ? new Date(start) : undefined, lte: end ? new Date(end) : undefined };

    const txns = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      include: { category: true, account: true },
    });

    const flat = txns.map((t) => ({
      id: t.id,
      date: t.date.toISOString().slice(0, 10),
      type: t.type,
      amount: t.amount.toString(),
      currency: t.currency,
      account: t.account?.name || t.accountId,
      category: t.category?.name || '',
      merchant: t.notes || '',
      method: t.method || '',
    }));

    if (type === "csv") {
      const parser = new Json2CsvParser({ fields: ["id", "date", "type", "amount", "currency", "account", "category", "merchant", "method"] });
      const csv = "\uFEFF" + parser.parse(flat);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=report.csv",
        },
      });
    }

    if (type === "pdf") {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      doc.setFontSize(16);
      doc.text("Financial Report", 40, 40);
      doc.setFontSize(10);
      let y = 70;
      flat.slice(0, 60).forEach(t => {
        const line = `${t.date}   ${t.type.padEnd(7)}   ${t.amount} ${t.currency}   ${t.category || '—'}   ${t.merchant || ''}`;
        doc.text(line, 40, y);
        y += 14;
        if (y > 780) { doc.addPage(); y = 40; }
      });
      const pdf = doc.output("arraybuffer");
      return new NextResponse(Buffer.from(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=report.pdf",
        },
      });
    }

    return NextResponse.json({ error: "Unsupported type" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}


