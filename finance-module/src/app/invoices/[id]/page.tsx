import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { PrintButton } from "./print-button";

type InvoiceStatus = "draft" | "sent" | "paid";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (!invoice) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-end">
        <PrintButton />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8 print:border-0 print:rounded-none print:p-0">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
            <p className="text-gray-500 mt-1">{invoice.invoice_number}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Company
            </h2>
            <p className="text-gray-500">123 Business Street</p>
            <p className="text-gray-500">City, State 12345</p>
            <p className="text-gray-500">contact@yourcompany.com</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Bill To
            </h3>
            <p className="text-lg font-medium text-gray-900">
              {invoice.client_name}
            </p>
          </div>
          <div className="text-right">
            <div className="mb-2">
              <span className="text-sm text-gray-500">Issue Date:</span>
              <span className="ml-2 text-gray-900">
                {new Date(invoice.issue_date).toLocaleDateString()}
              </span>
            </div>
            <div className="mb-2">
              <span className="text-sm text-gray-500">Due Date:</span>
              <span className="ml-2 text-gray-900">
                {new Date(invoice.due_date).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Status:</span>
              <span className="ml-2">
                <StatusBadge status={invoice.status as InvoiceStatus} />
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-semibold text-gray-500 uppercase">
                  Description
                </th>
                <th className="text-right py-3 text-sm font-semibold text-gray-500 uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-gray-900">Professional Services</td>
                <td className="py-4 text-right text-gray-900">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(invoice.amount)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td className="py-4 text-lg font-semibold text-gray-900">
                  Total
                </td>
                <td className="py-4 text-right text-lg font-semibold text-gray-900">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(invoice.amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
            Notes
          </h3>
          <p className="text-gray-600">
            Thank you for your business. Please make payment by the due date.
          </p>
        </div>
      </div>
    </div>
  );
}
