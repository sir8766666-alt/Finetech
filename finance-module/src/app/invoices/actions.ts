"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const invoiceSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  amount: z.number().min(0, "Amount must be positive"),
  issue_date: z.string().min(1, "Issue date is required"),
  due_date: z.string().min(1, "Due date is required"),
  status: z.enum(["draft", "sent", "paid"]),
});

export async function createInvoice(formData: FormData) {
  const supabase = await createClient();

  const data = {
    client_name: formData.get("client_name") as string,
    amount: parseFloat(formData.get("amount") as string),
    issue_date: formData.get("issue_date") as string,
    due_date: formData.get("due_date") as string,
    status: formData.get("status") as string,
  };

  const validated = invoiceSchema.parse(data);

  const { error } = await supabase.from("invoices").insert(validated);

  if (error) throw error;

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}

export async function updateInvoiceStatus(id: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("invoices")
    .update({ status })
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("invoices").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}
