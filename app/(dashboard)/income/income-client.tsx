"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createIncome, updateIncome, deleteIncome } from "./actions";
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
import { Plus, Trash2, Pencil, ExternalLink } from "lucide-react";

interface IncomeEntry {
  id: string;
  source: string;
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

export function IncomeClient({
  initialIncome,
  projects,
}: {
  initialIncome: IncomeEntry[];
  projects: Project[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IncomeEntry | null>(null);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [income, setIncome] = useState(initialIncome);
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
      await createIncome(formData);
      setOpen(false);
      resetForm();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create income");
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("receipt_url", receiptUrl || editing.receipt_url || "");
    try {
      await updateIncome(editing.id, formData);
      setEditing(null);
      resetForm();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update income");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this income entry?")) {
      try {
        await deleteIncome(id);
        setIncome(income.filter((i) => i.id !== id));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to delete income");
      }
    }
  };

  const renderForm = (onSubmit: (e: React.FormEvent<HTMLFormElement>) => void, isEdit: boolean) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="source">Source</Label>
        <Input id="source" name="source" required defaultValue={editing?.source} />
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
        {isEdit ? "Save Changes" : "Add Income"}
      </Button>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Income</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Income
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Income</DialogTitle>
            </DialogHeader>
            {renderForm(handleCreate, false)}
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => { if (!v) { setEditing(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Income</DialogTitle>
          </DialogHeader>
          {renderForm(handleEdit, true)}
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {income.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  No income entries yet
                </TableCell>
              </TableRow>
            ) : (
              income.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.source}</TableCell>
                  <TableCell className="text-green-600">
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
