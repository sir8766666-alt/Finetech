import { createClient } from "@/lib/supabase/server";
import { InvoicesClient } from "./invoices-client";
import { redirect } from "next/navigation";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: invoices } = await supabase.from("invoices").select("*");

  return <InvoicesClient initialInvoices={invoices || []} />;
}
