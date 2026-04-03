'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userChangePassword, isUserLoggedIn } from '@/lib/api';

export default function CambiarContrasena() {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoggedIn()) router.replace('/login');
  }, []);

  const strength = (p) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)           s++;
    if (p.length >= 12)          s++;
    if (/[A-Z]/.test(p))         s++;
    if (/[0-9]/.test(p))         s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const score = strength(newPass);
  const strengthLabel = ['', 'Muy débil', 'Débil', 'Aceptable', 'Buena', 'Excelente'][score];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][score];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPass !== confirm)  { setError('Las contraseñas no coinciden'); return; }
    if (newPass.length < 8)   { setError('Mínimo 8 caracteres'); return; }
    if (newPass === current)  { setError('La nueva contraseña debe ser distinta'); return; }

    setLoading(true);
    setError('');
    try {
      await userChangePassword(current, newPass);
      router.push('/dashboard');
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
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
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
            <span className="text-amber-500 text-lg mt-0.5">🔒</span>
            <div>
              <div className="font-semibold text-amber-800 text-sm">Cambia tu contraseña temporal</div>
              <div className="text-amber-700 text-xs mt-0.5">
                Por seguridad debes establecer una contraseña personal antes de continuar.
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Contraseña temporal (la que te han dado)
              </label>
              <input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                placeholder="Contraseña recibida"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                required
                placeholder="Mínimo 8 caracteres"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
              {newPass && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= score ? strengthColor : 'bg-slate-100'}`} />
                    ))}
                  </div>
                  <div className={`text-xs font-medium ${
                    score <= 1 ? 'text-red-500' : score <= 2 ? 'text-orange-500' :
                    score <= 3 ? 'text-yellow-600' : score <= 4 ? 'text-blue-600' : 'text-green-600'
                  }`}>{strengthLabel}</div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirmar nueva contraseña
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Repite la contraseña"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 ${
                  confirm && confirm !== newPass ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || (!!confirm && confirm !== newPass)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
            >
              {loading ? 'Guardando...' : 'Establecer nueva contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
