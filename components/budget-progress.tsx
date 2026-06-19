import { cn } from "@/lib/utils";

interface BudgetProgressProps {
  projectName: string;
  budget: number;
  spent: number;
}

export function BudgetProgress({ projectName, budget, spent }: BudgetProgressProps) {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const clampedPercentage = Math.min(percentage, 100);

  const getColor = (pct: number) => {
    if (pct >= 90) return "bg-red-500";
    if (pct >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">{projectName}</span>
        <span className="text-sm text-gray-500">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(spent)}{" "}
          /{" "}
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(budget)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn("h-2 rounded-full", getColor(percentage))}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {percentage.toFixed(1)}% utilized
      </p>
    </div>
  );
}
