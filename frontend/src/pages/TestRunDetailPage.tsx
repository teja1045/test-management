import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import { TestCase, TestResult } from '../types';

export default function TestRunDetailPage() {
  const { id } = useParams();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testCaseId, setTestCaseId] = useState<number>(0);
  const [status, setStatus] = useState<'passed' | 'failed' | 'blocked'>('passed');

  const load = async () => {
    const [tcRes, resultRes] = await Promise.all([
      api.get('/testcases'),
      api.get(`/testruns/${id}/results`)
    ]);
    setTestCases(tcRes.data);
    setResults(resultRes.data);
    if (tcRes.data.length && !testCaseId) setTestCaseId(tcRes.data[0].id);
  };

  useEffect(() => {
    load();
  }, [id]);

  const submitResult = async (e: FormEvent) => {
    e.preventDefault();
    await api.post(`/testruns/${id}/results`, { testCaseId: Number(testCaseId), status });
    await load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Test Run #{id}</h1>
      <form onSubmit={submitResult} className="bg-white rounded shadow p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-sm">Test Case</label>
          <select className="block border p-2 rounded" value={testCaseId} onChange={(e) => setTestCaseId(Number(e.target.value))}>
            {testCases.map((tc) => <option key={tc.id} value={tc.id}>{tc.title}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm">Status</label>
          <select className="block border p-2 rounded" value={status} onChange={(e) => setStatus(e.target.value as 'passed' | 'failed' | 'blocked')}>
            <option value="passed">passed</option>
            <option value="failed">failed</option>
            <option value="blocked">blocked</option>
          </select>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Add Result</button>
      </form>

      <div className="space-y-2">
        {results.map((r) => (
          <div key={r.id} className="bg-white rounded shadow p-3">
            <p className="font-semibold">{r.testCase.title}</p>
            <p className="text-sm">Status: {r.status} · By: {r.user.username}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
