import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { TestCase } from '../types';

export default function TestCasesPage() {
  const [items, setItems] = useState<TestCase[]>([]);
  const [status, setStatus] = useState('');

  const fetchItems = async () => {
    const { data } = await api.get('/testcases', { params: status ? { status } : {} });
    setItems(data);
  };

  useEffect(() => {
    fetchItems();
  }, [status]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Test Cases</h1>
        <Link className="bg-blue-600 text-white px-3 py-1 rounded" to="/testcases/new">New Test Case</Link>
      </div>
      <select className="border p-2 rounded" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All Statuses</option>
        <option value="active">active</option>
        <option value="draft">draft</option>
        <option value="deprecated">deprecated</option>
      </select>
      <div className="grid gap-3">
        {items.map((tc) => (
          <div key={tc.id} className="bg-white rounded shadow p-4">
            <div className="flex justify-between">
              <h2 className="font-semibold">{tc.title}</h2>
              <span className="text-sm text-slate-500">{tc.status}</span>
            </div>
            <p className="text-slate-700">{tc.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
