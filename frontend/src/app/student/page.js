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

// 12 rays evenly spread 360° — converge from all directions to center
const RAY_ANGLES = Array.from({ length: 12 }, (_, i) => i * 30);

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
        @keyframes dotPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,63,219,0.5); }
          50%       { box-shadow: 0 0 0 8px rgba(59,63,219,0); }
        }
        .pulse-dot { animation: dotPulse 2.5s ease-in-out infinite; }
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
            position: 'relative',
            backgroundColor: '#14152B',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: 48,
          }}
        >
          {/* Converging rays — SVG SMIL animations, no CSS dependency */}
          <svg
            viewBox="0 0 800 800"
            preserveAspectRatio="xMidYMid slice"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Concentric dashed circles */}
            {[60, 130, 220, 340, 480].map((r, i) => (
              <circle key={r} cx={400} cy={400} r={r}
                fill="none" stroke="#3B3FDB" strokeWidth="1"
                strokeDasharray="4 10"
              >
                <animate
                  attributeName="stroke-opacity"
                  values="0.08;0.22;0.08"
                  dur={`${4.5 + i * 0.5}s`}
                  begin={`${-i * 1.1}s`}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0;0.5;1"
                  keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
                />
              </circle>
            ))}

            {/* 12 rays evenly spread 360°, converging to center */}
            {RAY_ANGLES.map((angleDeg, i) => {
              const rad = (angleDeg * Math.PI) / 180;
              const x1 = 400 + Math.cos(rad) * 700;
              const y1 = 400 + Math.sin(rad) * 700;
              return (
                <line key={i} x1={x1} y1={y1} x2={400} y2={400}
                  stroke="#3B3FDB" strokeWidth="1"
                  strokeDasharray="6 16"
                >
                  <animate
                    attributeName="stroke-opacity"
                    values="0.12;0.38;0.12"
                    dur="4s"
                    begin={`${-i * 0.33}s`}
                    repeatCount="indefinite"
                    calcMode="spline"
                    keyTimes="0;0.5;1"
                    keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
                  />
                </line>
              );
            })}
          </svg>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 360 }}>
            <div style={{ marginBottom: 28 }}>
              <ElentioMark size={56} dark />
            </div>
            <p style={{
              fontFamily: 'var(--font-instrument-serif), Georgia, serif',
              fontSize: 28,
              fontWeight: 400,
              color: '#E8E9F5',
              lineHeight: 1.35,
              letterSpacing: '-0.02em',
              margin: '0 0 36px',
            }}>
              Tu carrera correcta existe.{' '}
              <em style={{ fontStyle: 'italic', color: '#7B7FE8' }}>Encontrémosla juntos.</em>
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(59,63,219,0.12)',
              border: '1px solid rgba(59,63,219,0.25)',
              borderRadius: 100,
              padding: '8px 16px',
            }}>
              <span
                className="pulse-dot"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#3B3FDB',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: '#A8ABCC', fontWeight: 500 }}>
                12.480 alumnos orientados
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
