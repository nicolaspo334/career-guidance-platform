'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'mindpath2024';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (username === ADMIN_USER && password === ADMIN_PASS) {
        sessionStorage.setItem('mindpath_admin', 'true');
        router.push('/admin/dashboard');
      } else {
        setError('Usuario o contraseña incorrectos.');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-xl text-white">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            MindPath
          </Link>
          <p className="text-slate-400 text-sm mt-2">Panel de administración</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h1 className="text-xl font-bold text-white mb-6">Acceso de administrador</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="admin"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
            >
              {loading ? 'Accediendo...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-sm mt-6">
          <Link href="/" className="hover:text-slate-400 transition">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
