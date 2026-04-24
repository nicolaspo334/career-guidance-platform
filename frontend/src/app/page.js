'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ── Logo ──────────────────────────────────────────────────────────────────────

function ElentioMark({ size = 28, stroke = 'currentColor', accent = null }) {
  const a = accent || stroke;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <circle cx="16" cy="16" r="14.5" stroke={stroke} strokeOpacity="0.18" strokeWidth="1"/>
      <path d="M16 2 L16 16" stroke={stroke} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M3.5 22.5 L16 16" stroke={stroke} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M28.5 22.5 L16 16" stroke={stroke} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="16" cy="16" r="2.6" fill={a}/>
      <circle cx="16" cy="16" r="5" stroke={a} strokeOpacity="0.35" strokeWidth="1"/>
    </svg>
  );
}

function ElentioLogo({ size = 26, inverted = false }) {
  const color = inverted ? '#F5F2EA' : '#14152B';
  const accent = inverted ? '#F5F2EA' : '#3B3FDB';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <ElentioMark size={size} stroke={color} accent={accent}/>
      <span style={{
        fontFamily: 'var(--font-instrument-serif), Georgia, serif',
        fontSize: size * 0.95,
        letterSpacing: '-0.015em',
        color,
        fontWeight: 400,
        lineHeight: 1,
        paddingTop: 2,
      }}>
        elentio
      </span>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function MegaProducto() {
  const items = [
    { t: 'Test vocacional IA', d: '12 preguntas adaptativas que activan MBTI, RIASEC y NEO.' },
    { t: 'Informe para el alumno', d: 'Reporte narrativo con las 5 carreras mejor alineadas.' },
    { t: 'Panel del tutor', d: 'Vista agregada por clase, curso y centro.' },
    { t: 'Proyección laboral', d: 'Demanda y salario previsto a 5 años por grado.' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 40 }}>
      <div>
        <p className="eyebrow" style={{ marginBottom: 12 }}>Producto</p>
        <h3 style={{ fontFamily: 'var(--font-instrument-serif), serif', fontSize: 32, margin: 0, letterSpacing: '-0.02em' }}>
          Un asistente vocacional, no un test más.
        </h3>
        <p style={{ color: '#5A5C72', fontSize: 14, lineHeight: 1.55, marginTop: 14 }}>
          Elentio combina tres modelos psicométricos validados con datos del mercado laboral español.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {items.map(it => (
          <a key={it.t} href="#" className="mega-card">
            <div className="mega-card-title">{it.t}</div>
            <div className="mega-card-desc">{it.d}</div>
            <span className="mega-card-arrow">→</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function MegaCentros() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 40 }}>
      <div>
        <p className="eyebrow" style={{ marginBottom: 12 }}>Para centros</p>
        <h3 style={{ fontFamily: 'var(--font-instrument-serif), serif', fontSize: 32, margin: 0, letterSpacing: '-0.02em' }}>
          Hecho para orientadores reales.
        </h3>
        <p style={{ color: '#5A5C72', fontSize: 14, lineHeight: 1.55, marginTop: 14 }}>
          Licencias por centro, integración con sistemas académicos y soporte pedagógico continuo.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        {[
          ['Públicos', '230 centros'],
          ['Concertados', '410 centros'],
          ['Privados', '128 centros'],
          ['Bachillerato', 'Tramo 4º ESO – 2º BAC'],
          ['FP', 'Grados medio y superior'],
          ['Universidad', 'Orientación al máster'],
        ].map(([t, d]) => (
          <a key={t} href="#" className="mega-card small">
            <div className="mega-card-title">{t}</div>
            <div className="mega-card-desc">{d}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

function LandingNavbar() {
  const [open, setOpen] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const closeMenu = () => setOpen(null);

  return (
    <>
      <header
        onMouseLeave={closeMenu}
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: scrolled || open ? 'rgba(250,248,243,0.92)' : 'rgba(250,248,243,0.6)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: scrolled || open ? '1px solid rgba(20,21,43,0.08)' : '1px solid transparent',
          transition: 'background 0.25s, border-color 0.25s',
        }}
      >
        <div style={{
          maxWidth: 1240, margin: '0 auto',
          padding: '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        }}>
          <a href="#" style={{ textDecoration: 'none' }}>
            <ElentioLogo size={24}/>
          </a>

          <nav className="landing-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[
              { label: 'Producto', key: 'producto' },
              { label: 'Para centros', key: 'centros' },
              { label: 'Metodología', key: null },
              { label: 'Precios', key: null },
              { label: 'Recursos', key: null },
            ].map(({ label, key }) => (
              <button
                key={label}
                type="button"
                onMouseEnter={() => key ? setOpen(key) : closeMenu()}
                onFocus={() => key ? setOpen(key) : closeMenu()}
                style={{
                  background: open === key && key ? 'rgba(20,21,43,0.05)' : 'transparent',
                  border: 'none',
                  color: '#14152B',
                  fontFamily: 'inherit',
                  fontSize: 14,
                  fontWeight: 500,
                  padding: '8px 14px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  letterSpacing: '-0.005em',
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/login" className="btn-g landing-nav-desktop" style={{ textDecoration: 'none' }}>
              Iniciar sesión
            </Link>
            <Link href="/licencias" className="btn-g landing-nav-desktop" style={{ textDecoration: 'none' }}>
              Portal centros
            </Link>
            <Link href="/solicitar-licencia" className="btn-p" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Solicitar licencia
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 6 }}>
                <path d="M4 8h8M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <button
              className="landing-burger"
              type="button"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Menú"
            >
              {mobileOpen ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <div
          onMouseLeave={closeMenu}
          style={{
            display: open ? 'block' : 'none',
            borderTop: '1px solid rgba(20,21,43,0.06)',
            background: 'rgba(250,248,243,0.98)',
          }}
        >
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 32px' }}>
            {open === 'producto' && <MegaProducto/>}
            {open === 'centros' && <MegaCentros/>}
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        <a href="#" className="mobile-menu-nav-link" onClick={() => setMobileOpen(false)}>Producto</a>
        <a href="#" className="mobile-menu-nav-link" onClick={() => setMobileOpen(false)}>Para centros</a>
        <a href="#" className="mobile-menu-nav-link" onClick={() => setMobileOpen(false)}>Metodología</a>
        <a href="#" className="mobile-menu-nav-link" onClick={() => setMobileOpen(false)}>Precios</a>
        <a href="#" className="mobile-menu-nav-link" onClick={() => setMobileOpen(false)}>Recursos</a>
        <div className="mobile-menu-actions">
          <Link href="/login" className="btn-g lg" style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
            Iniciar sesión
          </Link>
          <Link href="/licencias" className="btn-g lg" style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
            Portal centros
          </Link>
          <Link href="/solicitar-licencia" className="btn-p lg" style={{ textDecoration: 'none', justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>
            Solicitar licencia →
          </Link>
        </div>
      </div>
    </>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

const QUICK_QUIZ = [
  {
    q: 'Tarde libre. ¿Qué te apetece más?',
    a: [
      { t: 'Resolver un puzzle difícil', w: { I: 2, C: 1 } },
      { t: 'Dibujar o tocar un instrumento', w: { A: 2 } },
      { t: 'Quedar con gente', w: { S: 2, E: 1 } },
      { t: 'Arreglar / construir algo', w: { R: 2, C: 1 } },
    ],
  },
  {
    q: 'En clase, te reconocen por…',
    a: [
      { t: 'Ver patrones que otros no ven', w: { I: 2 } },
      { t: 'Escuchar y mediar', w: { S: 2 } },
      { t: 'Liderar y convencer', w: { E: 2 } },
      { t: 'Orden y disciplina', w: { C: 2 } },
    ],
  },
  {
    q: 'Tu trabajo ideal dentro de 10 años…',
    a: [
      { t: 'Algo que no existe aún', w: { A: 2, I: 1 } },
      { t: 'Ayudar a personas directamente', w: { S: 2 } },
      { t: 'Dirigir un equipo ambicioso', w: { E: 2 } },
      { t: 'Con rigor y datos claros', w: { I: 1, C: 2 } },
    ],
  },
];

function ModelBadge({ name, active }) {
  return (
    <div className={`model-badge${active ? ' active' : ''}`}>
      <span className="model-badge-dot"/>
      {name}
    </div>
  );
}

function Hero() {
  const [step, setStep] = useState(0);
  const [weights, setWeights] = useState({});
  const [studentCount, setStudentCount] = useState(null);

  useEffect(() => {
    fetch('https://mindpath-worker.nicolaspo334.workers.dev/api/stats')
      .then(r => r.json())
      .then(d => setStudentCount(d.students))
      .catch(() => {});
  }, []);

  const answer = (w) => {
    const nw = { ...weights };
    Object.entries(w).forEach(([k, v]) => { nw[k] = (nw[k] || 0) + v; });
    setWeights(nw);
    setStep(s => s + 1);
  };

  const reset = () => {
    setWeights({});
    setStep(0);
  };

  const progress = Math.min(step, 3) / 3;

  return (
    <section style={{ padding: '56px 32px 96px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <span className="live-dot"/>
          <span className="eyebrow">
            En vivo · {studentCount !== null ? studentCount.toLocaleString('es-ES') : '—'} alumnos orientados este curso
          </span>
        </div>

        <div className="hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.15fr 1fr',
          gap: 56,
          alignItems: 'start',
        }}>
          {/* Columna izquierda */}
          <div>
            <h1 className="hero-h1" style={{
              fontFamily: 'var(--font-instrument-serif), Georgia, serif',
              fontSize: 'clamp(44px, 5.6vw, 80px)',
              lineHeight: 1.06,
              letterSpacing: '-0.025em',
              fontWeight: 400,
              margin: 0,
              color: '#14152B',
            }}>
              La carrera correcta,
              <br/>
              <span style={{ fontStyle: 'italic', color: '#3B3FDB' }}>antes</span> de pedir nota.
            </h1>

            <p style={{
              marginTop: 40, maxWidth: 520,
              fontSize: 18, lineHeight: 1.5, color: '#3A3C55',
            }}>
              Elentio es el copiloto de orientación que cruza los gustos del alumno, sus aptitudes y
              la demanda real del mercado laboral español — en los <em>930</em> grados universitarios disponibles.
            </p>

            <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
              <Link href="/solicitar-licencia" className="btn-p lg" style={{ textDecoration: 'none' }}>
                Solicitar licencia para tu centro
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 8 }}>
                  <path d="M4 8h8M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <button className="btn-g lg" type="button">
                Ver demo de 2 min
              </button>
            </div>

            <div style={{
              marginTop: 64,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24,
              borderTop: '1px solid rgba(20,21,43,0.1)',
              paddingTop: 28,
            }}>
              {[
                ['930', 'grados universitarios'],
                ['3', 'modelos psicométricos'],
                ['94%', 'de alumnos recomiendan'],
              ].map(([n, l]) => (
                <div key={l}>
                  <div style={{
                    fontFamily: 'var(--font-instrument-serif), serif',
                    fontSize: 46, lineHeight: 1,
                    color: '#14152B', letterSpacing: '-0.02em',
                  }}>{n}</div>
                  <div style={{ fontSize: 13, color: '#5A5C72', marginTop: 6 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz vivo */}
          <div className="quiz-card hero-quiz">
            <div className="quiz-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ElentioMark size={18} stroke="#14152B" accent="#3B3FDB"/>
                <span style={{ fontSize: 12, color: '#5A5C72', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Demo interactiva
                </span>
              </div>
              {step < 3 && (
                <span style={{ fontSize: 12, color: '#5A5C72' }}>
                  {step + 1} / 3
                </span>
              )}
            </div>

            <div style={{ height: 3, background: 'rgba(20,21,43,0.08)', borderRadius: 2, overflow: 'hidden', marginTop: 12 }}>
              <div style={{
                height: '100%',
                width: `${progress * 100}%`,
                background: '#3B3FDB',
                transition: 'width 0.4s cubic-bezier(.2,.8,.2,1)',
              }}/>
            </div>

            {step < 3 ? (
              <div key={step} className="quiz-body lfade">
                <h3 className="quiz-q">{QUICK_QUIZ[step].q}</h3>
                <div className="quiz-answers">
                  {QUICK_QUIZ[step].a.map((a, i) => (
                    <button key={i} className="quiz-answer" onClick={() => answer(a.w)}>
                      <span className="quiz-answer-dot">{String.fromCharCode(65 + i)}</span>
                      <span>{a.t}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="quiz-body lfade">
                <h3 className="quiz-q" style={{ marginBottom: 6 }}>Tu perfil preliminar</h3>
                <p style={{ fontSize: 13, color: '#5A5C72', margin: '0 0 18px' }}>
                  Esto es solo una pincelada. El informe completo cruza tu perfil con 930 grados
                  y su proyección laboral.
                </p>

                <div className="profile-summary">
                  <div className="profile-row">
                    <span className="profile-label">Rasgos dominantes</span>
                    <div className="profile-tags">
                      <span className="profile-tag">Analítico</span>
                      <span className="profile-tag">Curioso</span>
                      <span className="profile-tag">Colaborativo</span>
                    </div>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Entornos en los que brillas</span>
                    <div className="profile-tags">
                      <span className="profile-tag">Equipo pequeño</span>
                      <span className="profile-tag">Autonomía alta</span>
                    </div>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Áreas sugeridas a explorar</span>
                    <div className="profile-tags">
                      <span className="profile-tag accent">Ciencia y datos</span>
                      <span className="profile-tag accent">Humanidades aplicadas</span>
                    </div>
                  </div>
                </div>

                <button className="btn-g sm" onClick={reset} style={{ marginTop: 18 }}>
                  ↻ Empezar de nuevo
                </button>
              </div>
            )}

            <div className="quiz-footer">
              <ModelBadge name="MBTI" active={step >= 1}/>
              <ModelBadge name="RIASEC" active={step >= 2}/>
              <ModelBadge name="NEO Big Five" active={step >= 3}/>
            </div>
          </div>
        </div>

        {/* Tira de centros */}
        <div style={{ marginTop: 96 }}>
          <p className="eyebrow" style={{ textAlign: 'center', marginBottom: 24 }}>
            768 centros educativos ya orientan con Elentio
          </p>
          <div className="marquee">
            <div className="marquee-track">
              {[...'ABCDEFGHABCDEFGH'].map((_, i) => (
                <div key={i} className="centro-pill">
                  <span className="centro-dot"/>
                  {[
                    'Col. San Patricio', 'IES Ramiro de Maeztu', 'Liceo Europeo',
                    'Col. Base', 'IES Cardenal Cisneros', 'Col. Alemán Madrid',
                    'British Council School', 'IES Isabel la Católica',
                  ][i % 8]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

function ChatDemo() {
  return (
    <div className="demo-frame">
      <div className="demo-chip">elentio · chat</div>
      <div className="chat-msg bot">Cuéntame: ¿qué asignatura te deja pensando aunque suene el timbre?</div>
      <div className="chat-msg user">Filosofía y a veces Biología</div>
      <div className="chat-msg bot">Interesante combinación. ¿Te atraen más las <em>preguntas sin respuesta</em> o los <em>mecanismos que puedes medir</em>?</div>
      <div className="chat-msg user typing"><span/><span/><span/></div>
    </div>
  );
}

function ModelsDemo() {
  return (
    <div className="demo-frame">
      <div className="demo-chip">análisis en curso</div>
      <div className="model-cards">
        <div className="model-card">
          <div className="model-card-name">MBTI</div>
          <div className="model-card-val">INTJ <span>· Arquitecto</span></div>
          <div className="model-bar"><span style={{ width: '82%', background: '#3B3FDB' }}/></div>
        </div>
        <div className="model-card">
          <div className="model-card-name">RIASEC</div>
          <div className="model-card-val">I-A-S</div>
          <div className="model-radar">
            <svg viewBox="0 0 100 100" width="100%" height="80">
              <polygon points="50,10 85,32 78,72 22,72 15,32" fill="none" stroke="rgba(20,21,43,0.15)"/>
              <polygon points="50,18 80,38 70,68 28,68 22,38" fill="rgba(59,63,219,0.18)" stroke="#3B3FDB" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>
        <div className="model-card">
          <div className="model-card-name">NEO Big Five</div>
          <div className="big5">
            {[['Apertura', 88], ['Respons.', 74], ['Extrav.', 42], ['Amab.', 61], ['Neurot.', 28]].map(([k, v]) => (
              <div key={k} className="big5-row">
                <span>{k}</span>
                <div className="big5-bar"><span style={{ width: `${v}%` }}/></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CarreraDemo() {
  return (
    <div className="demo-frame">
      <div className="demo-chip">5 mejores coincidencias</div>
      {[
        { n: 'Matemáticas', m: 96, r: 'I·C·R', s: '€30–78k', g: '+22%' },
        { n: 'Ing. Informática', m: 93, r: 'I·R·C', s: '€34–72k', g: '+26%' },
        { n: 'Biotecnología', m: 88, r: 'I·R·A', s: '€28–58k', g: '+18%' },
        { n: 'Física', m: 84, r: 'I·R·A', s: '€28–54k', g: '+14%' },
        { n: 'Filosofía', m: 71, r: 'I·A·S', s: '€20–38k', g: '+3%' },
      ].map((c, i) => (
        <div key={c.n} className="carrera-row">
          <div className="carrera-rank">{i + 1}</div>
          <div style={{ flex: 1 }}>
            <div className="carrera-name">{c.n}</div>
            <div className="carrera-meta">RIASEC {c.r} · {c.s} · {c.g} demanda 5a</div>
          </div>
          <div className="carrera-score">{c.m}</div>
        </div>
      ))}
    </div>
  );
}

function InformeDemo() {
  return (
    <div className="demo-frame">
      <div className="demo-chip">2º Bachillerato B · 28 alumnos</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { n: '18', l: 'vocación clara', hl: false },
          { n: '7', l: 'dudan entre 2 áreas', hl: false },
          { n: '3', l: 'necesita tutoría 1:1', hl: true },
          { n: '12', l: 'consideran FP superior', hl: false },
        ].map(({ n, l, hl }) => (
          <div key={l} className={`stat-block${hl ? ' hl' : ''}`}>
            <div className="stat-n">{n}</div>
            <div className="stat-l">{l}</div>
          </div>
        ))}
      </div>
      <div className="informe-bar">
        <span>Áreas más elegidas</span>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <div style={{ flex: 8, background: '#3B3FDB', height: 6, borderRadius: 3 }}/>
          <div style={{ flex: 6, background: '#8B63E8', height: 6, borderRadius: 3 }}/>
          <div style={{ flex: 4, background: '#D9A647', height: 6, borderRadius: 3 }}/>
          <div style={{ flex: 3, background: 'rgba(20,21,43,0.18)', height: 6, borderRadius: 3 }}/>
        </div>
        <div className="informe-leg">
          <span><i style={{ background: '#3B3FDB' }}/>STEM</span>
          <span><i style={{ background: '#8B63E8' }}/>Social</span>
          <span><i style={{ background: '#D9A647' }}/>Arte</span>
          <span><i style={{ background: 'rgba(20,21,43,0.18)' }}/>Otras</span>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const [active, setActive] = useState(0);
  const steps = [
    { n: '01', t: 'El alumno conversa con Elentio', d: 'Un chat adaptativo formula entre 8 y 14 preguntas. No es un formulario: la IA reformula según las respuestas, detecta inconsistencias y profundiza en intereses reales.', demo: <ChatDemo/> },
    { n: '02', t: 'Tres modelos calibrados', d: 'Las respuestas activan simultáneamente MBTI (16 tipos), RIASEC (6 intereses) y NEO Big Five (5 rasgos). Trabajamos con las versiones académicas, no con adaptaciones para publicidad.', demo: <ModelsDemo/> },
    { n: '03', t: 'Cruce con 930 grados', d: 'Cada grado está etiquetado con perfil psicométrico + demanda laboral a 5 años + salario mediano + nota de corte promedio. El motor devuelve las 5 mejores coincidencias con justificación narrativa.', demo: <CarreraDemo/> },
    { n: '04', t: 'Informe para el orientador', d: 'El tutor recibe una vista agregada por clase: quién necesita conversación, quién tiene vocación clara, qué grupos coinciden. Exportable a PDF.', demo: <InformeDemo/> },
  ];

  return (
    <section style={{ padding: '120px 32px', background: '#F1EEE5', borderTop: '1px solid rgba(20,21,43,0.06)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ maxWidth: 720, marginBottom: 72 }}>
          <p className="eyebrow" style={{ marginBottom: 16 }}>Cómo funciona</p>
          <h2 style={{
            fontFamily: 'var(--font-instrument-serif), serif',
            fontSize: 'clamp(40px, 4.6vw, 64px)',
            lineHeight: 1.02, letterSpacing: '-0.02em',
            fontWeight: 400, margin: 0, color: '#14152B',
          }}>
            De <em style={{ color: '#3B3FDB' }}>"no sé qué estudiar"</em> a un plan defendible
            en cuatro pasos.
          </h2>
        </div>

        <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 56, alignItems: 'start' }}>
          <div>
            {steps.map((s, i) => (
              <button
                key={i}
                className={`step-row${active === i ? ' active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                <div className="step-n">{s.n}</div>
                <div style={{ flex: 1 }}>
                  <div className="step-t">{s.t}</div>
                  <div className="step-d">{s.d}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="step-demo-wrap">
            <div key={active} className="lfade">
              {steps[active].demo}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Explorer ──────────────────────────────────────────────────────────────────

const CAREERS = [
  { id: 'medicina', name: 'Medicina', field: 'Salud', riasec: ['I','S','A'], mbti: ['ISFJ','INFJ','ISTJ'], demand: 96, growth: '+12%', salary: '€42–68k', years: 6 },
  { id: 'informatica', name: 'Ing. Informática', field: 'Tecnología', riasec: ['I','R','C'], mbti: ['INTJ','INTP','ISTP'], demand: 98, growth: '+26%', salary: '€34–72k', years: 4 },
  { id: 'psicologia', name: 'Psicología', field: 'C. Sociales', riasec: ['S','I','A'], mbti: ['INFJ','ENFP','INFP'], demand: 78, growth: '+8%', salary: '€24–48k', years: 4 },
  { id: 'ade', name: 'ADE', field: 'Negocios', riasec: ['E','C','S'], mbti: ['ESTJ','ENTJ','ENTP'], demand: 84, growth: '+5%', salary: '€28–85k', years: 4 },
  { id: 'arquitectura', name: 'Arquitectura', field: 'Diseño', riasec: ['A','R','I'], mbti: ['INTJ','ISTP','INFJ'], demand: 62, growth: '+2%', salary: '€26–55k', years: 5 },
  { id: 'biotecnologia', name: 'Biotecnología', field: 'Ciencia', riasec: ['I','R','A'], mbti: ['INTJ','INTP','ISTJ'], demand: 88, growth: '+18%', salary: '€28–58k', years: 4 },
  { id: 'derecho', name: 'Derecho', field: 'Humanidades', riasec: ['E','S','C'], mbti: ['ESTJ','ENTJ','INTJ'], demand: 70, growth: '+1%', salary: '€26–95k', years: 4 },
  { id: 'matematicas', name: 'Matemáticas', field: 'Ciencia', riasec: ['I','C','R'], mbti: ['INTJ','INTP','ISTJ'], demand: 92, growth: '+22%', salary: '€30–78k', years: 4 },
  { id: 'comunicacion', name: 'Com. Audiovisual', field: 'Comunicación', riasec: ['A','E','S'], mbti: ['ENFP','ESFP','ENTP'], demand: 64, growth: '+6%', salary: '€20–48k', years: 4 },
  { id: 'enfermeria', name: 'Enfermería', field: 'Salud', riasec: ['S','I','R'], mbti: ['ISFJ','ESFJ','ENFJ'], demand: 94, growth: '+14%', salary: '€24–40k', years: 4 },
  { id: 'bellas-artes', name: 'Bellas Artes', field: 'Arte', riasec: ['A','I','E'], mbti: ['INFP','ISFP','ENFP'], demand: 48, growth: '+3%', salary: '€18–42k', years: 4 },
  { id: 'magisterio', name: 'Ed. Primaria', field: 'Educación', riasec: ['S','A','E'], mbti: ['ENFJ','ESFJ','INFJ'], demand: 72, growth: '+4%', salary: '€22–36k', years: 4 },
];

function demandColor(d) {
  if (d >= 90) return '#5BD99C';
  if (d >= 75) return '#D9A647';
  return '#B65A6A';
}

function riasecLabel(code) {
  return { R: 'Realista', I: 'Investigador', A: 'Artístico', S: 'Social', E: 'Emprendedor', C: 'Convencional' }[code] || code;
}

function Explorer() {
  const fields = ['Todas', ...Array.from(new Set(CAREERS.map(c => c.field)))];
  const [field, setField] = useState('Todas');
  const [sort, setSort] = useState('demand');
  const [hovered, setHovered] = useState(null);

  let list = field === 'Todas' ? CAREERS : CAREERS.filter(c => c.field === field);
  list = [...list].sort((a, b) => {
    if (sort === 'demand') return b.demand - a.demand;
    if (sort === 'growth') return parseFloat(b.growth) - parseFloat(a.growth);
    return a.name.localeCompare(b.name);
  });

  return (
    <section style={{ padding: '120px 32px', background: '#14152B', color: '#F5F2EA' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 48, gap: 32, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 640 }}>
            <p className="eyebrow" style={{ marginBottom: 16, color: 'rgba(245,242,234,0.55)' }}>Explora el catálogo</p>
            <h2 style={{
              fontFamily: 'var(--font-instrument-serif), serif',
              fontSize: 'clamp(40px, 4.6vw, 64px)',
              lineHeight: 1.02, letterSpacing: '-0.02em',
              fontWeight: 400, margin: 0,
            }}>
              930 grados. <em style={{ color: '#D9A647' }}>Datos reales</em> detrás de cada uno.
            </h2>
          </div>
          <div className="sort-chips">
            <button className={sort === 'demand' ? 'active' : ''} onClick={() => setSort('demand')}>Demanda</button>
            <button className={sort === 'growth' ? 'active' : ''} onClick={() => setSort('growth')}>Crecimiento</button>
            <button className={sort === 'alpha' ? 'active' : ''} onClick={() => setSort('alpha')}>Orden A–Z</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {fields.map(f => (
            <button key={f} className={`field-chip${field === f ? ' active' : ''}`} onClick={() => setField(f)}>
              {f}
            </button>
          ))}
        </div>

        <div className="carreras-grid">
          {list.map(c => (
            <div
              key={c.id}
              className="carrera-card"
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="carrera-card-top">
                <div className="carrera-card-field">{c.field}</div>
                <div className="carrera-card-demand">
                  <span className="demand-dot" style={{ background: demandColor(c.demand) }}/>
                  {c.demand}
                </div>
              </div>
              <h3 className="carrera-card-name">{c.name}</h3>
              <div className="carrera-card-meta">
                <span>{c.years} años</span>
                <span>·</span>
                <span>{c.salary}</span>
                <span>·</span>
                <span style={{ color: '#D9A647' }}>{c.growth}</span>
              </div>

              <div className={`carrera-card-reveal${hovered === c.id ? ' show' : ''}`}>
                <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,242,234,0.5)', marginBottom: 8 }}>
                  Perfil ideal
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {c.mbti.map(m => <span key={m} className="mbti-tag">{m}</span>)}
                </div>
                <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,242,234,0.5)', marginBottom: 8 }}>
                  RIASEC
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {c.riasec.map(r => <span key={r} className="riasec-tag">{riasecLabel(r)}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link href="/solicitar-licencia" className="btn-o lg" style={{ textDecoration: 'none' }}>
            Ver los 930 grados
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 8 }}>
              <path d="M4 8h8M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── For Centers ───────────────────────────────────────────────────────────────

function FeatureIcon({ name }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'dashboard':
      return <svg {...common}><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="5" rx="1"/><rect x="13" y="10" width="8" height="11" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/></svg>;
    case 'lock':
      return <svg {...common}><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>;
    case 'support':
      return <svg {...common}><path d="M21 12a9 9 0 10-9 9"/><path d="M17 21h4v-4"/><circle cx="12" cy="12" r="3"/></svg>;
    default: return null;
  }
}

function ForCenters() {
  const features = [
    { icon: 'dashboard', t: 'Panel del orientador', d: 'Vista agregada por clase, curso y centro. Detecta alumnos con señales de duda antes de las tutorías.' },
    { icon: 'lock', t: 'RGPD por diseño', d: 'Datos alojados en UE, encriptados en reposo. Contrato de encargado de tratamiento incluido.' },
    { icon: 'support', t: 'Acompañamiento pedagógico', d: 'Formación inicial para orientadores y revisión trimestral de datos con nuestro equipo.' },
  ];

  return (
    <section style={{ padding: '120px 32px', background: '#FAF8F3' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div className="centers-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
          <div className="center-sticky" style={{ position: 'sticky', top: 100 }}>
            <p className="eyebrow" style={{ marginBottom: 16 }}>Para centros educativos</p>
            <h2 style={{
              fontFamily: 'var(--font-instrument-serif), serif',
              fontSize: 'clamp(40px, 4.6vw, 60px)',
              lineHeight: 1.02, letterSpacing: '-0.02em',
              fontWeight: 400, margin: 0, color: '#14152B',
            }}>
              Una herramienta pensada para la <em style={{ color: '#3B3FDB' }}>jornada real</em> del orientador.
            </h2>
            <p style={{ marginTop: 24, color: '#3A3C55', fontSize: 17, lineHeight: 1.55, maxWidth: 480 }}>
              Implantación guiada, licencias por alumno y por tutor, soporte en español y
              métricas que tu dirección entenderá sin explicaciones.
            </p>

            <div className="center-cta-card">
              <div style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5A5C72' }}>
                Modelo de licencia
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
                <span style={{ fontFamily: 'var(--font-instrument-serif), serif', fontSize: 44, lineHeight: 1.1, color: '#14152B', letterSpacing: '-0.02em' }}>A medida</span>
              </div>
              <div style={{ fontSize: 13, color: '#5A5C72', marginTop: 8, lineHeight: 1.5 }}>
                Adaptamos la propuesta al tamaño de tu centro, número de alumnos y curso de inicio.
                Incluye test completo, informe, panel del orientador y sesión de formación.
              </div>
              <Link href="/solicitar-licencia" className="btn-p lg" style={{ marginTop: 20, width: '100%', textDecoration: 'none', justifyContent: 'center' }}>
                Solicitar propuesta para mi centro
              </Link>
              <div style={{ fontSize: 12, color: '#8A8DA1', marginTop: 12, textAlign: 'center' }}>
                Respuesta en menos de 48 horas laborables
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} className="feature-row">
                <div className="feature-icon">
                  <FeatureIcon name={f.icon}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="feature-t">{f.t}</div>
                  <div className="feature-d">{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section style={{ padding: '140px 32px', background: '#FAF8F3' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', marginBottom: 28 }}>
          <ElentioMark size={44} stroke="#14152B" accent="#3B3FDB"/>
        </div>
        <h2 style={{
          fontFamily: 'var(--font-instrument-serif), serif',
          fontSize: 'clamp(48px, 6vw, 84px)',
          lineHeight: 1.0, letterSpacing: '-0.025em',
          fontWeight: 400, margin: 0, color: '#14152B',
        }}>
          Un curso escolar cambia una vida.
          <br/>
          <em style={{ color: '#3B3FDB' }}>Empieza el próximo.</em>
        </h2>
        <p style={{ maxWidth: 560, margin: '28px auto 0', fontSize: 18, color: '#3A3C55', lineHeight: 1.55 }}>
          Implantamos Elentio antes del inicio de curso en menos de 3 semanas, incluyendo
          formación para el claustro.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
          <Link href="/solicitar-licencia" className="btn-p lg" style={{ textDecoration: 'none' }}>Solicitar licencia</Link>
          <Link href="/login" className="btn-g lg" style={{ textDecoration: 'none' }}>Acceder a la plataforma</Link>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function LandingFooter() {
  const cols = [
    ['Producto', ['Test vocacional', 'Panel del orientador', 'Informe del alumno', 'Proyección laboral']],
    ['Centros', ['Planes y precios', 'Casos de éxito', 'Formación', 'Soporte']],
    ['Metodología', ['MBTI', 'RIASEC', 'NEO Big Five', 'Datos laborales']],
    ['Empresa', ['Sobre nosotros', 'Blog', 'Contacto', 'Trabaja con nosotros']],
  ];
  return (
    <footer style={{ background: '#14152B', color: '#F5F2EA', padding: '72px 32px 32px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(4, 1fr)', gap: 48, marginBottom: 56 }}>
          <div>
            <ElentioLogo size={24} inverted/>
            <p style={{ color: 'rgba(245,242,234,0.6)', fontSize: 14, lineHeight: 1.55, marginTop: 18, maxWidth: 260 }}>
              Orientación vocacional con IA y rigor psicométrico, para centros educativos españoles.
            </p>
          </div>
          {cols.map(([t, items]) => (
            <div key={t}>
              <div style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,242,234,0.5)', marginBottom: 16 }}>{t}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                {items.map(item => (
                  <li key={item}><a href="#" style={{ color: '#F5F2EA', textDecoration: 'none', fontSize: 14 }}>{item}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(245,242,234,0.12)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontSize: 13, color: 'rgba(245,242,234,0.5)' }}>
            © 2026 Elentio Orientación S.L. · Madrid, España
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacidad', 'Términos', 'Cookies', 'Aviso legal'].map(l => (
              <a key={l} href="#" style={{ color: 'rgba(245,242,234,0.5)', textDecoration: 'none', fontSize: 13 }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="landing">
      <LandingNavbar/>
      <Hero/>
      <HowItWorks/>
      <Explorer/>
      <ForCenters/>
      <FinalCTA/>
      <LandingFooter/>
    </div>
  );
}
