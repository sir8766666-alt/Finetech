'use client';

import React, { useEffect, useState } from 'react';
import Button from '../../../components/Button';
import { supabase } from '../../../lib/supabase/client';

export default function DuesPage() {
  const [tab, setTab] = useState<'receivables' | 'payables'>('receivables');
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch();
  }, [tab]);

  async function fetch() {
    const table = tab === 'receivables' ? 'receivables' : 'payables';
    const { data } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    setItems(data || []);
  }

  async function togglePaid(id: string, table: string, current: boolean) {
    await supabase.from(table).update({ paid: !current }).eq('id', id);
    fetch();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dues</h1>

      <div className="mb-4">
        <div className="inline-flex border rounded">
          <button onClick={() => setTab('receivables')} className={`px-4 py-2 ${tab === 'receivables' ? 'bg-black/5 font-semibold' : 'text-black/70'}`}>Receivables</button>
          <button onClick={() => setTab('payables')} className={`px-4 py-2 ${tab === 'payables' ? 'bg-black/5 font-semibold' : 'text-black/70'}`}>Payables</button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.id} className="p-3 bg-white rounded-md flex justify-between items-center">
            <div>
              <div className="font-medium">{it.description || 'Due'}</div>
              <div className="text-sm text-black/60">{new Date(it.due_date).toLocaleDateString()}</div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => togglePaid(it.id, tab === 'receivables' ? 'receivables' : 'payables', !!it.paid)}>
                {it.paid ? 'Mark pending' : 'Mark paid'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
