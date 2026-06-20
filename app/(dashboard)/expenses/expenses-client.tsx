"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExpense, updateExpense, deleteExpense } from "./actions";
import { ReceiptUpload } from "@/components/receipt-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Pencil, ExternalLink } from "lucide-react";

interface ExpenseEntry {
  id: string;
  category: string;
  amount: number;
  date: string;
  notes: string | null;
  receipt_url: string | null;
  project_id: string | null;
}

interface Project {
  id: string;
  name: string;
}

const categories = [
  "Software",
  "Hardware",
  "Services",
  "Travel",
  "Marketing",
  "Utilities",
  "Other",
];

export function ExpensesClient({
  initialExpenses,
  projects,
}: {
  initialExpenses: ExpenseEntry[];
  projects: Project[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseEntry | null>(null);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [expenses, setExpenses] = useState(initialExpenses);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const resetForm = () => {
    setReceiptUrl("");
    setError(null);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("receipt_url", receiptUrl);
    try {
      await createExpense(formData);
      setOpen(false);
      resetForm();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create expense");
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("receipt_url", receiptUrl || editing.receipt_url || "");
    try {
      await updateExpense(editing.id, formData);
      setEditing(null);
      resetForm();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update expense");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id);
        setExpenses(expenses.filter((e) => e.id !== id));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to delete expense");
      }
    }
  };

  const renderForm = (onSubmit: (e: React.FormEvent<HTMLFormElement>) => void, isEdit: boolean) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select name="category" defaultValue={editing?.category || categories[0]}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" name="amount" type="number" step="0.01" required defaultValue={editing?.amount} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" required defaultValue={editing?.date} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="project_id">Project (optional)</Label>
        <select
          id="project_id"
          name="project_id"
          defaultValue={editing?.project_id || ""}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">No project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" defaultValue={editing?.notes || ""} />
      </div>
      <div className="space-y-2">
        <Label>Receipt</Label>
        <ReceiptUpload
          value={isEdit ? (receiptUrl || editing?.receipt_url || "") : receiptUrl}
          onChange={setReceiptUrl}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full">
        {isEdit ? "Save Changes" : "Add Expense"}
      </Button>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            {renderForm(handleCreate, false)}
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => { if (!v) { setEditing(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {renderForm(handleEdit, true)}
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  No expenses yet
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.category}</TableCell>
                  <TableCell className="text-red-600">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(entry.amount)}
                  </TableCell>
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell>{entry.notes || "-"}</TableCell>
                  <TableCell>
                    {entry.receipt_url ? (
                      <a
                        href={entry.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(entry); setError(null); }}>
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
