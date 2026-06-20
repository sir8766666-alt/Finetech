import { createClient } from "@/lib/supabase/server";
import { InvoicesClient } from "./invoices-client";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: invoices } = await supabase.from("invoices").select("*");

  return <InvoicesClient initialInvoices={invoices || []} />;
}
