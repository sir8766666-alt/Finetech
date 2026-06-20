'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabase/client';
import Button from '../../../../components/Button';

export default function InvoiceDetail() {
  const params = useParams();
  const id = params?.id;
  const [invoice, setInvoice] = useState<any | null>(null);

  useEffect(() => {
    if (id) fetchInvoice();
  }, [id]);

  async function fetchInvoice() {
    const { data } = await supabase.from('invoices').select('*').eq('id', id).single();
    setInvoice(data || null);
  }

  function printInvoice() {
    window.print();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Invoice {invoice?.number}</h1>
        <div className="flex gap-2">
          <Button onClick={printInvoice}>Print</Button>
          <Button onClick={() => alert('Download PDF stub')}>Download</Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow" id="invoice-print-area">
        <div className="mb-4">
          <div className="text-sm text-black/60">To</div>
          <div className="font-medium">{invoice?.customer_name}</div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Description</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Price</th>
              <th className="py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {(invoice?.items || []).map((it: any, idx: number) => (
              <tr key={idx} className="border-b">
                <td className="py-2">{it.description}</td>
                <td className="py-2">{it.qty}</td>
                <td className="py-2">${it.price}</td>
                <td className="py-2">${(it.qty * it.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 text-right">
          <div className="text-sm text-black/70">Total</div>
          <div className="text-2xl font-semibold">${invoice?.total}</div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          /* hide sidebar and action buttons during printing */
          body * { visibility: hidden; }
          #invoice-print-area, #invoice-print-area * { visibility: visible; }
          #invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
