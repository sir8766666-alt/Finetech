'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase/client';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

type Aggregate = {
  total_budget: number;
  total_income: number;
  total_expenses: number;
  profit_loss: number;
  pending_receivables: number;
  pending_payables: number;
  total_invoices: number;
};

type MonthlyPoint = { month: string; income: number; expenses: number };

export default function DashboardPage() {
  const [agg, setAgg] = useState<Aggregate | null>(null);
  const [monthly, setMonthly] = useState<MonthlyPoint[]>([]);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    fetchAggregates();
    fetchMonthly();
    fetchRecent();
  }, []);

  async function fetchAggregates() {
    // Example aggregation via Supabase: adjust to your schema
    // Here we assume tables: projects (budget), incomes (amount), expenses (amount), invoices (status)
    const [{ data: budgets }, { data: incomes }, { data: expenses }, { data: invoices }] = await Promise.all([
      supabase.from('projects').select('budget'),
      supabase.from('income').select('amount'),
      supabase.from('expenses').select('amount'),
      supabase.from('invoices').select('id'),
    ]);

    const totalBudget = budgets?.reduce((s: number, p: any) => s + (p.budget || 0), 0) || 0;
    const totalIncome = incomes?.reduce((s: number, p: any) => s + (p.amount || 0), 0) || 0;
    const totalExpenses = expenses?.reduce((s: number, p: any) => s + (p.amount || 0), 0) || 0;
    const profitLoss = totalIncome - totalExpenses;
    const pendingReceivables = 0; // placeholder — compute based on invoices status
    const pendingPayables = 0;
    const totalInvoices = invoices?.length || 0;
    setAgg({
      total_budget: totalBudget,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      profit_loss: profitLoss,
      pending_receivables: pendingReceivables,
      pending_payables: pendingPayables,
      total_invoices: totalInvoices,
    });
  }

  async function fetchMonthly() {
    // Simple monthly grouping for last 6 months using created_at fields
    const { data: incomeRows } = await supabase.rpc('monthly_income_expenses', { /* rpc params if exists */}).catch(() => ({ data: null }));
    // If you don't have the RPC, just build a placeholder
    const example = [
      { month: 'Jan', income: 1200, expenses: 800 },
      { month: 'Feb', income: 1500, expenses: 1100 },
      { month: 'Mar', income: 900, expenses: 700 },
      { month: 'Apr', income: 2000, expenses: 1600 },
      { month: 'May', income: 1800, expenses: 900 },
      { month: 'Jun', income: 2200, expenses: 1200 },
    ];
    setMonthly(example);
  }

  async function fetchRecent() {
    // combine income and expenses
    const [{ data: inc }, { data: exp }] = await Promise.all([
      supabase.from('income').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('expenses').select('*').order('created_at', { ascending: false }).limit(10),
    ]);
    const combined = [
      ...(inc || []).map((i: any) => ({ ...i, type: 'income' })),
      ...(exp || []).map((e: any) => ({ ...e, type: 'expense' })),
    ].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
    setRecent(combined);
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="text-sm text-black/70">Total Budget</div>
          <div className="text-2xl font-semibold">{agg ? `$${agg.total_budget.toLocaleString()}` : '—'}</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="text-sm text-black/70">Total Income</div>
          <div className="text-2xl font-semibold">{agg ? `$${agg.total_income.toLocaleString()}` : '—'}</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="text-sm text-black/70">Total Expenses</div>
          <div className="text-2xl font-semibold">{agg ? `$${agg.total_expenses.toLocaleString()}` : '—'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-black/70 mb-2">Income vs Expenses</div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#16a34a" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm text-black/70 mb-2">Recent Transactions</div>

          <div className="space-y-3">
            {recent.map((r) => (
              <div key={r.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="font-medium">{r.description || r.note || (r.type === 'income' ? 'Income' : 'Expense')}</div>
                  <div className="text-sm text-black/60">{new Date(r.created_at).toLocaleDateString()}</div>
                </div>
                <div className={`${r.type === 'income' ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                  {r.amount ? `$${r.amount.toFixed(2)}` : '$0.00'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
