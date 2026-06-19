"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createIncome, deleteIncome } from "./actions";
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
import { Plus, Trash2 } from "lucide-react";

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
  const [receiptUrl, setReceiptUrl] = useState("");
  const [income, setIncome] = useState(initialIncome);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("receipt_url", receiptUrl);
    await createIncome(formData);
    setOpen(false);
    setReceiptUrl("");
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this income entry?")) {
      await deleteIncome(id);
      setIncome(income.filter((i) => i.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Income</h1>
        <Dialog open={open} onOpenChange={setOpen}>
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input id="source" name="source" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_id">Project (optional)</Label>
                <select
                  id="project_id"
                  name="project_id"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">No project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" name="notes" />
              </div>
              <div className="space-y-2">
                <Label>Receipt</Label>
                <ReceiptUpload value={receiptUrl} onChange={setReceiptUrl} />
              </div>
              <Button type="submit" className="w-full">
                Add Income
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {income.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
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
                  <TableCell>
                    {new Date(entry.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{entry.notes || "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
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
