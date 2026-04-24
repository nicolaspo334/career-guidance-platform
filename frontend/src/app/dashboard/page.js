'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStoredUser, userLogout, isUserLoggedIn, getTestResults } from '@/lib/api';

function ElentioMark({ size = 24 }) {
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

export default function Dashboard() {
  const [user, setUser]             = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoggedIn()) { router.replace('/login'); return; }
    setUser(getStoredUser());
    getTestResults()
      .then(data => { if (data.results?.length) setLastResult(data.results[0]); })
      .catch(() => {});
  }, []);

  const logout = () => {
    userLogout();
    router.push('/login');
  };

  if (!user) return null;

  const firstName = user.name.split(' ')[0];

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
            <span style={{ fontSize: 14, color: '#5A5C72' }}>{user.name}</span>
            <button onClick={logout} className="btn-g" style={{ fontSize: 13 }}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        {/* Greeting */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, letterSpacing: '-0.02em', color: '#14152B', margin: 0 }}>
            Hola, {firstName}.
          </h1>
          <p style={{ color: '#5A5C72', marginTop: 10, fontSize: 16 }}>
            Bienvenido a tu espacio de orientación académica y profesional.
          </p>
        </div>

        {/* Main test CTA */}
        <div style={{
          background: '#14152B', borderRadius: 20, padding: '32px 36px',
          display: 'flex', gap: 28, alignItems: 'flex-start', marginBottom: 24,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(59,63,219,0.25)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#7B83F7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 22, fontWeight: 400, color: '#F5F2EA', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
              Test de orientación académica
            </h2>
            <p style={{ color: 'rgba(245,242,234,0.6)', fontSize: 14, lineHeight: 1.55, margin: '0 0 20px', maxWidth: 560 }}>
              Responde preguntas abiertas sobre tus intereses y personalidad.
              La IA analizará tu perfil MBTI, RIASEC y NEO Big Five y generará
              recomendaciones personalizadas de grados universitarios.
            </p>
            <Link href="/test/mbti" className="btn-p" style={{ textDecoration: 'none', background: '#3B3FDB', borderColor: '#3B3FDB' }}>
              {lastResult ? 'Repetir el test' : 'Empezar el test'} →
            </Link>
          </div>
        </div>

        {/* Last result */}
        {lastResult && (
          <div className="e-card" style={{ padding: '24px 28px', marginBottom: 24, boxShadow: '0 1px 0 rgba(20,21,43,0.02), 0 4px 16px rgba(20,21,43,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 20, fontWeight: 400, color: '#14152B', margin: 0 }}>Tu último resultado</h2>
              <Link href="/test/mbti/resultado" style={{ fontSize: 13, color: '#3B3FDB', textDecoration: 'none' }}
                onClick={() => {
                  sessionStorage.setItem('elentio_mbti_result', JSON.stringify({
                    mbtiType: lastResult.mbti_type, mbtiLabel: '', mbtiTagline: '',
                    dimensions: { EI: lastResult.ei_score, SN: lastResult.sn_score, TF: lastResult.tf_score, JP: lastResult.jp_score },
                    riasec: { R: lastResult.riasec_r, I: lastResult.riasec_i, A: lastResult.riasec_a, S: lastResult.riasec_s, E: lastResult.riasec_e, C: lastResult.riasec_c, code: lastResult.riasec_code },
                    neo: { O: lastResult.neo_o, C: lastResult.neo_c, E: lastResult.neo_e, A: lastResult.neo_a, N: lastResult.neo_n },
                    analysis: lastResult.analysis, careers: lastResult.careers,
                  }));
                }}
              >
                Ver detalle →
              </Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-instrument-serif), serif', fontSize: 42, letterSpacing: '0.04em', color: '#3B3FDB', lineHeight: 1 }}>
                  {lastResult.mbti_type}
                </div>
                <div style={{ fontSize: 11, color: '#8A8DA1', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tipo MBTI</div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#3A3C55', fontSize: 14, lineHeight: 1.55, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {lastResult.analysis}
                </p>
                {lastResult.careers?.length > 0 && (
                  <p style={{ color: '#8A8DA1', fontSize: 12, marginTop: 8 }}>
                    Top carrera: <strong style={{ color: '#14152B' }}>{lastResult.careers[0].name}</strong>
                    {' '}({lastResult.careers[0].score}% afinidad)
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { icon: '📚', title: 'Carreras universitarias', desc: 'Más de 930 carreras analizadas y puntuadas según tu perfil.' },
            { icon: '🏛️', title: 'Universidades', desc: 'Recomendaciones de universidades adaptadas a tu nota y preferencias.' },
            { icon: '💼', title: 'Mercado laboral', desc: 'Proyecciones de empleo para 2030 incluidas en cada recomendación.' },
          ].map((card) => (
            <div key={card.title} className="e-card" style={{ padding: '22px 24px' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{card.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#14152B', margin: '0 0 6px' }}>{card.title}</h3>
              <p style={{ fontSize: 13, color: '#5A5C72', margin: 0, lineHeight: 1.5 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
