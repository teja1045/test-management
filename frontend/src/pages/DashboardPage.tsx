import { useEffect, useState } from 'react';
import api from '../api/client';

export default function DashboardPage() {
  const [summary, setSummary] = useState<{ testCases: number; testRuns: number; resultsByStatus: Record<string, number> } | null>(null);

  useEffect(() => {
    api.get('/dashboard/summary').then((res) => setSummary(res.data));
  }, []);

  if (!summary) return <p>Loading dashboard...</p>;

  const cards = [
    ['Test Cases', summary.testCases],
    ['Test Runs', summary.testRuns],
    ['Passed', summary.resultsByStatus.passed],
    ['Failed', summary.resultsByStatus.failed],
    ['Blocked', summary.resultsByStatus.blocked]
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map(([label, value]) => (
          <div key={label} className="bg-white p-4 rounded shadow">
            <p className="text-slate-600 text-sm">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
