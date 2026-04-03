'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getRequests,
  approveRequest,
  rejectRequest,
  createUser,
  getUsers,
  adminLogout,
  isAdminLoggedIn,
} from '@/lib/api';

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [mainTab, setMainTab] = useState('solicitudes');
  const [filterTab, setFilterTab] = useState('pending');
  const [approveModal, setApproveModal] = useState(null);
  const [maxUsers, setMaxUsers] = useState('100');
  const [copiedValue, setCopiedValue] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', licenseId: '' });
  const [createdUser, setCreatedUser] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      const [reqData, userData] = await Promise.all([getRequests(), getUsers()]);
      setRequests(reqData.requests);
      setUsers(userData.users);
    } catch (e) {
      if (e.message === 'No autorizado') {
        router.replace('/admin');
      }
    }
  }, [router]);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.replace('/admin');
      return;
    }
    loadData();
  }, [loadData, router]);

  const handleApprove = async () => {
    setLoadingAction(true);
    try {
      await approveRequest(approveModal, parseInt(maxUsers));
      setApproveModal(null);
      setMaxUsers('100');
      await loadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReject = async (centerId) => {
    if (!confirm('¿Seguro que quieres rechazar esta solicitud?')) return;
    try {
      await rejectRequest(centerId);
      await loadData();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    setError('');
    try {
      const data = await createUser(newUser.name, newUser.email, newUser.licenseId);
      setCreatedUser(data);
      setNewUser({ name: '', email: '', licenseId: '' });
      await loadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const copyValue = (val) => {
    navigator.clipboard.writeText(val);
    setCopiedValue(val);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  const logout = async () => {
    await adminLogout();
    router.push('/admin');
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const approvedLicenses = requests.filter((r) => r.status === 'approved' && r.license_id);

  const filtered =
    filterTab === 'all' ? requests : requests.filter((r) => r.status === filterTab);

  const CENTER_LABELS = {
    ies: 'IES',
    colegio_publico: 'Colegio público',
    colegio_concertado: 'Colegio concertado',
    colegio_privado: 'Colegio privado',
    fp: 'FP',
    universidad: 'Universidad',
    otro: 'Otro',
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-white font-bold">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-md flex items-center justify-center text-xs">
                M
              </div>
              MindPath
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 text-sm">Administración</span>
          </div>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-white text-sm transition cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex justify-between">
            {error}
            <button onClick={() => setError('')} className="cursor-pointer">✕</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">{requests.length}</div>
            <div className="text-slate-500 text-sm mt-1">Total solicitudes</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            <div className="text-slate-500 text-sm mt-1">Pendientes de revisión</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <div className="text-slate-500 text-sm mt-1">Licencias activas</div>
          </div>
        </div>

        {/* Main tabs */}
        <div className="flex gap-1 bg-slate-200 rounded-xl p-1 mb-6 w-fit">
          {[
            { key: 'solicitudes', label: 'Solicitudes' },
            { key: 'usuarios', label: `Usuarios (${users.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setMainTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                mainTab === t.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── SOLICITUDES ── */}
        {mainTab === 'solicitudes' && (
          <>
            <div className="flex gap-1 bg-slate-200/60 rounded-xl p-1 mb-5 w-fit flex-wrap">
              {[
                { key: 'pending', label: pendingCount > 0 ? `Pendientes (${pendingCount})` : 'Pendientes' },
                { key: 'approved', label: 'Aprobadas' },
                { key: 'rejected', label: 'Rechazadas' },
                { key: 'all', label: 'Todas' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setFilterTab(t.key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                    filterTab === t.key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-slate-500">No hay solicitudes en esta categoría</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((req) => (
                  <div key={req.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h3 className="font-semibold text-slate-900 text-lg">{req.name}</h3>
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              req.status === 'pending'
                                ? 'bg-amber-100 text-amber-700'
                                : req.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {req.status === 'pending' ? 'Pendiente' : req.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                          </span>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-y-2 gap-x-4 text-sm text-slate-600 mb-3">
                          <div><span className="text-slate-400">Tipo: </span>{CENTER_LABELS[req.type] || req.type}</div>
                          <div><span className="text-slate-400">Contacto: </span>{req.contact_name}</div>
                          <div>
                            <span className="text-slate-400">Email: </span>
                            <a href={`mailto:${req.email}`} className="text-indigo-600 hover:underline">{req.email}</a>
                          </div>
                          <div><span className="text-slate-400">Alumnos: </span>{req.students}</div>
                        </div>

                        {req.phone && (
                          <div className="text-sm text-slate-600 mb-2">
                            <span className="text-slate-400">Teléfono: </span>{req.phone}
                          </div>
                        )}

                        {req.message && (
                          <p className="text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2 mb-3 italic">
                            &ldquo;{req.message}&rdquo;
                          </p>
                        )}

                        <div className="text-xs text-slate-400">
                          Solicitado el{' '}
                          {new Date(req.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </div>

                        {req.status === 'approved' && req.license_code && (
                          <div className="mt-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex-wrap">
                            <div>
                              <div className="text-xs text-green-600 font-medium mb-0.5">Código de licencia</div>
                              <code className="text-green-800 font-mono font-bold text-sm">{req.license_code}</code>
                            </div>
                            <span className="text-slate-300">·</span>
                            <div className="text-sm text-green-600">Máx. {req.max_users} usuarios</div>
                            <button
                              onClick={() => copyValue(req.license_code)}
                              className="ml-auto text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              {copiedValue === req.license_code ? '¡Copiado!' : 'Copiar'}
                            </button>
                          </div>
                        )}
                      </div>

                      {req.status === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => { setApproveModal(req.id); setMaxUsers(req.students || '100'); }}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── USUARIOS ── */}
        {mainTab === 'usuarios' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Crear usuario</h2>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                {approvedLicenses.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-4">
                    No hay licencias aprobadas aún.
                  </p>
                ) : (
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo</label>
                      <input
                        type="text"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        required
                        placeholder="Nombre Apellido"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        required
                        placeholder="alumno@instituto.es"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Licencia del centro</label>
                      <select
                        value={newUser.licenseId}
                        onChange={(e) => setNewUser({ ...newUser, licenseId: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
                      >
                        <option value="">Seleccionar licencia...</option>
                        {approvedLicenses.map((l) => (
                          <option key={l.license_id} value={l.license_id}>
                            {l.name} — {l.license_code}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 text-sm text-indigo-700">
                      La contraseña se genera automáticamente y se muestra una sola vez.
                    </div>

                    <button
                      type="submit"
                      disabled={loadingAction}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
                    >
                      {loadingAction ? 'Creando...' : 'Crear usuario y generar contraseña'}
                    </button>
                  </form>
                )}
              </div>

              {createdUser && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                    <span>✓</span> Usuario creado — copia las credenciales ahora
                  </div>
                  <p className="text-xs text-green-600 mb-3">
                    La contraseña solo se muestra una vez. Después solo existe el hash en la base de datos.
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: 'Email', value: createdUser.email },
                      { label: 'Contraseña generada', value: createdUser.password },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-green-200">
                        <div>
                          <div className="text-xs text-slate-400">{label}</div>
                          <code className="text-slate-800 text-sm font-bold">{value}</code>
                        </div>
                        <button
                          onClick={() => copyValue(value)}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded cursor-pointer ml-2"
                        >
                          {copiedValue === value ? '¡Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setCreatedUser(null)}
                    className="mt-3 text-xs text-green-600 hover:text-green-800 cursor-pointer"
                  >
                    Ya he copiado las credenciales →
                  </button>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Usuarios creados ({users.length})
              </h2>
              {users.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                  <div className="text-4xl mb-3">👤</div>
                  <p className="text-slate-500 text-sm">No hay usuarios creados aún</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((u) => (
                    <div key={u.id} className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium text-slate-900 text-sm">{u.name}</div>
                        <div className="text-slate-500 text-xs">{u.email}</div>
                        <div className="text-xs text-indigo-600 mt-0.5">{u.center_name}</div>
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(u.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Approve modal */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Aprobar solicitud</h2>
            <p className="text-slate-500 text-sm mb-6">
              Se generará un código de licencia único en el servidor.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Número máximo de usuarios
              </label>
              <input
                type="number"
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
                min="1"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setApproveModal(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl transition font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleApprove}
                disabled={loadingAction}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2.5 rounded-xl transition font-medium cursor-pointer"
              >
                {loadingAction ? 'Aprobando...' : 'Aprobar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
