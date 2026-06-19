"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const expenseSchema = z.object({
  project_id: z.string().uuid().optional().nullable(),
  category: z.string().min(1, "Category is required"),
  amount: z.number().min(0, "Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  receipt_url: z.string().url().optional().nullable(),
});

export async function createExpense(formData: FormData) {
  const supabase = await createClient();

  const data = {
    project_id: formData.get("project_id") as string || null,
    category: formData.get("category") as string,
    amount: parseFloat(formData.get("amount") as string),
    date: formData.get("date") as string,
    notes: (formData.get("notes") as string) || null,
    receipt_url: (formData.get("receipt_url") as string) || null,
  };

  const validated = expenseSchema.parse(data);

  const { error } = await supabase.from("expenses").insert(validated);

  if (error) throw error;

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}

export async function updateExpense(id: string, formData: FormData) {
  const supabase = await createClient();

  const data = {
    project_id: formData.get("project_id") as string || null,
    category: formData.get("category") as string,
    amount: parseFloat(formData.get("amount") as string),
    date: formData.get("date") as string,
    notes: (formData.get("notes") as string) || null,
    receipt_url: (formData.get("receipt_url") as string) || null,
  };

  const validated = expenseSchema.parse(data);

  const { error } = await supabase
    .from("expenses")
    .update(validated)
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("expenses").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}
