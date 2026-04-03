'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getRequests, approveRequest, rejectRequest,
  getUsers, createAdminUser,
  getLicenses, revokeLicense, updateMaxUsers, deleteLicense,
  adminLogout, isAdminLoggedIn,
} from '@/lib/api';

const CENTER_LABELS = {
  ies: 'IES', colegio_publico: 'Colegio público', colegio_concertado: 'Colegio concertado',
  colegio_privado: 'Colegio privado', fp: 'FP', universidad: 'Universidad', otro: 'Otro',
};

export default function AdminDashboard() {
  const [requests, setRequests]       = useState([]);
  const [users, setUsers]             = useState([]);
  const [licenses, setLicenses]       = useState([]);
  const [mainTab, setMainTab]         = useState('solicitudes');
  const [filterTab, setFilterTab]     = useState('pending');
  const [approveModal, setApproveModal] = useState(null);
  const [maxUsersModal, setMaxUsersModal] = useState(null); // { licenseId, current }
  const [newMaxUsers, setNewMaxUsers] = useState('');
  const [approveMaxUsers, setApproveMaxUsers] = useState('100');
  const [copiedValue, setCopiedValue] = useState(null);
  const [newUser, setNewUser]         = useState({ name: '', email: '', licenseId: '' });
  const [createdUser, setCreatedUser] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError]             = useState('');
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      const [reqData, userData, licData] = await Promise.all([
        getRequests(), getUsers(), getLicenses(),
      ]);
      setRequests(reqData.requests);
      setUsers(userData.users);
      setLicenses(licData.licenses);
    } catch (e) {
      if (e.message === 'No autorizado') router.replace('/admin');
    }
  }, [router]);

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.replace('/admin'); return; }
    load();
  }, [load, router]);

  const handleApprove = async () => {
    setLoadingAction(true);
    try {
      await approveRequest(approveModal, parseInt(approveMaxUsers));
      setApproveModal(null);
      await load();
    } catch (e) { setError(e.message); }
    finally { setLoadingAction(false); }
  };

  const handleReject = async (centerId) => {
    if (!confirm('¿Rechazar esta solicitud?')) return;
    try { await rejectRequest(centerId); await load(); }
    catch (e) { setError(e.message); }
  };

  const handleRevoke = async (licenseId, currentRevoked) => {
    const action = currentRevoked ? 'reactivar' : 'revocar temporalmente';
    if (!confirm(`¿${action} esta licencia?`)) return;
    try { await revokeLicense(licenseId, !currentRevoked); await load(); }
    catch (e) { setError(e.message); }
  };

  const handleDelete = async (licenseId, centerName) => {
    const confirmed = confirm(
      `⚠️ BORRADO PERMANENTE\n\n¿Eliminar la licencia de "${centerName}"?\n\nSe eliminarán también todos sus usuarios. Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;
    try { await deleteLicense(licenseId); await load(); }
    catch (e) { setError(e.message); }
  };

  const handleUpdateMaxUsers = async () => {
    if (!newMaxUsers || parseInt(newMaxUsers) < 1) { setError('Número inválido'); return; }
    setLoadingAction(true);
    try {
      await updateMaxUsers(maxUsersModal.licenseId, parseInt(newMaxUsers));
      setMaxUsersModal(null);
      await load();
    } catch (e) { setError(e.message); }
    finally { setLoadingAction(false); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    setError('');
    try {
      const data = await createAdminUser(newUser.name, newUser.email, newUser.licenseId);
      setCreatedUser(data);
      setNewUser({ name: '', email: '', licenseId: '' });
      await load();
    } catch (e) { setError(e.message); }
    finally { setLoadingAction(false); }
  };

  const copy = (val) => {
    navigator.clipboard.writeText(val);
    setCopiedValue(val);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  const logout = () => { adminLogout(); router.push('/admin'); };

  const pendingCount  = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const filtered = filterTab === 'all' ? requests : requests.filter(r => r.status === filterTab);
  const approvedLicenses = requests.filter(r => r.status === 'approved' && r.license_id);

  const MAIN_TABS = [
    { key: 'solicitudes', label: pendingCount > 0 ? `Solicitudes (${pendingCount})` : 'Solicitudes' },
    { key: 'licencias',   label: `Licencias (${licenses.length})` },
    { key: 'usuarios',    label: `Usuarios (${users.length})` },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-white font-bold">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-md flex items-center justify-center text-xs">M</div>
              MindPath
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 text-sm">Administración</span>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-white text-sm transition cursor-pointer">
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
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          {[
            { value: requests.length, label: 'Total solicitudes', color: 'text-slate-900' },
            { value: pendingCount,    label: 'Pendientes',        color: 'text-amber-600' },
            { value: approvedCount,   label: 'Licencias activas', color: 'text-green-600' },
            { value: users.length,    label: 'Usuarios totales',  color: 'text-indigo-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-slate-200">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-slate-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Main tabs */}
        <div className="flex gap-1 bg-slate-200 rounded-xl p-1 mb-6 w-fit">
          {MAIN_TABS.map(t => (
            <button key={t.key} onClick={() => setMainTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                mainTab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── SOLICITUDES ── */}
        {mainTab === 'solicitudes' && (
          <>
            <div className="flex gap-1 bg-slate-200/60 rounded-xl p-1 mb-5 w-fit flex-wrap">
              {[
                { key: 'pending',  label: pendingCount > 0 ? `Pendientes (${pendingCount})` : 'Pendientes' },
                { key: 'approved', label: 'Aprobadas' },
                { key: 'rejected', label: 'Rechazadas' },
                { key: 'all',      label: 'Todas' },
              ].map(t => (
                <button key={t.key} onClick={() => setFilterTab(t.key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                    filterTab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}>
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
                {filtered.map(req => (
                  <div key={req.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h3 className="font-semibold text-slate-900 text-lg">{req.name}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            req.status === 'pending'  ? 'bg-amber-100 text-amber-700' :
                            req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        'bg-red-100 text-red-700'
                          }`}>
                            {req.status === 'pending' ? 'Pendiente' : req.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                          </span>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-y-2 gap-x-4 text-sm text-slate-600 mb-3">
                          <div><span className="text-slate-400">Tipo: </span>{CENTER_LABELS[req.type] || req.type}</div>
                          <div><span className="text-slate-400">Contacto: </span>{req.contact_name}</div>
                          <div><span className="text-slate-400">Email: </span>
                            <a href={`mailto:${req.email}`} className="text-indigo-600 hover:underline">{req.email}</a>
                          </div>
                          <div><span className="text-slate-400">Alumnos: </span>{req.students}</div>
                        </div>
                        {req.phone && <div className="text-sm text-slate-600 mb-2"><span className="text-slate-400">Teléfono: </span>{req.phone}</div>}
                        {req.message && <p className="text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2 mb-3 italic">&ldquo;{req.message}&rdquo;</p>}
                        <div className="text-xs text-slate-400">
                          Solicitado el {new Date(req.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        {req.status === 'approved' && req.license_code && (
                          <div className="mt-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex-wrap">
                            <div>
                              <div className="text-xs text-green-600 font-medium mb-0.5">Código de licencia</div>
                              <code className="text-green-800 font-mono font-bold">{req.license_code}</code>
                            </div>
                            <span className="text-slate-300">·</span>
                            <div className="text-sm text-green-600">Máx. {req.max_users} usuarios</div>
                            <button onClick={() => copy(req.license_code)}
                              className="ml-auto text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg transition cursor-pointer">
                              {copiedValue === req.license_code ? '¡Copiado!' : 'Copiar'}
                            </button>
                          </div>
                        )}
                      </div>
                      {req.status === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => { setApproveModal(req.id); setApproveMaxUsers(req.students || '100'); }}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
                            Aprobar
                          </button>
                          <button onClick={() => handleReject(req.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
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

        {/* ── LICENCIAS ── */}
        {mainTab === 'licencias' && (
          <div className="space-y-4">
            {licenses.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
                <div className="text-5xl mb-4">🔑</div>
                <p className="text-slate-500">No hay licencias aún</p>
              </div>
            ) : licenses.map(lic => (
              <div key={lic.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 text-lg">{lic.center_name}</h3>
                      <code className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg text-sm font-mono font-bold">
                        {lic.code}
                      </code>
                      {lic.revoked === 1 && (
                        <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Revocada</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500 mb-3">{lic.center_email}</div>

                    {/* Usage bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            lic.used_users / lic.max_users > 0.9 ? 'bg-red-500' :
                            lic.used_users / lic.max_users > 0.7 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, (lic.used_users / lic.max_users) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-600 whitespace-nowrap">
                        {lic.used_users} / {lic.max_users} usuarios
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-2">
                      Creada el {new Date(lic.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0 flex-wrap">
                    <button
                      onClick={() => { setMaxUsersModal({ licenseId: lic.id, current: lic.max_users }); setNewMaxUsers(String(lic.max_users)); }}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
                      Cambiar plazas
                    </button>
                    <button
                      onClick={() => handleRevoke(lic.id, lic.revoked === 1)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                        lic.revoked === 1
                          ? 'bg-green-50 hover:bg-green-100 text-green-700'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                      }`}>
                      {lic.revoked === 1 ? 'Reactivar' : 'Revocar'}
                    </button>
                    <button
                      onClick={() => handleDelete(lic.id, lic.center_name)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── USUARIOS ── */}
        {mainTab === 'usuarios' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Crear usuario</h2>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                {approvedLicenses.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-4">No hay licencias aprobadas aún.</p>
                ) : (
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
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Licencia del centro</label>
                      <select value={newUser.licenseId}
                        onChange={(e) => setNewUser({ ...newUser, licenseId: e.target.value })}
                        required className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white">
                        <option value="">Seleccionar...</option>
                        {approvedLicenses.map(l => (
                          <option key={l.license_id} value={l.license_id}>
                            {l.name} — {l.license_code}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 text-sm text-indigo-700">
                      La contraseña se genera automáticamente y se muestra una sola vez.
                    </div>
                    <button type="submit" disabled={loadingAction}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition cursor-pointer">
                      {loadingAction ? 'Creando...' : 'Crear usuario'}
                    </button>
                  </form>
                )}
              </div>

              {createdUser && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">✓ Credenciales generadas</div>
                  <p className="text-xs text-green-600 mb-3">La contraseña solo se muestra una vez.</p>
                  <div className="space-y-2">
                    {[{ label: 'Email', value: createdUser.email }, { label: 'Contraseña', value: createdUser.password }].map(({ label, value }) => (
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
                  <button onClick={() => setCreatedUser(null)} className="mt-3 text-xs text-green-600 hover:text-green-800 cursor-pointer">
                    Ya he copiado las credenciales →
                  </button>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Todos los usuarios ({users.length})</h2>
              {users.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                  <div className="text-4xl mb-3">👤</div>
                  <p className="text-slate-500 text-sm">No hay usuarios creados aún</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {users.map(u => (
                    <div key={u.id} className={`rounded-xl px-4 py-3 border flex items-center justify-between gap-3 ${u.active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                      <div>
                        <div className="font-medium text-slate-900 text-sm">{u.name}</div>
                        <div className="text-slate-500 text-xs">{u.email}</div>
                        <div className="text-xs text-indigo-600">{u.center_name}</div>
                      </div>
                      <div className="text-xs text-slate-400 whitespace-nowrap">
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

      {/* ── Modal: Aprobar solicitud ── */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Aprobar solicitud</h2>
            <p className="text-slate-500 text-sm mb-6">Se generará un código de licencia único.</p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Número máximo de usuarios</label>
              <input type="number" value={approveMaxUsers}
                onChange={(e) => setApproveMaxUsers(e.target.value)} min="1"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setApproveModal(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-medium cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleApprove} disabled={loadingAction}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2.5 rounded-xl font-medium cursor-pointer">
                {loadingAction ? 'Aprobando...' : 'Aprobar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Cambiar plazas ── */}
      {maxUsersModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Cambiar número de plazas</h2>
            <p className="text-slate-500 text-sm mb-6">
              Actualmente: <strong>{maxUsersModal.current}</strong> plazas. El cambio es inmediato.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nuevo máximo de usuarios</label>
              <input type="number" value={newMaxUsers}
                onChange={(e) => setNewMaxUsers(e.target.value)} min="1"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setMaxUsersModal(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-medium cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleUpdateMaxUsers} disabled={loadingAction}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 rounded-xl font-medium cursor-pointer">
                {loadingAction ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
