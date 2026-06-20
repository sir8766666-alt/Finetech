import { createClient } from "@/lib/supabase/server";
import { DuesClient } from "./dues-client";

export default async function DuesPage() {
  const supabase = await createClient();
  const { data: dues } = await supabase.from("dues").select("*");

  return <DuesClient initialDues={dues || []} />;
}
