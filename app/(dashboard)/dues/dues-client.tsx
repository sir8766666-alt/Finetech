"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDue, updateDueStatus, deleteDue } from "./actions";
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
import { Plus, Trash2 } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("receivable");
  const [dues, setDues] = useState(initialDues);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("type", activeTab);
    formData.set("status", "pending");
    await createDue(formData);
    setOpen(false);
    router.refresh();
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "pending" ? "paid" : "pending";
    await updateDueStatus(id, newStatus);
    setDues(
      dues.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this due?")) {
      await deleteDue(id);
      setDues(dues.filter((d) => d.id !== id));
    }
  };

  const receivables = dues.filter((d) => d.type === "receivable");
  const payables = dues.filter((d) => d.type === "payable");

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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="party_name">Party Name</Label>
                <Input id="party_name" name="party_name" required />
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
                <Label htmlFor="due_date">Due Date</Label>
                <Input id="due_date" name="due_date" type="date" required />
              </div>
              <Button type="submit" className="w-full">
                Add Due
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="receivable">Receivables</TabsTrigger>
          <TabsTrigger value="payable">Payables</TabsTrigger>
        </TabsList>

        <TabsContent value="receivable">
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
                {receivables.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-gray-500"
                    >
                      No receivables yet
                    </TableCell>
                  </TableRow>
                ) : (
                  receivables.map((due) => (
                    <TableRow key={due.id}>
                      <TableCell className="font-medium">
                        {due.party_name}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(due.amount)}
                      </TableCell>
                      <TableCell>
                        {new Date(due.due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={due.status as DueStatus} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStatusToggle(due.id, due.status)
                            }
                          >
                            {due.status === "pending" ? "Mark Paid" : "Reopen"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(due.id)}
                          >
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
        </TabsContent>

        <TabsContent value="payable">
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
                {payables.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-gray-500"
                    >
                      No payables yet
                    </TableCell>
                  </TableRow>
                ) : (
                  payables.map((due) => (
                    <TableRow key={due.id}>
                      <TableCell className="font-medium">
                        {due.party_name}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(due.amount)}
                      </TableCell>
                      <TableCell>
                        {new Date(due.due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={due.status as DueStatus} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStatusToggle(due.id, due.status)
                            }
                          >
                            {due.status === "pending" ? "Mark Paid" : "Reopen"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(due.id)}
                          >
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
