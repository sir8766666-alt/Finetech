'use client';

import React, { useEffect, useState } from 'react';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { supabase } from '../../../lib/supabase/client';

export default function IncomePage() {
  const [items, setItems] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchIncome();
  }, []);

  async function fetchIncome() {
    const { data } = await supabase.from('income').select('*').order('created_at', { ascending: false }).limit(50);
    setItems(data || []);
  }

  async function createIncome() {
    const a = Number(amount);
    if (!a) return;
    const { data, error } = await supabase.from('income').insert([{ amount: a, note }]).select().single();
    if (data && file) {
      const path = `receipts/${data.id}/${file.name}`;
      await supabase.storage.from('receipts').upload(path, file);
      await supabase.from('income').update({ receipt: path }).eq('id', data.id);
    }
    setAmount('');
    setNote('');
    setFile(null);
    fetchIncome();
  }

  async function deleteIncome(id: string) {
    await supabase.from('income').delete().eq('id', id);
    fetchIncome();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Income</h1>

      <div className="mb-4 bg-white p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
          <div>
            <label className="block text-sm mb-1">Receipt (file or link)</label>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>
        <div className="mt-3">
          <Button onClick={createIncome}>Add Income</Button>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="p-3 bg-white rounded-md flex justify-between">
            <div>
              <div className="font-medium">${it.amount}</div>
              <div className="text-sm text-black/60">{it.note}</div>
            </div>
            <div className="flex items-center gap-3">
              {it.receipt && <a href={supabase.storage.from('receipts').getPublicUrl(it.receipt).data.publicUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600">Receipt</a>}
              <button className="text-red-600" onClick={() => deleteIncome(it.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
