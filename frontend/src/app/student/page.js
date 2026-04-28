'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userLogin } from '@/lib/api';

function ElentioMark({ size = 32, dark = false }) {
  const stroke = dark ? '#E8E9F5' : '#14152B';
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14.5" stroke={stroke} strokeOpacity="0.18" strokeWidth="1"/>
      <path d="M16 2 L16 16" stroke={stroke} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M3.5 22.5 L16 16" stroke={stroke} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M28.5 22.5 L16 16" stroke={stroke} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="16" cy="16" r="2.6" fill="#3B3FDB"/>
      <circle cx="16" cy="16" r="5" stroke="#3B3FDB" strokeOpacity="0.35" strokeWidth="1"/>
    </svg>
  );
}


export default function StudentLogin() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await userLogin(email, password);
      if (data.mustChangePassword) {
        router.push('/cambiar-contrasena');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes dash { to { stroke-dashoffset: -400; } }
        @keyframes dotPulse {
          0%   { box-shadow: 0 0 0 0   rgba(91,217,156,0.5); }
          70%  { box-shadow: 0 0 0 8px rgba(91,217,156,0);   }
          100% { box-shadow: 0 0 0 0   rgba(91,217,156,0);   }
        }
        .pulse-dot { animation: dotPulse 1.8s infinite; }
        @media (max-width: 959px) { .right-panel { display: none !important; } }
      `}</style>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100vh',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
      }}>
        {/* ── Left panel ──────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '40px 56px',
          backgroundColor: '#F8F8FA',
          overflowY: 'auto',
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'auto' }}>
            <ElentioMark size={28} />
            <span style={{
              fontFamily: 'var(--font-instrument-serif), Georgia, serif',
              fontSize: 24,
              color: '#14152B',
              fontWeight: 400,
              letterSpacing: '-0.015em',
              lineHeight: 1,
              paddingTop: 2,
            }}>
              elentio
            </span>
          </Link>

          {/* Form area */}
          <div style={{ maxWidth: 420, width: '100%', marginTop: 64, marginBottom: 64 }}>
            <h1 style={{
              fontFamily: 'var(--font-instrument-serif), Georgia, serif',
              fontSize: 42,
              fontWeight: 400,
              color: '#14152B',
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              margin: '0 0 10px',
            }}>
              Hola.{' '}
              <em style={{ fontStyle: 'italic', color: '#3B3FDB' }}>Retomemos</em>{' '}
              donde lo dejaste.
            </h1>
            <p style={{ fontSize: 15, color: '#5A5C72', margin: '0 0 36px', lineHeight: 1.6 }}>
              Accede con tu cuenta para continuar tu orientación.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3D3F55', marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: 15,
                    border: '1.5px solid #D8D9E8',
                    borderRadius: 10,
                    backgroundColor: '#fff',
                    color: '#14152B',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3B3FDB'}
                  onBlur={(e) => e.target.style.borderColor = '#D8D9E8'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3D3F55', marginBottom: 6 }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '12px 44px 12px 14px',
                      fontSize: 15,
                      border: '1.5px solid #D8D9E8',
                      borderRadius: 10,
                      backgroundColor: '#fff',
                      color: '#14152B',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3B3FDB'}
                    onBlur={(e) => e.target.style.borderColor = '#D8D9E8'}
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
                      color: '#8A8DA1',
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

              {error && (
                <p style={{ fontSize: 13, color: '#E53E3E', margin: 0, padding: '10px 14px', backgroundColor: '#FFF5F5', borderRadius: 8, border: '1px solid #FED7D7' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: 15,
                  fontWeight: 600,
                  backgroundColor: loading ? '#6B6FC7' : '#3B3FDB',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s',
                  marginTop: 4,
                }}
              >
                {loading ? 'Accediendo…' : 'Entrar'}
              </button>
            </form>

            <p style={{ fontSize: 13, color: '#8A8DA1', textAlign: 'center', marginTop: 24 }}>
              ¿Primera vez?{' '}
              <Link href="/solicitar-licencia" style={{ color: '#3B3FDB', textDecoration: 'none', fontWeight: 500 }}>
                Activa tu cuenta
              </Link>
            </p>
          </div>

          {/* Bottom link */}
          <p style={{ fontSize: 12, color: '#AAACC0', marginTop: 'auto' }}>
            <Link href="/" style={{ color: '#8A8DA1', textDecoration: 'none' }}>← Volver al inicio</Link>
            {' · '}
            <Link href="/licencias" style={{ color: '#8A8DA1', textDecoration: 'none' }}>Acceso para centros</Link>
          </p>
        </div>

        {/* ── Right panel ──────────────────────────────────────── */}
        <div
          className="right-panel"
          style={{
            background: '#14152B',
            color: '#F5F2EA',
            padding: '40px 56px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative converging lines */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.14 }}>
            <svg viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice"
              style={{ width: '100%', height: '100%' }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const cx = 500, cy = 650;
                const x2 = cx + Math.cos(angle) * 900;
                const y2 = cy + Math.sin(angle) * 900;
                return (
                  <line key={i} x1={cx} y1={cy} x2={x2} y2={y2}
                    stroke="#F5F2EA" strokeWidth="1" fill="none" strokeDasharray="4 6"
                    style={{ animation: 'dash 40s linear infinite', animationDelay: `${i * -2}s` }}
                  />
                );
              })}
              <circle cx="500" cy="650" r="80"  stroke="#F5F2EA" strokeOpacity="0.4"  fill="none" strokeWidth="0.8"/>
              <circle cx="500" cy="650" r="160" stroke="#F5F2EA" strokeOpacity="0.3"  fill="none" strokeWidth="0.8"/>
              <circle cx="500" cy="650" r="260" stroke="#F5F2EA" strokeOpacity="0.2"  fill="none" strokeWidth="0.8"/>
              <circle cx="500" cy="650" r="380" stroke="#F5F2EA" strokeOpacity="0.12" fill="none" strokeWidth="0.8"/>
            </svg>
          </div>

          {/* Header — badge top right */}
          <header style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 12, color: 'rgba(245,242,234,0.65)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              <i className="pulse-dot" style={{
                display: 'inline-block', width: 6, height: 6,
                borderRadius: '50%', background: '#5BD99C', flexShrink: 0,
              }}/>
              12.480 alumnos orientados
            </span>
          </header>

          {/* Main content — left aligned */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: 40 }}>
              <ElentioMark size={56} dark />
            </div>
            <div style={{
              fontFamily: 'var(--font-instrument-serif), Georgia, serif',
              fontSize: 46,
              fontWeight: 400,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              maxWidth: 460,
            }}>
              Tu carrera correcta existe.
              <br/>
              <em style={{ fontStyle: 'italic', color: '#D9A647' }}>Encontrémosla juntos.</em>
            </div>
            <p style={{
              fontSize: 14,
              color: 'rgba(245,242,234,0.65)',
              maxWidth: 420,
              marginTop: 28,
              lineHeight: 1.6,
            }}>
              Elentio es el copiloto que cruza lo que te motiva con cómo eres y con el trabajo que
              existirá dentro de diez años. Sin tests aburridos, sin respuestas genéricas.
            </p>
          </div>

          {/* Footer */}
          <div style={{
            position: 'relative', zIndex: 1,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 12, color: 'rgba(245,242,234,0.45)',
          }}>
            <span>Área del alumno · v2.4</span>
            <span>Madrid, España</span>
          </div>
        </div>
      </div>
    </>
  );
}
