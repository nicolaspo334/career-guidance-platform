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
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
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
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="e-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', minHeight: '100vh' }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <ElentioMark size={28}/>
        <span style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 26, color: '#14152B', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: 1, paddingTop: 2 }}>
          elentio
        </span>
      </Link>
      <p style={{ fontSize: 13, color: '#8A8DA1', marginBottom: 32 }}>Portal de centros educativos</p>

      <div className="e-card" style={{ width: '100%', maxWidth: 400, padding: 28, boxShadow: '0 4px 24px rgba(20,21,43,0.08)' }}>
        <h1 style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 28, fontWeight: 400, color: '#14152B', margin: '0 0 6px', letterSpacing: '-0.015em' }}>
          Acceso del centro
        </h1>
        <p style={{ fontSize: 13, color: '#5A5C72', margin: '0 0 24px', lineHeight: 1.5 }}>
          Usa el email con el que solicitaste la licencia y la contraseña recibida por correo.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <div>
            <label className="e-label">Email del centro</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required placeholder="orientacion@instituto.es" className="e-input"/>
          </div>
          <div>
            <label className="e-label">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required placeholder="••••••••" className="e-input"/>
          </div>
          {error && <p className="e-error">{error}</p>}
          <button type="submit" disabled={loading} className="btn-p lg" style={{ width: '100%', marginTop: 4, justifyContent: 'center' }}>
            {loading ? 'Accediendo…' : 'Acceder al panel'}
          </button>
        </form>

        <p style={{ fontSize: 12, color: '#8A8DA1', textAlign: 'center', marginTop: 20 }}>
          ¿No tienes acceso aún?{' '}
          <Link href="/solicitar-licencia" style={{ color: '#3B3FDB', textDecoration: 'none' }}>
            Solicitar licencia
          </Link>
        </p>
      </div>

      <p style={{ marginTop: 24, fontSize: 13, color: '#8A8DA1' }}>
        <Link href="/" style={{ color: '#5A5C72', textDecoration: 'none' }}>← Volver al inicio</Link>
      </p>
    </div>
  );
}
