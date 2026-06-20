'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase/client';
import Button from '../../../components/Button';
import Input from '../../../components/Input';

type Project = { id: string; name: string; budget: number; status?: string };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [budget, setBudget] = useState<number | ''>('');

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  }

  async function createProject() {
    if (!name || !budget) return;
    setCreating(true);
    const { data, error } = await supabase.from('projects').insert([{ name, budget: Number(budget) }]).select().single();
    if (!error && data) {
      setProjects((p) => [data, ...p]);
      setName('');
      setBudget('');
    }
    setCreating(false);
  }

  async function deleteProject(id: string) {
    await supabase.from('projects').delete().eq('id', id);
    setProjects((p) => p.filter((x) => x.id !== id));
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Projects</h1>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium mb-2">Create project</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Budget" value={budget as any} onChange={(e) => setBudget(Number(e.target.value) || '')} type="number" />
          <div className="flex items-end">
            <Button onClick={createProject} disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? <div>Loading...</div> : projects.map((p) => (
          <div key={p.id} className="p-4 bg-white rounded-md flex justify-between items-center">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-black/60">Budget: ${p.budget?.toLocaleString()}</div>
            </div>
            <div className="space-x-2">
              <Button onClick={() => alert('Edit flow — implement modal or inline edit')}>Edit</Button>
              <button className="text-red-600" onClick={() => deleteProject(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
