import { createClient } from "@/lib/supabase/server";
import { DuesClient } from "./dues-client";
import { redirect } from "next/navigation";

export default async function DuesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: dues } = await supabase.from("dues").select("*");

  return <DuesClient initialDues={dues || []} />;
}
