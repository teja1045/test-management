import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'admin' | 'tester'>('tester');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(username, email, password, role);
      }
      navigate('/dashboard');
    } catch {
      setError('Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form className="bg-white p-6 rounded shadow w-full max-w-md space-y-3" onSubmit={onSubmit}>
        <h1 className="text-2xl font-semibold">{mode === 'login' ? 'Login' : 'Register'}</h1>
        {mode === 'register' && (
          <input className="w-full border p-2 rounded" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        )}
        <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="w-full border p-2 rounded" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {mode === 'register' && (
          <select className="w-full border p-2 rounded" value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'tester')}>
            <option value="tester">Tester</option>
            <option value="admin">Admin</option>
          </select>
        )}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-blue-600 text-white p-2 rounded" type="submit">
          {mode === 'login' ? 'Login' : 'Create account'}
        </button>
        <button type="button" className="text-sm underline" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account?' : 'Have an account? Login'}
        </button>
      </form>
    </div>
  );
}
