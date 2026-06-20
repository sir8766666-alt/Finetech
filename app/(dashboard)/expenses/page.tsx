'use client';

import React, { useEffect, useState } from 'react';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { supabase } from '../../../lib/supabase/client';

export default function ExpensesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    const { data } = await supabase.from('expenses').select('*').order('created_at', { ascending: false }).limit(100);
    setItems(data || []);
  }

  async function createExpense() {
    const a = Number(amount);
    if (!a) return;
    const { data } = await supabase.from('expenses').insert([{ amount: a, note }]).select().single();
    setAmount('');
    setNote('');
    fetchExpenses();
  }

  async function updateInline(id: string, changes: Partial<any>) {
    await supabase.from('expenses').update(changes).eq('id', id);
    fetchExpenses();
  }

  async function deleteExpense(id: string) {
    await supabase.from('expenses').delete().eq('id', id);
    fetchExpenses();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Expenses</h1>

      <div className="mb-4 bg-white p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
          <div>
            <Button onClick={createExpense}>Add Expense</Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="p-3 bg-white rounded-md flex justify-between items-center">
            <div className="flex-1">
              <div className="font-medium">${it.amount}</div>
              <div className="text-sm text-black/60">{it.note}</div>
            </div>

            <div className="flex gap-2 items-center">
              {/* Inline edit example */}
              <input
                type="number"
                className="w-24 border px-2 py-1 rounded"
                defaultValue={it.amount}
                onBlur={(e) => updateInline(it.id, { amount: Number(e.target.value) })}
              />
              <button className="text-red-600" onClick={() => deleteExpense(it.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
