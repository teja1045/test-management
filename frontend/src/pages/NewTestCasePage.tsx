import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function NewTestCasePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');

  const save = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/testcases', { title, description, status });
    navigate('/testcases');
  };

  return (
    <form onSubmit={save} className="bg-white rounded shadow p-4 max-w-xl space-y-3">
      <h1 className="text-xl font-semibold">Create Test Case</h1>
      <input className="w-full border p-2 rounded" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
      <textarea className="w-full border p-2 rounded" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
      <select className="w-full border p-2 rounded" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="active">active</option>
        <option value="draft">draft</option>
        <option value="deprecated">deprecated</option>
      </select>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Save</button>
    </form>
  );
}
