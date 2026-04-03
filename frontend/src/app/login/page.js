'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userLogin, userRegister } from '@/lib/api';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirm: '', licenseCode: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await userLogin(loginForm.email, loginForm.password);
      router.push('/dashboard');
    } catch (e) {
      setError(e.message === 'Tu licencia ha sido revocada. Contacta con tu centro.'
        ? e.message
        : 'Email o contraseña incorrectos.');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (registerForm.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await userRegister(registerForm.name, registerForm.email, registerForm.password, registerForm.licenseCode);
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

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {[
              { key: 'login', label: 'Ya tengo cuenta' },
              { key: 'register', label: 'Primera vez' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setError(''); }}
                className={`flex-1 py-3.5 text-sm font-medium transition cursor-pointer ${
                  tab === t.key
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Login */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                    placeholder="tu@email.es"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
                {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition cursor-pointer">
                  {loading ? 'Entrando...' : 'Iniciar sesión'}
                </button>
              </form>
            )}

            {/* Register */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo</label>
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    required
                    placeholder="Nombre Apellido"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                    placeholder="tu@email.es"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={registerForm.confirm}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirm: e.target.value })}
                    required
                    placeholder="Repite la contraseña"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Código de licencia</label>
                  <input
                    type="text"
                    value={registerForm.licenseCode}
                    onChange={(e) => setRegisterForm({ ...registerForm, licenseCode: e.target.value.toUpperCase() })}
                    required
                    placeholder="MIND-XXXX-XXXX"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono"
                  />
                  <p className="text-xs text-slate-400 mt-1">Proporcionado por tu centro educativo</p>
                </div>
                {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition cursor-pointer">
                  {loading ? 'Creando cuenta...' : 'Crear cuenta y entrar'}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          <Link href="/" className="hover:text-slate-300 transition">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
