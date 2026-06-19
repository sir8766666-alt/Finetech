import { createClient } from "@/lib/supabase/server";
import { ExpensesClient } from "./expenses-client";
import { redirect } from "next/navigation";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: expenses }, { data: projects }] = await Promise.all([
    supabase.from("expenses").select("*"),
    supabase.from("projects").select("id, name"),
  ]);

  return (
    <ExpensesClient initialExpenses={expenses || []} projects={projects || []} />
  );
}
