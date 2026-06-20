'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@lib/supabase/client';

const items = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Projects', href: '/projects' },
  { label: 'Income', href: '/income' },
  { label: 'Expenses', href: '/expenses' },
  { label: 'Dues', href: '/dues' },
  { label: 'Invoices', href: '/invoices' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <aside className="w-64 bg-white border-r border-black/5 min-h-screen p-4">
      <div className="mb-8">
        <h3 className="text-xl font-semibold">Finetech</h3>
      </div>

      <nav className="space-y-1">
        {items.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md ${active ? 'bg-black/5 font-semibold' : 'text-black/70'}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8">
        <button onClick={signOut} className="w-full text-left text-sm text-red-600">
          Sign out
        </button>
      </div>
    </aside>
  );
}
