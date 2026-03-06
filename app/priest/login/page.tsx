'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function PriestLoginPage() {
  const [code1, setCode1] = useState('');
  const [code2, setCode2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🔑 admin definitions
  const ADMINS: Record<string, string> = {
    "qwe-123": "toksin0000@gmail.com",
    "xyz-777": "druhyadmin@gmail.com"
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const key = `${code1}-${code2}`;
    const email = ADMINS[key];

    if (!email) {
      setError("Invalid login credentials.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: code2 // or a different password if you want to separate it
      });

      if (error) throw error;

      const { data: priest } = await supabase
        .from('priests')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (!priest) {
        await supabase.auth.signOut();
        throw new Error('You do not have permission.');
      }

      router.push('/priest/reports');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">👨‍💼 Priest Console</h1>

        <form onSubmit={handleLogin} className="space-y-4">

          {/* CODE 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code (3 letters)
            </label>
            <input
              type="text"
              value={code1}
              onChange={(e) => setCode1(e.target.value)}
              maxLength={3}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* CODE 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code (3 numbers)
            </label>
            <input
              type="text"
              value={code2}
              onChange={(e) => setCode2(e.target.value)}
              maxLength={3}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-[#d9b26c] text-white rounded-lg hover:bg-[#c9a25c] transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
