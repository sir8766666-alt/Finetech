import { createClient } from "@/lib/supabase/server";
import { IncomeClient } from "./income-client";
import { redirect } from "next/navigation";

export default async function IncomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: income }, { data: projects }] = await Promise.all([
    supabase.from("income").select("*"),
    supabase.from("projects").select("id, name"),
  ]);

  return <IncomeClient initialIncome={income || []} projects={projects || []} />;
}
