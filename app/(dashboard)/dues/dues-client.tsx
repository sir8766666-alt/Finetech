"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDue, updateDue, updateDueStatus, deleteDue } from "./actions";
import { StatusBadge } from "@/components/status-badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Pencil } from "lucide-react";

interface Due {
  id: string;
  type: string;
  party_name: string;
  amount: number;
  due_date: string;
  status: string;
}

type DueStatus = "pending" | "paid";

export function DuesClient({ initialDues }: { initialDues: Due[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Due | null>(null);
  const [activeTab, setActiveTab] = useState("receivable");
  const [dues, setDues] = useState(initialDues);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("type", activeTab);
    formData.set("status", "pending");
    try {
      await createDue(formData);
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create due");
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await updateDue(editing.id, formData);
      setEditing(null);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update due");
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "pending" ? "paid" : "pending";
    try {
      await updateDueStatus(id, newStatus);
      setDues(dues.map((d) => (d.id === id ? { ...d, status: newStatus } : d)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this due?")) {
      try {
        await deleteDue(id);
        setDues(dues.filter((d) => d.id !== id));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to delete due");
      }
    }
  };

  const renderForm = (onSubmit: (e: React.FormEvent<HTMLFormElement>) => void, isEdit: boolean) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="party_name">Party Name</Label>
        <Input id="party_name" name="party_name" required defaultValue={editing?.party_name} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" name="amount" type="number" step="0.01" required defaultValue={editing?.amount} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="due_date">Due Date</Label>
        <Input id="due_date" name="due_date" type="date" required defaultValue={editing?.due_date} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full">
        {isEdit ? "Save Changes" : "Add Due"}
      </Button>
    </form>
  );

  const receivables = dues.filter((d) => d.type === "receivable");
  const payables = dues.filter((d) => d.type === "payable");

  const renderTable = (items: Due[]) => (
    <div className="bg-white rounded-lg border border-gray-200 mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Party</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500">
                No {activeTab === "receivable" ? "receivables" : "payables"} yet
              </TableCell>
            </TableRow>
          ) : (
            items.map((due) => (
              <TableRow key={due.id}>
                <TableCell className="font-medium">{due.party_name}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(due.amount)}
                </TableCell>
                <TableCell>{new Date(due.due_date).toLocaleDateString()}</TableCell>
                <TableCell><StatusBadge status={due.status as DueStatus} /></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusToggle(due.id, due.status)}
                    >
                      {due.status === "pending" ? "Mark Paid" : "Reopen"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(due); setError(null); }}>
                      <Pencil className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(due.id)}>
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
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dues</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Due
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Due</DialogTitle>
            </DialogHeader>
            {renderForm(handleCreate, false)}
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => { if (!v) { setEditing(null); setError(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Due</DialogTitle>
          </DialogHeader>
          {renderForm(handleEdit, true)}
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="receivable">Receivables</TabsTrigger>
          <TabsTrigger value="payable">Payables</TabsTrigger>
        </TabsList>
        <TabsContent value="receivable">{renderTable(receivables)}</TabsContent>
        <TabsContent value="payable">{renderTable(payables)}</TabsContent>
      </Tabs>
    </div>
  );
}
