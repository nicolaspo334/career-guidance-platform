'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getCenterInfo, getCenterUsers, createCenterUser,
  deactivateUser, reactivateUser, centerLogout,
  isCenterLoggedIn,
} from '@/lib/api';

function ElentioMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14.5" stroke="#14152B" strokeOpacity="0.18" strokeWidth="1"/>
      <path d="M16 2 L16 16" stroke="#14152B" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M3.5 22.5 L16 16" stroke="#14152B" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M28.5 22.5 L16 16" stroke="#14152B" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="16" cy="16" r="2.6" fill="#3B3FDB"/>
      <circle cx="16" cy="16" r="5" stroke="#3B3FDB" strokeOpacity="0.35" strokeWidth="1"/>
    </svg>
  );
}

export default function LicenciasDashboard() {
  const [license, setLicense]         = useState(null);
  const [users, setUsers]             = useState([]);
  const [tab, setTab]                 = useState('usuarios');
  const [newUser, setNewUser]         = useState({ name: '', email: '' });
  const [createdUser, setCreatedUser] = useState(null);
  const [copiedValue, setCopiedValue] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
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
    if (!confirm('¿Quitar la plaza de este alumno? Se liberará un espacio en la licencia.')) return;
    try { await deactivateUser(userId); await load(); }
    catch (e) { setError(e.message); }
  };

  const handleReactivate = async (userId) => {
    try { await reactivateUser(userId); await load(); }
    catch (e) { setError(e.message); }
  };

  const copy = (val) => {
    navigator.clipboard.writeText(val);
    setCopiedValue(val);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  const logout = () => { centerLogout(); router.push('/licencias'); };

  if (!license) return null;

  const available = license.max_users - license.used_users;
  const usagePct = Math.min(100, (license.used_users / license.max_users) * 100);
  const usageColor = usagePct > 90 ? '#ef4444' : usagePct > 70 ? '#f59e0b' : '#22c55e';

  return (
    <div className="e-page">
      {/* Header */}
      <header className="e-header">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <ElentioMark size={22}/>
            <span style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 22, color: '#14152B', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: 1, paddingTop: 2 }}>
              elentio
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 14, color: '#5A5C72' }}>{license.center_name}</span>
            <button onClick={logout} className="btn-g" style={{ fontSize: 13 }}>Cerrar sesión</button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {/* Error */}
        {error && (
          <div className="e-error" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16, lineHeight: 1 }}>✕</button>
          </div>
        )}

        {/* License stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
          {/* License code */}
          <div style={{ gridColumn: 'span 2', background: '#14152B', borderRadius: 14, padding: '20px 22px', color: '#F5F2EA', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,242,234,0.5)', marginBottom: 6 }}>Código de licencia</div>
              <code style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.1em' }}>{license.code}</code>
            </div>
            {license.revoked === 1 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: 11, padding: '4px 10px', borderRadius: 999, fontWeight: 600 }}>Revocada</span>
            )}
          </div>

          <div className="e-card" style={{ padding: '20px 22px' }}>
            <div style={{ fontFamily: 'var(--font-instrument-serif), serif', fontSize: 36, color: '#14152B', lineHeight: 1 }}>{license.used_users}</div>
            <div style={{ fontSize: 13, color: '#5A5C72', marginTop: 6 }}>Alumnos activos</div>
          </div>

          <div className="e-card" style={{ padding: '20px 22px', background: available > 0 ? '#fff' : 'rgba(245,158,11,0.06)', borderColor: available > 0 ? 'rgba(20,21,43,0.08)' : 'rgba(245,158,11,0.25)' }}>
            <div style={{ fontFamily: 'var(--font-instrument-serif), serif', fontSize: 36, lineHeight: 1, color: available > 0 ? '#22c55e' : '#f59e0b' }}>{available}</div>
            <div style={{ fontSize: 13, color: '#5A5C72', marginTop: 6 }}>Plazas disponibles</div>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="e-card" style={{ padding: '18px 22px', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#5A5C72', marginBottom: 10 }}>
            <span>Uso de la licencia</span>
            <span style={{ fontWeight: 500, color: '#14152B' }}>{license.used_users} / {license.max_users} alumnos</span>
          </div>
          <div style={{ height: 6, background: 'rgba(20,21,43,0.07)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${usagePct}%`, background: usageColor, borderRadius: 3, transition: 'width 0.5s ease' }}/>
          </div>
        </div>

        {/* Tabs */}
        <div className="e-tab-bar" style={{ marginBottom: 24 }}>
          {[
            { key: 'usuarios', label: `Alumnos (${users.filter(u => u.active).length})` },
            { key: 'anadir', label: 'Añadir alumno' },
          ].map((t) => (
            <button key={t.key} className={`e-tab${tab === t.key ? ' active' : ''}`}
              onClick={() => { setTab(t.key); setCreatedUser(null); }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── ALUMNOS ── */}
        {tab === 'usuarios' && (
          <div style={{ display: 'grid', gap: 10 }}>
            {users.length === 0 ? (
              <div className="e-card" style={{ padding: '56px 32px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👩‍🎓</div>
                <p style={{ color: '#5A5C72', margin: '0 0 16px' }}>No hay alumnos registrados aún</p>
                <button onClick={() => setTab('anadir')} className="btn-p">
                  Añadir el primer alumno →
                </button>
              </div>
            ) : (
              <>
                {users.filter(u => u.active).length > 0 && (
                  <div>
                    <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8DA1', margin: '0 0 8px 4px' }}>Activos</p>
                    {users.filter(u => u.active).map(u => (
                      <div key={u.id} className="e-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: '#14152B' }}>{u.name}</div>
                          <div style={{ fontSize: 13, color: '#5A5C72', marginTop: 2 }}>{u.email}</div>
                          <div style={{ fontSize: 11, color: '#8A8DA1', marginTop: 2 }}>
                            Registrado {new Date(u.created_at).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                        <button onClick={() => handleDeactivate(u.id)}
                          style={{ fontSize: 12, color: '#ef4444', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                          Quitar plaza
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {users.filter(u => !u.active).length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8DA1', margin: '0 0 8px 4px' }}>Desactivados</p>
                    {users.filter(u => !u.active).map(u => (
                      <div key={u.id} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(20,21,43,0.03)', border: '1px solid rgba(20,21,43,0.06)', borderRadius: 12, marginBottom: 8, opacity: 0.65 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: '#14152B' }}>{u.name}</div>
                          <div style={{ fontSize: 13, color: '#5A5C72' }}>{u.email}</div>
                        </div>
                        <button onClick={() => handleReactivate(u.id)}
                          style={{ fontSize: 12, color: '#16a34a', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
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
          <div style={{ maxWidth: 460 }}>
            <div className="e-card" style={{ padding: '24px 28px' }}>
              <h2 style={{ fontFamily: 'var(--font-instrument-serif), serif', fontSize: 22, fontWeight: 400, color: '#14152B', margin: '0 0 6px' }}>
                Añadir alumno manualmente
              </h2>
              <p style={{ fontSize: 13, color: '#5A5C72', margin: '0 0 22px', lineHeight: 1.5 }}>
                Se generará una contraseña segura automáticamente. Compártela con el alumno.
              </p>

              {available <= 0 && (
                <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)', color: '#b45309', fontSize: 13, padding: '10px 14px', borderRadius: 10, marginBottom: 18 }}>
                  No quedan plazas disponibles en tu licencia.
                </div>
              )}

              <form onSubmit={handleCreateUser} style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label className="e-label">Nombre completo</label>
                  <input type="text" value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required placeholder="Nombre Apellido" className="e-input"/>
                </div>
                <div>
                  <label className="e-label">Email</label>
                  <input type="email" value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required placeholder="alumno@email.es" className="e-input"/>
                </div>
                <button type="submit" disabled={loading || available <= 0} className="btn-p lg"
                  style={{ width: '100%', justifyContent: 'center', opacity: loading || available <= 0 ? 0.5 : 1 }}>
                  {loading ? 'Creando…' : 'Crear alumno y generar contraseña'}
                </button>
              </form>
            </div>

            {createdUser && (
              <div className="e-success" style={{ marginTop: 16, borderRadius: 14, padding: '20px 22px' }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>✓ Alumno creado — copia las credenciales ahora</div>
                <p style={{ fontSize: 12, margin: '0 0 14px', opacity: 0.8 }}>
                  La contraseña solo se muestra una vez. Envíasela al alumno por un canal seguro.
                </p>
                <div style={{ display: 'grid', gap: 8 }}>
                  {[
                    { label: 'Email', value: createdUser.email },
                    { label: 'Contraseña', value: createdUser.password },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#8A8DA1', marginBottom: 2 }}>{label}</div>
                        <code style={{ fontSize: 14, fontWeight: 700, color: '#14152B' }}>{value}</code>
                      </div>
                      <button onClick={() => copy(value)}
                        style={{ fontSize: 12, background: 'rgba(20,21,43,0.06)', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit', color: '#14152B', marginLeft: 8, whiteSpace: 'nowrap' }}>
                        {copiedValue === value ? '¡Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setCreatedUser(null)}
                  style={{ marginTop: 14, fontSize: 12, background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', fontFamily: 'inherit' }}>
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
