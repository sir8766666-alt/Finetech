import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/stat-card";
import { IncomeExpenseChart } from "@/components/income-expense-chart";
import { BudgetProgress } from "@/components/budget-progress";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  FileText,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [projects, income, expenses, dues, invoices] = await Promise.all([
    supabase.from("projects").select("*"),
    supabase.from("income").select("*"),
    supabase.from("expenses").select("*"),
    supabase.from("dues").select("*"),
    supabase.from("invoices").select("*"),
  ]);

  const totalIncome = income.data?.reduce((sum, i) => sum + i.amount, 0) ?? 0;
  const totalExpenses =
    expenses.data?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const profitLoss = totalIncome - totalExpenses;
  const totalBudget = projects.data?.reduce((sum, p) => sum + p.budget, 0) ?? 0;

  const pendingReceivables =
    dues.data
      ?.filter((d) => d.type === "receivable" && d.status === "pending")
      .reduce((sum, d) => sum + d.amount, 0) ?? 0;

  const totalInvoiceAmount =
    invoices.data?.reduce((sum, i) => sum + i.amount, 0) ?? 0;

  const recentTransactions = [
    ...(income.data?.map((i) => ({
      id: i.id,
      type: "income" as const,
      description: i.source,
      amount: i.amount,
      date: i.date,
    })) ?? []),
    ...(expenses.data?.map((e) => ({
      id: e.id,
      type: "expense" as const,
      description: e.category,
      amount: e.amount,
      date: e.date,
    })) ?? []),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const monthlyData = (() => {
    const months: Record<string, { income: number; expenses: number }> = {};

    income.data?.forEach((i) => {
      const month = new Date(i.date).toLocaleString("default", {
        month: "short",
      });
      if (!months[month]) months[month] = { income: 0, expenses: 0 };
      months[month].income += i.amount;
    });

    expenses.data?.forEach((e) => {
      const month = new Date(e.date).toLocaleString("default", {
        month: "short",
      });
      if (!months[month]) months[month] = { income: 0, expenses: 0 };
      months[month].expenses += e.amount;
    });

    return Object.entries(months).map(([month, data]) => ({
      month,
      ...data,
    }));
  })();

  const projectBudgets =
    projects.data?.map((p) => {
      const spent =
        expenses.data
          ?.filter((e) => e.project_id === p.id)
          .reduce((sum, e) => sum + e.amount, 0) ?? 0;
      return {
        id: p.id,
        name: p.name,
        budget: p.budget,
        spent,
      };
    }) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Budget"
          value={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(totalBudget)}
          icon={Wallet}
        />
        <StatCard
          title="Total Income"
          value={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(totalIncome)}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Expenses"
          value={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(totalExpenses)}
          icon={TrendingDown}
        />
        <StatCard
          title="Profit/Loss"
          value={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(profitLoss)}
          icon={DollarSign}
        />
        <StatCard
          title="Pending Receivables"
          value={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(pendingReceivables)}
          icon={Clock}
        />
        <StatCard
          title="Total Invoices"
          value={new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(totalInvoiceAmount)}
          icon={FileText}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeExpenseChart data={monthlyData} />

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Transactions
          </h3>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-sm">No transactions yet</p>
            ) : (
              recentTransactions.map((t) => (
                <div
                  key={`${t.type}-${t.id}`}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {t.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(t.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      t.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(t.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Budget Utilization
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectBudgets.length === 0 ? (
            <p className="text-gray-500 text-sm">No projects yet</p>
          ) : (
            projectBudgets.map((p) => (
              <BudgetProgress
                key={p.id}
                projectName={p.name}
                budget={p.budget}
                spent={p.spent}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
