'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getCenterInfo, getCenterUsers, createCenterUser,
  deactivateUser, reactivateUser, centerLogout,
  isCenterLoggedIn, getStoredCenterName,
} from '@/lib/api';

export default function LicenciasDashboard() {
  const [license, setLicense]       = useState(null);
  const [users, setUsers]           = useState([]);
  const [tab, setTab]               = useState('usuarios');
  const [newUser, setNewUser]       = useState({ name: '', email: '' });
  const [createdUser, setCreatedUser] = useState(null);
  const [copiedValue, setCopiedValue] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      const [infoData, usersData] = await Promise.all([getCenterInfo(), getCenterUsers()]);
      setLicense(infoData.license);
      setUsers(usersData.users);
    } catch {
      router.replace('/licencias');
    }
  }, [router]);

  useEffect(() => {
    if (!isCenterLoggedIn()) { router.replace('/licencias'); return; }
    load();
  }, [load, router]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await createCenterUser(newUser.name, newUser.email);
      setCreatedUser(data);
      setNewUser({ name: '', email: '' });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (userId) => {
    if (!confirm('¿Eliminar este alumno? Se liberará su plaza en la licencia.')) return;
    try {
      await deactivateUser(userId);
      await load();
    } catch (e) { setError(e.message); }
  };

  const handleReactivate = async (userId) => {
    try {
      await reactivateUser(userId);
      await load();
    } catch (e) { setError(e.message); }
  };

  const copy = (val) => {
    navigator.clipboard.writeText(val);
    setCopiedValue(val);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  const logout = () => { centerLogout(); router.push('/licencias'); };

  if (!license) return null;

  const available = license.max_users - license.used_users;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            MindPath
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-slate-600 text-sm hidden sm:block">{license.center_name}</span>
            <button onClick={logout} className="text-slate-400 hover:text-slate-600 text-sm transition cursor-pointer">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex justify-between">
            {error}
            <button onClick={() => setError('')} className="cursor-pointer">✕</button>
          </div>
        )}

        {/* License info */}
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <div className="sm:col-span-2 bg-indigo-600 rounded-xl p-5 text-white">
            <div className="text-xs text-indigo-300 font-medium mb-1">Código de licencia</div>
            <code className="text-xl font-bold tracking-widest">{license.code}</code>
            {license.revoked === 1 && (
              <span className="ml-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">Revocada</span>
            )}
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">{license.used_users}</div>
            <div className="text-slate-500 text-sm mt-1">Alumnos activos</div>
          </div>
          <div className={`rounded-xl p-5 border ${available > 0 ? 'bg-white border-slate-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className={`text-2xl font-bold ${available > 0 ? 'text-green-600' : 'text-amber-600'}`}>
              {available}
            </div>
            <div className="text-slate-500 text-sm mt-1">Plazas disponibles</div>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 mb-8">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Uso de la licencia</span>
            <span>{license.used_users} / {license.max_users} alumnos</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                license.used_users / license.max_users > 0.9 ? 'bg-red-500' :
                license.used_users / license.max_users > 0.7 ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, (license.used_users / license.max_users) * 100)}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-200 rounded-xl p-1 mb-6 w-fit">
          {[
            { key: 'usuarios', label: `Alumnos (${users.filter(u => u.active).length})` },
            { key: 'anadir', label: 'Añadir alumno' },
          ].map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key); setCreatedUser(null); }}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── ALUMNOS ── */}
        {tab === 'usuarios' && (
          <div className="space-y-3">
            {users.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <div className="text-4xl mb-3">👩‍🎓</div>
                <p className="text-slate-500">No hay alumnos registrados aún</p>
                <button onClick={() => setTab('anadir')}
                  className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium cursor-pointer">
                  Añadir el primer alumno →
                </button>
              </div>
            ) : (
              <>
                {/* Active */}
                {users.filter(u => u.active).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-2 px-1">Activos</h3>
                    {users.filter(u => u.active).map(u => (
                      <div key={u.id} className="bg-white rounded-xl px-5 py-4 border border-slate-200 flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-slate-900">{u.name}</div>
                          <div className="text-slate-500 text-sm">{u.email}</div>
                          <div className="text-slate-400 text-xs mt-0.5">
                            Registrado {new Date(u.created_at).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                        <button onClick={() => handleDeactivate(u.id)}
                          className="text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition cursor-pointer">
                          Quitar plaza
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inactive */}
                {users.filter(u => !u.active).length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-slate-400 mb-2 px-1">Desactivados</h3>
                    {users.filter(u => !u.active).map(u => (
                      <div key={u.id} className="bg-slate-50 rounded-xl px-5 py-4 border border-slate-100 flex items-center justify-between mb-2 opacity-60">
                        <div>
                          <div className="font-medium text-slate-600">{u.name}</div>
                          <div className="text-slate-400 text-sm">{u.email}</div>
                        </div>
                        <button onClick={() => handleReactivate(u.id)}
                          className="text-xs text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition cursor-pointer">
                          Reactivar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── AÑADIR ── */}
        {tab === 'anadir' && (
          <div className="max-w-md">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-1">Añadir alumno manualmente</h2>
              <p className="text-slate-500 text-sm mb-5">
                Se generará una contraseña segura automáticamente. Compártela con el alumno.
              </p>

              {available <= 0 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-lg mb-4">
                  No quedan plazas disponibles en tu licencia.
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo</label>
                  <input type="text" value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required placeholder="Nombre Apellido"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input type="email" value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required placeholder="alumno@email.es"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" />
                </div>
                <button type="submit" disabled={loading || available <= 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl transition cursor-pointer">
                  {loading ? 'Creando...' : 'Crear alumno y generar contraseña'}
                </button>
              </form>
            </div>

            {createdUser && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                  <span>✓</span> Alumno creado — copia las credenciales ahora
                </div>
                <p className="text-xs text-green-600 mb-3">
                  La contraseña solo se muestra una vez. Envíasela al alumno por un canal seguro.
                </p>
                <div className="space-y-2">
                  {[
                    { label: 'Email', value: createdUser.email },
                    { label: 'Contraseña', value: createdUser.password },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-green-200">
                      <div>
                        <div className="text-xs text-slate-400">{label}</div>
                        <code className="text-slate-800 text-sm font-bold">{value}</code>
                      </div>
                      <button onClick={() => copy(value)}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded cursor-pointer ml-2">
                        {copiedValue === value ? '¡Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setCreatedUser(null)}
                  className="mt-3 text-xs text-green-600 hover:text-green-800 cursor-pointer">
                  Ya he copiado las credenciales →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
