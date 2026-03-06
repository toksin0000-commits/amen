'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

type ReportedWish = {
  id: string;
  text: string;
  created_at: string;
  reports: number;
  is_hidden: boolean;
  language: string;
  ip_address: string;
};

export default function PriestReportsPage() {
  const [reports, setReports] = useState<ReportedWish[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/priest/login');
        return;
      }

      loadReportedWishes();
      subscribeRealtime();
    }

    checkAuth();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadReportedWishes();
    }, 5000); // every 5 seconds

    return () => clearInterval(interval);
  }, []);

  async function loadReportedWishes() {
    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .gt('reports', 0)
      .order('reports', { ascending: false });

    if (!error) setReports(data || []);
    setLoading(false);
  }

  function subscribeRealtime() {
    const channel = supabase
      .channel('wishes-reports')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishes'
        },
        (payload) => {
          const newWish = payload.new as ReportedWish;
          const oldWish = payload.old as ReportedWish;

          // INSERT → add only if reports > 0
          if (payload.eventType === 'INSERT') {
            if (newWish.reports > 0) {
              setReports(prev => [newWish, ...prev]);
            }
          }

          // UPDATE → update if reports > 0, remove if reports drop to 0
          if (payload.eventType === 'UPDATE') {
            if (newWish.reports > 0) {
              setReports(prev =>
                prev.map(item => item.id === newWish.id ? newWish : item)
              );
            } else {
              setReports(prev => prev.filter(item => item.id !== newWish.id));
            }
          }

          // DELETE → remove
          if (payload.eventType === 'DELETE') {
            setReports(prev => prev.filter(item => item.id !== oldWish.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function hideWish(id: string) {
    await supabase
      .from('wishes')
      .update({ is_hidden: true })
      .eq('id', id);

    setReports(prev => prev.filter(wish => wish.id !== id));
  }

  async function deleteWish(id: string) {
    if (!confirm('Really delete this wish?')) return;

    await supabase
      .from('wishes')
      .delete()
      .eq('id', id);

    setReports(prev => prev.filter(wish => wish.id !== id));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/priest/login');
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* CLEAN HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🚩 Reported Wishes</h1>

          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800"
          >
            Log out
          </button>
        </div>

        {reports.length === 0 ? (
          <p className="text-gray-500">No reported wishes.</p>
        ) : (
          reports.map(wish => (
            <div key={wish.id} className="bg-white p-4 mb-4 rounded shadow">
              <p className="wrap-break-word">{wish.text}</p>
              <p className="text-sm text-gray-500 mt-1">
                Reported: {wish.reports}×
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => hideWish(wish.id)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Hide
                </button>
                <button
                  onClick={() => deleteWish(wish.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
