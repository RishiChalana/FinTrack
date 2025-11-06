import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export const runtime = 'nodejs';

type CsvRow = Record<string, string>;

function parseCsv(content: string): CsvRow[] {
  const rawLines = content.split(/\r?\n/);
  const nonEmptyLines = rawLines.filter((l) => l.trim().length > 0);
  if (nonEmptyLines.length === 0) return [];
  // Detect delimiter from header: choose the more frequent of comma/semicolon
  const headerLine = nonEmptyLines[0];
  const commaCount = (headerLine.match(/,/g) || []).length;
  const semiCount = (headerLine.match(/;/g) || []).length;
  const delimiter = semiCount > commaCount ? ';' : ',';
  const headers = splitCsvLine(headerLine, delimiter)
    .map((h) => h.replace(/^\uFEFF/, "")) // strip BOM if present
    .map((h) => h.trim().toLowerCase());
  const rows: CsvRow[] = [];
  for (let i = 1; i < nonEmptyLines.length; i++) {
    const cols = splitCsvLine(nonEmptyLines[i], delimiter);
    const row: CsvRow = {};
    headers.forEach((h, idx) => {
      row[h] = (cols[idx] ?? "").trim();
    });
    rows.push(row);
  }
  return rows;
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length === 0) {
      return NextResponse.json({ error: "CSV appears empty or could not be parsed. Ensure it has a header row.", imported: 0, transactions: [] }, { status: 400 });
    }

    // Fetch user accounts and categories for mapping
    const [accounts, categories] = await Promise.all([
      prisma.account.findMany({ where: { userId } }),
      prisma.category.findMany({ where: { userId } }),
    ]);
    if (accounts.length === 0) {
      return NextResponse.json({ error: "No account found. Create an account first." }, { status: 400 });
    }
    const accountNameToId = new Map<string, string>(
      accounts.map((a) => [a.name.trim().toLowerCase(), a.id])
    );
    const categoryNameToId = new Map<string, { id: string; type: string }>(
      categories.map((c) => [c.name.trim().toLowerCase(), { id: c.id, type: c.type }])
    );

    const createdIds: string[] = [];
    for (const r of rows) {
      // Support either amount or separate credit/debit columns and CR/DR indicators
      const crdr = (r["crdr"] ?? r["dr/cr"] ?? r["credit/debit"] ?? r["txn_indicator"] ?? "").toString().trim().toUpperCase();
      const statusStr = (r["status"] ?? r["txn_status"] ?? r["transaction status"] ?? "").toString().trim().toUpperCase();

      // Look for alternate credit/debit column names
      const creditStrRaw = (r["credit"] ?? r["credit amount"] ?? r["deposit"] ?? r["amount credited"] ?? r["credit (rs.)"] ?? "").toString();
      const debitStrRaw = (r["debit"] ?? r["debit amount"] ?? r["withdrawal"] ?? r["amount debited"] ?? r["debit (rs.)"] ?? "").toString();
      const normalizeNum = (s: string) => {
        const trimmed = s.trim();
        const isParenNeg = /^\(.+\)$/.test(trimmed);
        const numeric = trimmed.replace(/[(),\s]/g, "").replace(/\u00A0/g, "");
        const n = Number(numeric);
        return isParenNeg ? -Math.abs(n) : n;
      };
      const creditStr = creditStrRaw ? String(creditStrRaw) : "";
      const debitStr = debitStrRaw ? String(debitStrRaw) : "";
      const creditValRaw = creditStr ? normalizeNum(creditStr) : 0;
      const debitValRaw = debitStr ? normalizeNum(debitStr) : 0;
      const creditVal = Math.abs(creditValRaw);
      const debitVal = Math.abs(debitValRaw);
      const hasCreditDebit = !!creditStr || !!debitStr;

      let numericAmount: number | null = null;
      let type: "INCOME" | "EXPENSE" | "TRANSFER" = "EXPENSE";
      if (hasCreditDebit) {
        if (creditVal > 0) { numericAmount = creditVal; type = "INCOME"; }
        else if (debitVal > 0) { numericAmount = debitVal; type = "EXPENSE"; }
        else { numericAmount = 0; }
      }
      if (numericAmount === null) {
        const rawAmountStr = (r["amount"] ?? r["amt"] ?? "").toString();
        if (!rawAmountStr) continue;
        const amt = normalizeNum(rawAmountStr);
        if (Number.isNaN(amt)) continue;
        numericAmount = Math.abs(amt);
        // Map CR/DR or textual types if provided
        const rawType = (r["type"] ?? r["txn_type"] ?? r["transaction type"] ?? "").toString().trim().toUpperCase();
        const isCredit = crdr === "CR" || statusStr === "CREDITED" || ["CR","C","CREDIT","CRED","DEPOSIT"].includes(rawType);
        const isDebit = crdr === "DR" || statusStr === "DEBITED" || ["DR","D","DEBIT","DEB","WITHDRAWAL","WD","WDL"].includes(rawType);
        if (isCredit) type = "INCOME";
        else if (isDebit) type = "EXPENSE";
        else {
          type = amt < 0 ? "EXPENSE" : "INCOME";
        }
      }
      if (!numericAmount || numericAmount === 0) {
        // Nothing to import
        continue;
      }

      const description = r["description"] ?? r["memo"] ?? r["payee"] ?? r["merchant"] ?? "";
      // Store merchant/payee in notes so UI and budget name match can use it
      const notes = (r["merchant"] ?? r["payee"] ?? r["notes"] ?? description ?? "").toString();
      const method = (r["method"] ?? r["mode"] ?? "").toString() || null;
      const rawDate = r["date"] ?? r["posted"] ?? r["txn_date"] ?? r["transaction date"] ?? "";
      const date = rawDate ? new Date(rawDate) : new Date();

      let amountAbs = Math.abs(numericAmount);
      if (type === "EXPENSE" && numericAmount > 0) amountAbs = Math.abs(numericAmount) * 1;
      if (type === "INCOME" && numericAmount < 0) amountAbs = Math.abs(numericAmount);

      const accountName = (r["account"] ?? r["account name"] ?? r["account number"] ?? "").trim().toLowerCase();
      const accountId = accountNameToId.get(accountName) ?? accounts[0].id;
      const currency = (r["currency"] ?? accounts.find((a) => a.id === accountId)?.currency ?? "USD").toString();

      // Map category by name if provided
      let categoryId: string | null = null;
      const catName = (r["category"] ?? r["category name"] ?? "").trim().toLowerCase();
      if (catName) {
        const found = categoryNameToId.get(catName);
        if (found && found.type !== "INCOME" && type === "EXPENSE") categoryId = found.id;
        if (found && found.type === "INCOME" && type === "INCOME") categoryId = found.id;
      }

      const created = await prisma.transaction.create({
        data: {
          userId,
          accountId,
          type: type as any,
          amount: amountAbs.toString(),
          currency,
          categoryId: categoryId ?? null,
          method,
          notes: notes || null,
          date,
        },
      });
      createdIds.push(created.id);
    }

    // Return newly created recent transactions (up to 50)
    const recent = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 50,
      include: { category: true },
    });

    return NextResponse.json({ imported: createdIds.length, transactions: recent });
  } catch (e) {
    return NextResponse.json({ error: "Failed to import CSV" }, { status: 400 });
  }
}


