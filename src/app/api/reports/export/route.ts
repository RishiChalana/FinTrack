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
    
    // Parse dates correctly for MySQL DATETIME comparison
    // MySQL DATETIME stores dates without timezone, so we need precise date boundaries
    if (start || end) {
      const dateFilter: any = {};
      if (start) {
        // Validate and parse YYYY-MM-DD format
        if (start.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Create date at start of day (00:00:00.000) in server timezone
          // Using ISO string format that Prisma/MySQL understands
          const [year, month, day] = start.split('-').map(Number);
          const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
          dateFilter.gte = startDate;
        } else {
          return NextResponse.json({ error: "Invalid start date format. Use YYYY-MM-DD" }, { status: 400 });
        }
      }
      if (end) {
        // Validate and parse YYYY-MM-DD format
        if (end.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Create date at end of day (23:59:59.999) in server timezone
          const [year, month, day] = end.split('-').map(Number);
          const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
          dateFilter.lte = endDate;
        } else {
          return NextResponse.json({ error: "Invalid end date format. Use YYYY-MM-DD" }, { status: 400 });
        }
      }
      where.date = dateFilter;
    }

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
      if (start || end) {
        doc.setFontSize(10);
        doc.text(`Date Range: ${start || 'Start'} to ${end || 'End'}`, 40, 60);
      }
      doc.setFontSize(10);
      let y = start || end ? 80 : 70;
      flat.forEach(t => {
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
  } catch (e: any) {
    console.error("Report export error:", e);
    if (e.message?.includes("Unauthorized") || e.message?.includes("requireAuth")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to generate report", details: e.message }, { status: 500 });
  }
}


