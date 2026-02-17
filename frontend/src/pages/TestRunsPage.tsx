import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { TestRun } from '../types';

export default function TestRunsPage() {
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [name, setName] = useState('');

  const loadRuns = async () => {
    const { data } = await api.get('/testruns');
    setRuns(data);
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const createRun = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/testruns', { name });
    setName('');
    await loadRuns();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Test Runs</h1>
      <form onSubmit={createRun} className="flex gap-2">
        <input className="border p-2 rounded flex-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Run name" required />
        <button className="bg-blue-600 text-white px-4 rounded" type="submit">Create</button>
      </form>
      {runs.map((run) => (
        <Link to={`/testruns/${run.id}`} key={run.id} className="block bg-white rounded shadow p-4 hover:bg-slate-100">
          <p className="font-semibold">{run.name}</p>
          <p className="text-sm text-slate-600">Results: {run._count?.results || 0}</p>
        </Link>
      ))}
    </div>
  );
}
