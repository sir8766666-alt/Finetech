"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const dueSchema = z.object({
  type: z.enum(["receivable", "payable"]),
  party_name: z.string().min(1, "Party name is required"),
  amount: z.number().min(0, "Amount must be positive"),
  due_date: z.string().min(1, "Due date is required"),
  status: z.enum(["pending", "paid"]),
});

export async function createDue(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const data = {
    type: formData.get("type") as string,
    party_name: formData.get("party_name") as string,
    amount: parseFloat(formData.get("amount") as string),
    due_date: formData.get("due_date") as string,
    status: formData.get("status") as string,
  };

  const validated = dueSchema.parse(data);

  const { error } = await supabase.from("dues").insert({
    ...validated,
    user_id: user.id,
  });

  if (error) throw error;

  revalidatePath("/dues");
  revalidatePath("/dashboard");
}

export async function updateDueStatus(id: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("dues")
    .update({ status })
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/dues");
  revalidatePath("/dashboard");
}

export async function deleteDue(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("dues").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/dues");
  revalidatePath("/dashboard");
}
