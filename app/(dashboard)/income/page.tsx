import { createClient } from "@/lib/supabase/server";
import { IncomeClient } from "./income-client";

export default async function IncomePage() {
  const supabase = await createClient();
  const [{ data: income }, { data: projects }] = await Promise.all([
    supabase.from("income").select("*"),
    supabase.from("projects").select("id, name"),
  ]);

  return <IncomeClient initialIncome={income || []} projects={projects || []} />;
}
