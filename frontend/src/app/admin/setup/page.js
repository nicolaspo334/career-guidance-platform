'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkSetup, runSetup } from '@/lib/api';

export default function Setup() {
  const [status, setStatus] = useState('loading'); // loading | needed | done
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkSetup()
      .then(({ configured }) => setStatus(configured ? 'done' : 'needed'))
      .catch(() => setStatus('needed'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await runSetup(password);
      router.push('/admin');
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Comprobando...</div>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">✓</div>
          <p className="text-white font-semibold mb-2">El admin ya está configurado</p>
          <Link href="/admin" className="text-indigo-400 hover:text-indigo-300 text-sm">
            Ir al login →
          </Link>
        </div>
      </div>
    );
  }

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
          <p className="text-slate-400 text-sm mt-2">Configuración inicial</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h1 className="text-xl font-bold text-white mb-2">Crear contraseña de admin</h1>
          <p className="text-slate-400 text-sm mb-6">
            Este paso solo se puede hacer una vez. Elige una contraseña segura.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Mínimo 8 caracteres"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Repite la contraseña"
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
              {loading ? 'Configurando...' : 'Crear admin y continuar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
