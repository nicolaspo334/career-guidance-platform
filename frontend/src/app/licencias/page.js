'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { centerLogin } from '@/lib/api';

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

export default function LicenciasLogin() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [keepSession, setKeep]    = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await centerLogin(email, password);
      if (data.mustChangePassword) {
        router.push('/licencias/cambiar-contrasena');
      } else {
        router.push('/licencias/dashboard');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --bg-centers: #F1EEE5;
          --accent: #D9A647;
          --accent-deep: #B8862E;
        }
        .centers-page {
          min-height: 100vh;
          background-color: var(--bg-centers);
          background-image:
            linear-gradient(rgba(20,21,43,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20,21,43,0.055) 1px, transparent 1px);
          background-size: 32px 32px;
          display: grid;
          grid-template-rows: auto 1fr auto;
          font-family: var(--font-inter), system-ui, sans-serif;
        }
        .centers-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 40px;
          border-bottom: 1px solid rgba(20,21,43,0.08);
          background-color: rgba(241,238,229,0.85);
          backdrop-filter: blur(8px);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .centers-chip {
          background-color: var(--accent);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 100px;
        }
        .centers-card {
          position: relative;
          background: #fff;
          border-radius: 16px;
          padding: 40px 40px 36px;
          max-width: 460px;
          width: 100%;
          box-shadow: 0 8px 40px rgba(20,21,43,0.10), 0 1px 3px rgba(20,21,43,0.06);
          overflow: hidden;
        }
        .centers-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--accent) 0%, var(--accent-deep) 100%);
        }
        .centers-input {
          width: 100%;
          padding: 12px 14px;
          font-size: 15px;
          border: 1.5px solid #DDD8CC;
          border-radius: 10px;
          background-color: #FAFAF8;
          color: #14152B;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s;
          font-family: inherit;
        }
        .centers-input:focus {
          border-color: var(--accent);
        }
        .centers-btn {
          width: 100%;
          padding: 13px;
          font-size: 15px;
          font-weight: 600;
          background-color: var(--accent);
          color: #fff;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background-color 0.15s;
          font-family: inherit;
        }
        .centers-btn:hover:not(:disabled) {
          background-color: var(--accent-deep);
        }
        .centers-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .centers-footer {
          padding: 20px 40px;
          text-align: center;
          font-size: 12px;
          color: #9A9580;
        }
        .centers-footer a {
          color: #7A7560;
          text-decoration: none;
        }
        .centers-footer a:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="centers-page">
        {/* ── Topbar ──────────────────────────────────────── */}
        <header className="centers-topbar">
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <ElentioMark size={26} />
            <span style={{
              fontFamily: 'var(--font-instrument-serif), Georgia, serif',
              fontSize: 22,
              color: '#14152B',
              fontWeight: 400,
              letterSpacing: '-0.015em',
              lineHeight: 1,
              paddingTop: 2,
            }}>
              elentio
            </span>
            <span className="centers-chip">Centros</span>
          </Link>
          <Link
            href="/student"
            style={{ fontSize: 13, color: '#5A5040', textDecoration: 'none', fontWeight: 500 }}
          >
            ¿Eres alumno? →
          </Link>
        </header>

        {/* ── Main ──────────────────────────────────────────── */}
        <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
          <div className="centers-card">
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#B8A880', margin: '0 0 10px' }}>
              Acceso institucional
            </p>
            <h1 style={{
              fontFamily: 'var(--font-instrument-serif), Georgia, serif',
              fontSize: 32,
              fontWeight: 400,
              color: '#14152B',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              margin: '0 0 6px',
            }}>
              Panel del <em style={{ fontStyle: 'italic' }}>centro.</em>
            </h1>
            <p style={{ fontSize: 14, color: '#6A6350', margin: '0 0 28px', lineHeight: 1.55 }}>
              Usa el email con el que solicitaste la licencia y la contraseña que recibiste por correo.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4A4535', marginBottom: 6 }}>
                  Email del centro
                </label>
                <input
                  className="centers-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="orientacion@instituto.es"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4A4535', marginBottom: 6 }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="centers-input"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      color: '#9A9580',
                      lineHeight: 1,
                    }}
                    aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPass ? (
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#6A6350' }}>
                <input
                  type="checkbox"
                  checked={keepSession}
                  onChange={(e) => setKeep(e.target.checked)}
                  style={{ accentColor: 'var(--accent)', width: 15, height: 15 }}
                />
                Mantener sesión iniciada
              </label>

              {error && (
                <p style={{ fontSize: 13, color: '#C0392B', margin: 0, padding: '10px 14px', backgroundColor: '#FEF3EE', borderRadius: 8, border: '1px solid #F5C6B0' }}>
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="centers-btn" style={{ marginTop: 4 }}>
                {loading ? 'Accediendo…' : 'Acceder al panel'}
              </button>
            </form>

            <p style={{ fontSize: 12, color: '#9A9580', textAlign: 'center', marginTop: 24 }}>
              ¿No tienes acceso aún?{' '}
              <Link href="/solicitar-licencia" style={{ color: 'var(--accent-deep)', textDecoration: 'none', fontWeight: 500 }}>
                Solicitar licencia
              </Link>
            </p>
          </div>
        </main>

        {/* ── Footer ──────────────────────────────────────── */}
        <footer className="centers-footer">
          <span>© {new Date().getFullYear()} Elentio</span>
          {' · '}
          <a href="#">Política de privacidad</a>
          {' · '}
          <a href="#">Ayuda</a>
          {' · '}
          <Link href="/" style={{ color: '#7A7560', textDecoration: 'none' }}>Inicio</Link>
        </footer>
      </div>
    </>
  );
}
