import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { Parser as Json2CsvParser } from "json2csv";
import jsPDF from "jspdf";

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "csv"; // csv | pdf
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const where: any = { userId };
    if (start || end) where.date = { gte: start ? new Date(start) : undefined, lte: end ? new Date(end) : undefined };

    const txns = await prisma.transaction.findMany({ where, orderBy: { date: "desc" } });

    if (type === "csv") {
      const parser = new Json2CsvParser({ fields: ["id", "type", "amount", "currency", "accountId", "categoryId", "date", "notes"] });
      const csv = parser.parse(txns);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=report.csv",
        },
      });
    }

    if (type === "pdf") {
      const doc = new jsPDF();
      doc.text("Financial Report", 10, 10);
      let y = 20;
      txns.slice(0, 40).forEach(t => {
        const line = `${t.date.toISOString().slice(0,10)}  ${t.type}  ${t.amount} ${t.currency}`;
        doc.text(line, 10, y);
        y += 8;
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


