'use client';

import { useEffect, useState } from 'react';
import { supabase } from '.../supabase/client';
import { useRouter } from 'next/navigation';

export function useRequireAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = supabase.auth.getSession().then((res) => {
      // If no session, redirect to /login
      if (!res?.data?.session) {
        router.push('/login');
      }
      setLoading(false);
    }).catch(() => {
      router.push('/login');
      setLoading(false);
    });

    // listen to auth changes if needed
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push('/login');
    });

    return () => sub?.subscription?.unsubscribe?.();
  }, [router]);

  return { loading };
}
