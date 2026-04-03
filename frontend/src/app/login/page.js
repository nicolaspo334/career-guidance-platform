'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Demo credentials — will be replaced by real auth
    setTimeout(() => {
      if (email === 'demo@mindpath.es' && password === 'demo123') {
        sessionStorage.setItem(
          'mindpath_user',
          JSON.stringify({ name: 'Alumno Demo', email })
        );
        router.push('/dashboard');
      } else {
        setError(
          'Email o contraseña incorrectos. Usa las credenciales que te ha proporcionado tu centro.'
        );
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <span className="text-white font-bold text-2xl">MindPath</span>
          </Link>
          <p className="text-slate-400 text-sm mt-2">Inicia sesión para continuar</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-slate-900 mb-6">Bienvenido</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.es"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
            >
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-6 p-3 bg-slate-50 rounded-lg text-xs text-slate-500 text-center border border-slate-100">
            <strong>Demo:</strong> demo@mindpath.es / demo123
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          <Link href="/" className="hover:text-slate-300 transition">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
