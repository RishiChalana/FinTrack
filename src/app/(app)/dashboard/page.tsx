import { BalanceCards } from "@/components/dashboard/balance-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { BudgetStatus } from "@/components/dashboard/budget-status";
import { SpendingChart } from "@/components/dashboard/spending-chart";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <BalanceCards />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <div className="space-y-6">
          <BudgetStatus />
          <SpendingChart />
        </div>
      </div>
    </div>
  );
}
