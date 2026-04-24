'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userChangePassword, isUserLoggedIn } from '@/lib/api';

function ElentioMark({ size = 28 }) {
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

const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#3B3FDB', '#22c55e'];
const STRENGTH_LABELS = ['', 'Muy débil', 'Débil', 'Aceptable', 'Buena', 'Excelente'];

function strengthScore(p) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8)           s++;
  if (p.length >= 12)          s++;
  if (/[A-Z]/.test(p))         s++;
  if (/[0-9]/.test(p))         s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

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

  const score = strengthScore(newPass);
  const mismatch = !!confirm && confirm !== newPass;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPass !== confirm) { setError('Las contraseñas no coinciden'); return; }
    if (newPass.length < 8)  { setError('Mínimo 8 caracteres'); return; }
    if (newPass === current) { setError('La nueva contraseña debe ser distinta'); return; }
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
    <div className="e-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', minHeight: '100vh' }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
        <ElentioMark size={28}/>
        <span style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 26, color: '#14152B', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: 1, paddingTop: 2 }}>
          elentio
        </span>
      </Link>

      <div className="e-card" style={{ width: '100%', maxWidth: 400, padding: 28, boxShadow: '0 4px 24px rgba(20,21,43,0.08)' }}>
        {/* Warning */}
        <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.22)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#92400e', marginBottom: 3 }}>Cambia tu contraseña temporal</div>
            <div style={{ fontSize: 12, color: '#b45309', lineHeight: 1.45 }}>
              Por seguridad debes establecer una contraseña personal antes de continuar.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <div>
            <label className="e-label">Contraseña temporal (la que te han dado)</label>
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)}
              required placeholder="Contraseña recibida" className="e-input"/>
          </div>

          <div>
            <label className="e-label">Nueva contraseña</label>
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)}
              required placeholder="Mínimo 8 caracteres" className="e-input"/>
            {newPass && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= score ? STRENGTH_COLORS[score] : 'rgba(20,21,43,0.08)', transition: 'background 0.2s' }}/>
                  ))}
                </div>
                <div style={{ fontSize: 11, fontWeight: 500, color: STRENGTH_COLORS[score] }}>{STRENGTH_LABELS[score]}</div>
              </div>
            )}
          </div>

          <div>
            <label className="e-label">Confirmar nueva contraseña</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              required placeholder="Repite la contraseña" className="e-input"
              style={{ borderColor: mismatch ? '#ef4444' : undefined, boxShadow: mismatch ? '0 0 0 3px rgba(239,68,68,0.1)' : undefined }}/>
          </div>

          {error && <p className="e-error">{error}</p>}

          <button type="submit" disabled={loading || mismatch} className="btn-p lg"
            style={{ width: '100%', marginTop: 4, justifyContent: 'center', opacity: mismatch ? 0.5 : 1 }}>
            {loading ? 'Guardando…' : 'Establecer nueva contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
