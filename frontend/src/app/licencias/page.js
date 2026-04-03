'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { centerLogin } from '@/lib/api';

export default function LicenciasLogin() {
  const [licenseCode, setLicenseCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await centerLogin(licenseCode);
      router.push('/licencias/dashboard');
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
          <p className="text-slate-400 text-sm mt-2">Portal de centros educativos</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Acceso del centro</h1>
          <p className="text-slate-500 text-sm mb-6">
            Introduce el código de licencia de tu centro para gestionar los alumnos.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Código de licencia
              </label>
              <input
                type="text"
                value={licenseCode}
                onChange={(e) => setLicenseCode(e.target.value.toUpperCase())}
                required
                placeholder="MIND-XXXX-XXXX"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono text-center text-lg tracking-widest"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
            >
              {loading ? 'Accediendo...' : 'Acceder al panel'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          <Link href="/" className="hover:text-slate-300 transition">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
