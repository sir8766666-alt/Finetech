import { cn } from "@/lib/utils";

type StatusType =
  | "active"
  | "completed"
  | "on_hold"
  | "cancelled"
  | "pending"
  | "paid"
  | "draft"
  | "sent"
  | "overdue";

interface StatusBadgeProps {
  status: StatusType;
}

const statusStyles: Record<StatusType, string> = {
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  on_hold: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  overdue: "bg-red-100 text-red-800",
};

const statusLabels: Record<StatusType, string> = {
  active: "Active",
  completed: "Completed",
  on_hold: "On Hold",
  cancelled: "Cancelled",
  pending: "Pending",
  paid: "Paid",
  draft: "Draft",
  sent: "Sent",
  overdue: "Overdue",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] || "bg-gray-100 text-gray-800";
  const label = statusLabels[status] || status;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        style
      )}
    >
      {label}
    </span>
  );
}
