import Link from 'next/link';

export default function PriestDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">👨‍💼 Farářská konzole</h1>
        <div className="grid gap-4">
          <Link href="/priest/reports" className="block p-4 bg-white rounded shadow">
            🚩 Nahlášená přání
          </Link>
        </div>
      </div>
    </div>
  );
}