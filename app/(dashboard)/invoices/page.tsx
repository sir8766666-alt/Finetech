'use client';

import React, { useEffect, useState } from 'react';
import Button from '../../../components/Button';
import { supabase } from '../../../lib/supabase/client';
import Link from 'next/link';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    setInvoices(data || []);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <Button onClick={() => alert('Open invoice create modal or page')}>Create invoice</Button>
      </div>

      <div className="space-y-3">
        {invoices.map((inv) => (
          <div key={inv.id} className="p-4 bg-white rounded-md flex justify-between items-center">
            <div>
              <div className="font-medium">{inv.number || 'INV-?'}</div>
              <div className="text-sm text-black/60">{inv.customer_name}</div>
            </div>
            <div className="flex items-center gap-4">
              <Link href={`/invoices/${inv.id}`} className="text-blue-600">View</Link>
              <div className={`px-2 py-1 rounded text-sm ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : inv.status === 'sent' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                {inv.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
