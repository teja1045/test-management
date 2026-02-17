import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-slate-900 text-white p-4 flex gap-4 items-center">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/testcases">Test Cases</Link>
        <Link to="/testruns">Test Runs</Link>
        <span className="ml-auto text-sm">{user?.username} ({user?.role})</span>
        <button className="bg-red-500 px-3 py-1 rounded" onClick={logout}>Logout</button>
      </nav>
      <main className="max-w-6xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
