"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  budget: z.number().min(0, "Budget must be positive"),
  start_date: z.string().min(1, "Start date is required"),
  status: z.enum(["active", "completed", "on_hold", "cancelled"]),
});

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const data = {
    name: formData.get("name") as string,
    budget: parseFloat(formData.get("budget") as string),
    start_date: formData.get("start_date") as string,
    status: formData.get("status") as string,
  };

  const validated = projectSchema.parse(data);

  const { error } = await supabase.from("projects").insert({
    ...validated,
    user_id: user.id,
  });

  if (error) throw error;

  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient();

  const data = {
    name: formData.get("name") as string,
    budget: parseFloat(formData.get("budget") as string),
    start_date: formData.get("start_date") as string,
    status: formData.get("status") as string,
  };

  const validated = projectSchema.parse(data);

  const { error } = await supabase
    .from("projects")
    .update(validated)
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function deleteProject(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/projects");
  revalidatePath("/dashboard");
}
