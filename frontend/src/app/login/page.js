'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userLogin, userRegister } from '@/lib/api';

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
      const data = await userLogin(loginForm.email, loginForm.password);
      if (data.mustChangePassword) {
        router.push('/cambiar-contrasena');
      } else {
        router.push('/dashboard');
      }
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
    <div className="e-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', minHeight: '100vh' }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
        <ElentioMark size={28}/>
        <span style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 26, color: '#14152B', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: 1, paddingTop: 2 }}>
          elentio
        </span>
      </Link>

      <div className="e-card" style={{ width: '100%', maxWidth: 400, overflow: 'hidden', boxShadow: '0 4px 24px rgba(20,21,43,0.08)' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(20,21,43,0.08)' }}>
          {[
            { key: 'login', label: 'Ya tengo cuenta' },
            { key: 'register', label: 'Primera vez' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setError(''); }}
              style={{
                flex: 1, padding: '14px 0', fontSize: 14, fontWeight: 500,
                fontFamily: 'inherit', border: 'none', cursor: 'pointer',
                background: 'transparent',
                color: tab === t.key ? '#3B3FDB' : '#8A8DA1',
                borderBottom: tab === t.key ? '2px solid #3B3FDB' : '2px solid transparent',
                transition: 'color 0.15s',
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 28 }}>
          {tab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'grid', gap: 16 }}>
              <div>
                <label className="e-label">Email</label>
                <input type="email" value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required placeholder="tu@email.es" className="e-input"/>
              </div>
              <div>
                <label className="e-label">Contraseña</label>
                <input type="password" value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required placeholder="••••••••" className="e-input"/>
              </div>
              {error && <p className="e-error">{error}</p>}
              <button type="submit" disabled={loading} className="btn-p lg" style={{ width: '100%', marginTop: 4, justifyContent: 'center' }}>
                {loading ? 'Entrando…' : 'Iniciar sesión'}
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'grid', gap: 16 }}>
              <div>
                <label className="e-label">Nombre completo</label>
                <input type="text" value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  required placeholder="Nombre Apellido" className="e-input"/>
              </div>
              <div>
                <label className="e-label">Email</label>
                <input type="email" value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required placeholder="tu@email.es" className="e-input"/>
              </div>
              <div>
                <label className="e-label">Contraseña</label>
                <input type="password" value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required placeholder="Mínimo 8 caracteres" className="e-input"/>
              </div>
              <div>
                <label className="e-label">Confirmar contraseña</label>
                <input type="password" value={registerForm.confirm}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirm: e.target.value })}
                  required placeholder="Repite la contraseña" className="e-input"/>
              </div>
              <div>
                <label className="e-label">Código de licencia</label>
                <input type="text" value={registerForm.licenseCode}
                  onChange={(e) => setRegisterForm({ ...registerForm, licenseCode: e.target.value.toUpperCase() })}
                  required placeholder="MIND-XXXX-XXXX" className="e-input" style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}/>
                <p style={{ fontSize: 12, color: '#8A8DA1', marginTop: 4 }}>Proporcionado por tu centro educativo</p>
              </div>
              {error && <p className="e-error">{error}</p>}
              <button type="submit" disabled={loading} className="btn-p lg" style={{ width: '100%', marginTop: 4, justifyContent: 'center' }}>
                {loading ? 'Creando cuenta…' : 'Crear cuenta y entrar'}
              </button>
            </form>
          )}
        </div>
      </div>

      <p style={{ marginTop: 24, fontSize: 13, color: '#8A8DA1' }}>
        <Link href="/" style={{ color: '#5A5C72', textDecoration: 'none' }}>← Volver al inicio</Link>
      </p>
    </div>
  );
}
