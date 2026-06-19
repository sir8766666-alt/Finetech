"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const incomeSchema = z.object({
  project_id: z.string().uuid().optional().nullable(),
  source: z.string().min(1, "Source is required"),
  amount: z.number().min(0, "Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  receipt_url: z.string().url().optional().nullable(),
});

export async function createIncome(formData: FormData) {
  const supabase = await createClient();

  const data = {
    project_id: formData.get("project_id") as string || null,
    source: formData.get("source") as string,
    amount: parseFloat(formData.get("amount") as string),
    date: formData.get("date") as string,
    notes: (formData.get("notes") as string) || null,
    receipt_url: (formData.get("receipt_url") as string) || null,
  };

  const validated = incomeSchema.parse(data);

  const { error } = await supabase.from("income").insert(validated);

  if (error) throw error;

  revalidatePath("/income");
  revalidatePath("/dashboard");
}

export async function updateIncome(id: string, formData: FormData) {
  const supabase = await createClient();

  const data = {
    project_id: formData.get("project_id") as string || null,
    source: formData.get("source") as string,
    amount: parseFloat(formData.get("amount") as string),
    date: formData.get("date") as string,
    notes: (formData.get("notes") as string) || null,
    receipt_url: (formData.get("receipt_url") as string) || null,
  };

  const validated = incomeSchema.parse(data);

  const { error } = await supabase
    .from("income")
    .update(validated)
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/income");
  revalidatePath("/dashboard");
}

export async function deleteIncome(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("income").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/income");
  revalidatePath("/dashboard");
}
