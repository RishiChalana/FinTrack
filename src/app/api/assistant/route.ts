import { NextRequest, NextResponse } from "next/server";
import { aiFinancialAssistant } from "@/ai/flows/ai-financial-assistant";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // Auth: return 401 instead of masking as 500
  let userId: string;
  try {
    const auth = requireAuth(req);
    userId = auth.userId;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse body
  let query: unknown;
  try {
    ({ query } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

  try {
    const q = String(query).toLowerCase();

    // Helper: date range for current month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Intent: expenses for category this month (match words like food, rent etc.)
    const matchSpend = q.match(/(?:show|what|how).*(?:my )?(.+?) (?:expense|expenses|spend|spending).*?(?:this|current)?\s*month/);
    if (matchSpend) {
      const categoryName = matchSpend[1].trim();
      const txns = await prisma.transaction.findMany({
        where: {
          userId,
          type: 'EXPENSE',
          date: { gte: monthStart, lte: monthEnd },
        },
      });
      const spent = txns
        .filter(t => (t.notes || '').toLowerCase() === categoryName.toLowerCase())
        .reduce((s, t) => s + Number(t.amount), 0);
      return NextResponse.json({ response: `You spent ${spent.toFixed(2)} this month on ${categoryName}.` });
    }

    // Intent: how much saved in month (income - expense)
    if (q.includes('how much') && q.includes('save')) {
      // Optional specific month name e.g., October
      const monthNames = ['january','february','march','april','may','june','july','august','september','october','november','december'];
      let start = monthStart, end = monthEnd;
      for (let i=0;i<12;i++) {
        if (q.includes(monthNames[i])) {
          const year = now.getFullYear();
          start = new Date(year, i, 1);
          end = new Date(year, i+1, 0, 23, 59, 59, 999);
          break;
        }
      }
      const txns = await prisma.transaction.findMany({ where: { userId, date: { gte: start, lte: end } } });
      const income = txns.filter(t => t.type === 'INCOME').reduce((s,t)=> s + Number(t.amount), 0);
      const expense = txns.filter(t => t.type === 'EXPENSE').reduce((s,t)=> s + Number(t.amount), 0);
      const saved = income - expense;
      return NextResponse.json({ response: `Savings for the period: ${saved.toFixed(2)}.` });
    }

    // Intent: create new budget for X
    const createBudget = q.match(/create .*budget.* for (.+)/);
    if (createBudget) {
      const name = createBudget[1].trim();
      // Create a default monthly budget with zero amount; user can edit later
      await prisma.budget.create({ data: { userId, name, amount: '0', period: 'MONTHLY', currency: 'INR' } });
      return NextResponse.json({ response: `Created budget '${name}'. You can set its amount in Budgets.` });
    }

    // Budgets summary
    if (q.includes('budget')) {
      const items = await prisma.budget.findMany({ where: { userId } });
      if (items.length === 0) return NextResponse.json({ response: 'You have no budgets yet.' });
      const lines = items.map(b => `${b.name} • ${Number(b.amount).toFixed(2)} ${b.currency} • ${b.period}`).join('\n');
      return NextResponse.json({ response: `Here are your budgets (amount • currency • period):\n\n${lines}` });
    }

    // Monthly spending summary
    if (q.includes('month') && (q.includes('spending') || q.includes('summary') || q.includes('report'))) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const txns = await prisma.transaction.findMany({ where: { userId, date: { gte: start, lte: end } } });
      const income = txns.filter(t => t.type === 'INCOME').reduce((s,t)=> s + Number(t.amount), 0);
      const expense = txns.filter(t => t.type === 'EXPENSE').reduce((s,t)=> s + Number(t.amount), 0);
      const saved = income - expense;
      return NextResponse.json({ response: `This month: Income ${income.toFixed(2)}, Expenses ${expense.toFixed(2)}, Savings ${saved.toFixed(2)}.` });
    }

    // Export report as PDF/CSV
    if (q.includes('report') && (q.includes('pdf') || q.includes('export'))) {
      const url = `/api/reports/export?type=pdf`;
      return NextResponse.json({ response: `Here is your PDF report: ${url}` });
    }

    // Transactions summary
    if (q.includes('transaction')) {
      const txns = await prisma.transaction.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 20 });
      if (txns.length === 0) return NextResponse.json({ response: 'No transactions yet.' });
      const lines = txns.map(t => `${new Date(t.date).toISOString().slice(0,10)} • ${t.type} • ${t.notes || '—'} • ${Number(t.amount).toFixed(2)} ${t.currency}`).join('\n');
      return NextResponse.json({ response: `Latest ${txns.length} transactions:\n\n${lines}` });
    }

    // Generic: show all expenses (latest, with total)
    if (q.includes('expense')) {
      const txns = await prisma.transaction.findMany({
        where: { userId, type: 'EXPENSE' },
        orderBy: { date: 'desc' },
        take: 20,
      });
      const total = txns.reduce((s, t) => s + Number(t.amount), 0);
      const lines = txns.map(t => `${new Date(t.date).toISOString().slice(0,10)} • ${t.notes || 'Expense'} • ${Number(t.amount).toFixed(2)} ${t.currency}`).join("\n");
      const resp = `You have ${txns.length} recent expenses totaling ${total.toFixed(2)}.\n\n${lines || 'No expenses found.'}`;
      return NextResponse.json({ response: resp });
    }

    // Default to LLM
    try {
      const result = await aiFinancialAssistant({ query: String(query) });
      return NextResponse.json(result);
    } catch (e) {
      return NextResponse.json({ response: "I'm having trouble reaching the AI service right now. Please try again later." });
    }
  } catch (e) {
    return NextResponse.json({ error: "AI assistant error" }, { status: 500 });
  }
}


