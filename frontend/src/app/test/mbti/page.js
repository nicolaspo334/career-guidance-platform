'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isUserLoggedIn, submitMbtiTest } from '@/lib/api';

// ── Fase 2: actividades RIASEC (2 por tipo, anclas de frecuencia conductual) ──

const RIASEC_ACTIVITIES = [
  { id: 'r1', type: 'R', text: 'Reparar, montar o ajustar aparatos, máquinas o sistemas físicos' },
  { id: 'r2', type: 'R', text: 'Hacer trabajo manual o físico al aire libre (construcción, taller, deporte…)' },
  { id: 'i1', type: 'I', text: 'Analizar datos, resolver problemas matemáticos o escribir código' },
  { id: 'i2', type: 'I', text: 'Leer o investigar a fondo cómo funciona algo (ciencia, tecnología, sistemas)' },
  { id: 'a1', type: 'A', text: 'Diseñar, dibujar, fotografiar o crear contenido visual' },
  { id: 'a2', type: 'A', text: 'Escribir textos creativos, componer música o actuar en escena' },
  { id: 's1', type: 'S', text: 'Escuchar, apoyar o aconsejar a alguien que tiene un problema' },
  { id: 's2', type: 'S', text: 'Explicar, enseñar o guiar a otras personas (clases, talleres, tutorías)' },
  { id: 'e1', type: 'E', text: 'Liderar un grupo, organizar un proyecto o tomar decisiones importantes' },
  { id: 'e2', type: 'E', text: 'Convencer, negociar o vender una idea o producto a otras personas' },
  { id: 'c1', type: 'C', text: 'Mantener registros ordenados, gestionar datos o seguir protocolos paso a paso' },
  { id: 'c2', type: 'C', text: 'Trabajar con hojas de cálculo, bases de datos o sistemas administrativos' },
];

const FREQ_LABELS = ['', 'Nunca o casi nunca', 'Pocas veces', 'A veces', 'A menudo', 'Siempre o casi siempre'];

// ── Fase 3: habilidades (6 ítems Likert de frecuencia) ───────────────────────

const SKILLS_ITEMS = [
  { id: 'sk1', area: 'Lógica y análisis', text: '¿Con qué frecuencia resuelves problemas aplicando lógica, matemáticas o razonamiento sistemático?' },
  { id: 'sk2', area: 'Comunicación', text: '¿Con qué frecuencia te expresas con claridad y fluidez, ya sea hablando o escribiendo para otros?' },
  { id: 'sk3', area: 'Creatividad', text: '¿Con qué frecuencia propones ideas originales o abordas los problemas desde ángulos inesperados?' },
  { id: 'sk4', area: 'Habilidad digital', text: '¿Con qué frecuencia usas herramientas digitales, datos o tecnología para crear o resolver algo?' },
  { id: 'sk5', area: 'Habilidades sociales', text: '¿Con qué frecuencia coordinas, medias o ayudas a que las personas de un grupo trabajen bien juntas?' },
  { id: 'sk6', area: 'Planificación', text: '¿Con qué frecuencia planificas tus tareas con antelación y las llevas a cabo de forma ordenada?' },
];

// ── Fase 4: valores laborales (8 pares, 2 por dimensión) ──────────────────────
// 2 pares por dimensión → promedio → 3 niveles posibles (20 / 50 / 80)
// vs. 1 par → solo 2 niveles (20 / 80). Mejora representatividad y reduce ruido.

const VALUES_PAIRS = [
  // Autonomía (v1 + v5)
  { id: 'v1', dim: 'autonomy',     A: 'Autonomía para decidir cómo hago mi trabajo',                    B: 'Seguridad y estabilidad en mi empleo' },
  { id: 'v5', dim: 'autonomy',     A: 'Definir yo mismo los objetivos y cómo alcanzarlos',              B: 'Tener objetivos claros marcados por la organización y centrarme en ejecutarlos bien' },
  // Innovación (v2 + v6)
  { id: 'v2', dim: 'innovative',   A: 'Crear cosas nuevas e innovar constantemente',                    B: 'Aplicar métodos probados con rigor y precisión' },
  { id: 'v6', dim: 'innovative',   A: 'Explorar ideas sin saber si funcionarán, asumiendo el riesgo',   B: 'Optimizar lo que ya existe y obtener resultados predecibles' },
  // Impacto social (v3 + v7)
  { id: 'v3', dim: 'socialImpact', A: 'Impacto social: mejorar la vida de personas o comunidades',     B: 'Impacto económico: generar valor económico o riqueza' },
  { id: 'v7', dim: 'socialImpact', A: 'Saber que lo que produzco ayuda directamente a personas reales', B: 'Generar resultados económicos medibles para mi empresa' },
  // Crecimiento (v4 + v8)
  { id: 'v4', dim: 'growth',       A: 'Reconocimiento público y visibilidad',                           B: 'Aprendizaje continuo y desarrollo personal' },
  { id: 'v8', dim: 'growth',       A: 'Dominar una habilidad en profundidad, aunque sea poco visible',  B: 'Progresar en la jerarquía y tener más responsabilidad y reconocimiento' },
];

// ── Fase 1: preguntas abiertas (MBTI + habilidades + valores) ─────────────────

const QUESTIONS = [
  { id: 1,  tag: 'Energía social',         text: 'Después de una semana intensa, ¿qué prefieres hacer en tu tiempo libre y por qué?',                                                               hint: 'Ejemplo: quedarte en casa solo, salir con amigos, mezcla de ambos…' },
  { id: 2,  tag: 'Forma de pensar',        text: 'Cuando tienes que aprender algo nuevo, ¿cómo lo abordas? ¿Partes de la teoría general o prefieres ir directo a la práctica?',                   hint: 'Piensa en cómo estudias o te preparas para algo.' },
  { id: 3,  tag: 'Toma de decisiones',     text: 'Un amigo comete un error importante que le ha perjudicado. ¿Cómo reaccionas y qué le dices?',                                                  hint: 'Describe tu respuesta habitual, no la ideal.' },
  { id: 4,  tag: 'Organización',           text: 'Describe cómo sueles organizar tu semana cuando tienes múltiples cosas pendientes.',                                                             hint: 'Ejemplo: listas detalladas, planificación anticipada, vas viendo…' },
  { id: 5,  tag: 'Resolución de problemas',text: 'Cuando te enfrentas a un problema que no sabes cómo resolver, ¿cuál es tu primer instinto?',                                                    hint: 'Ejemplo: buscas pasos concretos, imaginas alternativas, pides ayuda…' },
  { id: 6,  tag: 'Gestión emocional',      text: 'Cuando algo te sale mal o estás bajo presión (examen, conflicto, sorpresa negativa), ¿cómo te afecta y cómo lo gestionas?',                   hint: 'Sé honesto: ¿te recuperas rápido, te cuesta mucho, necesitas hablar con alguien…?' },
  { id: 7,  tag: 'Valores al decidir',     text: 'Al tomar una decisión importante que afecta a otros, ¿qué pesa más: los datos objetivos y el resultado esperado, o el impacto emocional?',    hint: 'Describe cómo has tomado decisiones reales en el pasado.' },
  { id: 8,  tag: 'Adaptación y cambio',    text: 'Si los planes cambian de forma inesperada, ¿cómo reaccionas? ¿Lo ves como oportunidad o como problema?',                                      hint: 'Piensa en situaciones reales donde los planes se han torcido.' },
  { id: 9,  tag: 'Habilidades personales', text: '¿En qué tipo de tareas sientes que rindes mejor o te resulta más fácil destacar? ¿Por qué crees que es así?',                                  hint: 'Ejemplo: explicar ideas, hacer cálculos, crear cosas, organizar, convencer a alguien, trabajar con datos…' },
  { id: 10, tag: 'Valores profesionales',  text: '¿Qué es lo que más valorarías en tu trabajo ideal? ¿Qué haría que sintieras que vale la pena lo que haces cada día?',                         hint: 'Ejemplo: ayudar a otros, autonomía, aprender constantemente, ganar dinero, crear cosas, reconocimiento…' },
];

const MIN_LENGTH = 30;

// ── Scoring helpers ───────────────────────────────────────────────────────────

function computeRiasec(ratings) {
  const types = ['R', 'I', 'A', 'S', 'E', 'C'];
  const out = {};
  for (const t of types) {
    const items = RIASEC_ACTIVITIES.filter(a => a.type === t);
    const sum = items.reduce((acc, a) => acc + (ratings[a.id] || 1), 0);
    out[t] = Math.round(((sum - items.length) / (items.length * 4)) * 100);
  }
  return out;
}

function computeSkills(skillRatings) {
  const norm = (v) => Math.round(((v - 1) / 4) * 100);
  return {
    logic:    norm(skillRatings.sk1 || 3),
    verbal:   norm(skillRatings.sk2 || 3),
    creative: norm(skillRatings.sk3 || 3),
    digital:  norm(skillRatings.sk4 || 3),
    social:   norm(skillRatings.sk5 || 3),
    planning: norm(skillRatings.sk6 || 3),
  };
}

function computeValues(valuePicks) {
  const pick = (id, aScore, bScore) => {
    if (valuePicks[id] === 'A') return aScore;
    if (valuePicks[id] === 'B') return bScore;
    return 50;
  };
  const avg2 = (s1, s2) => Math.round((s1 + s2) / 2);
  return {
    autonomy:     avg2(pick('v1', 80, 20), pick('v5', 80, 20)),
    innovative:   avg2(pick('v2', 80, 20), pick('v6', 80, 20)),
    socialImpact: avg2(pick('v3', 80, 20), pick('v7', 80, 20)),
    growth:       avg2(pick('v4', 20, 80), pick('v8', 80, 20)),
  };
}

// ── Loading screen constants ──────────────────────────────────────────────────

const LOADING_STEPS = [
  { t: 'Recopilando tus respuestas',                    dur: 1200 },
  { t: 'Analizando rasgos psicométricos',               dur: 2200 },
  { t: 'Cruzando con 115 grados universitarios',        dur: 2700 },
  { t: 'Calculando el futuro laboral de cada carrera',  dur: 2000 },
  { t: 'Redactando tu informe personalizado',           dur: 1900 },
]; // total: 10000 ms

const LOADING_TIPS = [
  'No hay carreras "buenas" o "malas". Hay carreras que encajan contigo.',
  'El 38% de los alumnos cambia de opinión tras ver su informe completo.',
  'Tu carrera ideal puede ser una que aún no habías considerado.',
  'Los datos laborales se actualizan con fuentes del WEF y O*NET.',
];

const CHIP_POOL = [
  { t: 'Curiosidad: alta',       c: '#3B3FDB' },
  { t: 'Pensamiento abstracto',  c: '#8B63E8' },
  { t: 'Matemáticas',            c: '#D9A647' },
  { t: 'Trabajo en equipo',      c: '#2D8F5A' },
  { t: 'Liderazgo: medio',       c: '#3B3FDB' },
  { t: 'Creatividad',            c: '#D9A647' },
  { t: 'Análisis de datos',      c: '#8B63E8' },
  { t: 'Empatía: alta',          c: '#2D8F5A' },
  { t: 'Atención al detalle',    c: '#3B3FDB' },
  { t: 'RIASEC: I-A-S',          c: '#D9A647' },
  { t: 'Apertura: 88',           c: '#3B3FDB' },
];

// ── Loading canvas (SVG visualization) ───────────────────────────────────────

function LoadingCanvas({ progress }) {
  const circ = 2 * Math.PI * 188;
  return (
    <svg viewBox="0 0 400 400" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <radialGradient id="lcCoreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#3B3FDB" stopOpacity="0.9"/>
          <stop offset="60%"  stopColor="#3B3FDB" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#3B3FDB" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="lcRingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#3B3FDB"/>
          <stop offset="100%" stopColor="#8B63E8"/>
        </linearGradient>
        <filter id="lcGlow">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Outer halo */}
      <circle cx="200" cy="200" r="170" fill="url(#lcCoreGrad)" opacity="0.08">
        <animate attributeName="r" values="170;180;170" dur="3s" repeatCount="indefinite"/>
      </circle>

      {/* Ring 1 – slow outer */}
      <g style={{ transformOrigin: '200px 200px', animation: 'lcSpin 18s linear infinite' }}>
        <ellipse cx="200" cy="200" rx="155" ry="155" stroke="rgba(20,21,43,0.1)" strokeWidth="1" fill="none" strokeDasharray="2 6"/>
        <ellipse cx="200" cy="200" rx="155" ry="155" stroke="url(#lcRingGrad)" strokeWidth="2" fill="none"
          strokeDasharray="40 600" strokeLinecap="round" filter="url(#lcGlow)"/>
      </g>

      {/* Ring 2 – mid reverse */}
      <g style={{ transformOrigin: '200px 200px', animation: 'lcSpin 12s linear infinite reverse' }}>
        <ellipse cx="200" cy="200" rx="120" ry="120" stroke="rgba(20,21,43,0.08)" strokeWidth="1" fill="none"/>
        <ellipse cx="200" cy="200" rx="120" ry="120" stroke="#D9A647" strokeWidth="2" fill="none"
          strokeDasharray="30 460" strokeLinecap="round" opacity="0.85"/>
      </g>

      {/* Ring 3 – fast inner */}
      <g style={{ transformOrigin: '200px 200px', animation: 'lcSpin 8s linear infinite' }}>
        <ellipse cx="200" cy="200" rx="85" ry="85" stroke="rgba(20,21,43,0.08)" strokeWidth="1" fill="none"/>
        <ellipse cx="200" cy="200" rx="85" ry="85" stroke="#8B63E8" strokeWidth="2" fill="none"
          strokeDasharray="22 320" strokeLinecap="round"/>
      </g>

      {/* Spokes */}
      <g style={{ transformOrigin: '200px 200px', animation: 'lcSpin 28s linear infinite' }}>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <line key={i} x1="200" y1="200"
              x2={200 + Math.cos(a) * 75} y2={200 + Math.sin(a) * 75}
              stroke="rgba(20,21,43,0.18)" strokeWidth="1" strokeDasharray="3 4"/>
          );
        })}
      </g>

      {/* Inner white circle */}
      <circle cx="200" cy="200" r="40" fill="#FAF8F3" stroke="#3B3FDB" strokeWidth="1.5"
        style={{ transformOrigin: '200px 200px', animation: 'lcScale 2.4s ease-in-out infinite' }}/>

      {/* Elentio mark (scaled) */}
      <g transform="translate(168 168)" style={{ transformOrigin: '200px 200px', animation: 'lcScale 2.4s ease-in-out infinite' }}>
        <circle cx="32" cy="32" r="28" stroke="#3B3FDB" strokeOpacity="0.25" strokeWidth="1" fill="none"/>
        <path d="M32 8 L32 32" stroke="#14152B" strokeWidth="2" strokeLinecap="round"/>
        <path d="M9 47 L32 32" stroke="#14152B" strokeWidth="2" strokeLinecap="round"/>
        <path d="M55 47 L32 32" stroke="#14152B" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="32" cy="32" r="5" fill="#3B3FDB"/>
        <circle cx="32" cy="32" r="9" stroke="#3B3FDB" strokeOpacity="0.4" strokeWidth="1.2" fill="none"/>
      </g>

      {/* Background arc track */}
      <circle cx="200" cy="200" r="188" fill="none" stroke="rgba(20,21,43,0.06)" strokeWidth="2"/>

      {/* Progress arc */}
      <circle cx="200" cy="200" r="188"
        fill="none" stroke="#3B3FDB" strokeWidth="2.5"
        strokeDasharray={`${(progress / 100) * circ} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 200 200)"
        style={{ transition: 'stroke-dasharray 0.4s ease' }}/>
    </svg>
  );
}

// ── Loading screen component ──────────────────────────────────────────────────

function LoadingScreen({ apiDone, onNavigate }) {
  const DURATION = 10000;
  const [progress, setProgress]   = useState(0);
  const [stepIdx, setStepIdx]     = useState(0);
  const [timerDone, setTimerDone] = useState(false);
  const [chips, setChips]         = useState([]);
  const [tipIdx, setTipIdx]       = useState(0);
  const chipIdRef                 = useRef(0);
  const navigatedRef              = useRef(false);

  // 10-second progress timer
  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = () => {
      const elapsed = performance.now() - start;
      const pct = Math.min(100, (elapsed / DURATION) * 100);
      setProgress(pct);
      let acc = 0, idx = LOADING_STEPS.length - 1;
      for (let i = 0; i < LOADING_STEPS.length; i++) {
        acc += LOADING_STEPS[i].dur;
        if (elapsed < acc) { idx = i; break; }
      }
      setStepIdx(idx);
      if (elapsed < DURATION) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimerDone(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Navigate when both timer and API are done
  useEffect(() => {
    if (timerDone && apiDone && !navigatedRef.current) {
      navigatedRef.current = true;
      onNavigate();
    }
  }, [timerDone, apiDone, onNavigate]);

  // Spawn floating data chips
  useEffect(() => {
    const spawn = () => {
      const pool = CHIP_POOL[Math.floor(Math.random() * CHIP_POOL.length)];
      const angle = Math.random() * Math.PI * 2;
      const r = 32 + Math.random() * 14;
      const x = 50 + Math.cos(angle) * r;
      const y = 50 + Math.sin(angle) * r;
      const id = chipIdRef.current++;
      setChips(cs => [...cs, { id, ...pool, x, y }]);
      setTimeout(() => {
        setChips(cs => cs.map(c => c.id === id ? { ...c, leaving: true } : c));
        setTimeout(() => setChips(cs => cs.filter(c => c.id !== id)), 500);
      }, 2400);
    };
    spawn(); spawn(); spawn();
    const iv = setInterval(spawn, 650);
    return () => clearInterval(iv);
  }, []);

  // Rotate tips every 4.5s
  useEffect(() => {
    const iv = setInterval(() => setTipIdx(i => (i + 1) % LOADING_TIPS.length), 4500);
    return () => clearInterval(iv);
  }, []);

  const remSec = Math.max(0, Math.ceil((DURATION - DURATION * progress / 100) / 1000));

  return (
    <>
      <style>{`
        @keyframes lcSpin  { to { transform: rotate(360deg); } }
        @keyframes lcScale { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes lcPulse { 0%,100% { opacity:.4; transform:scale(1); } 50% { opacity:1; transform:scale(1.25); } }
        @keyframes lcBullet { 0%,100% { transform:scale(0.5); opacity:.5; } 50% { transform:scale(1); opacity:1; } }
        @keyframes lcChipIn  { from { opacity:0; transform:translate(-50%,-50%) scale(0.6); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }
        @keyframes lcChipOut { to   { opacity:0; transform:translate(-50%,-50%) scale(0.7); } }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        background: '#FAF8F3',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
      }}>
        {/* Topbar */}
        <header style={{ padding: '22px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ElentioMark size={24}/>
            <span style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 22, color: '#14152B', letterSpacing: '-0.015em', fontWeight: 400 }}>
              elentio
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#5A5C72', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: '#3B3FDB', display: 'inline-block', animation: 'lcPulse 1.4s infinite' }}/>
            <span style={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 11 }}>Procesando</span>
          </div>
        </header>

        {/* Main two-column layout */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80,
          padding: '20px 40px 40px', alignItems: 'center',
          maxWidth: 1240, margin: '0 auto', width: '100%',
        }}>
          {/* Left: title + steps */}
          <div style={{ maxWidth: 520 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A5C72', fontWeight: 500, margin: 0 }}>
              Casi listo
            </p>
            <h1 style={{
              fontFamily: 'var(--font-instrument-serif), Georgia, serif',
              fontSize: 'clamp(40px, 4.6vw, 60px)', lineHeight: 1.04,
              letterSpacing: '-0.022em', fontWeight: 400, margin: '14px 0 0',
              color: '#14152B',
            }}>
              Estamos preparando<br/>
              <em style={{ fontStyle: 'italic', color: '#3B3FDB' }}>tu informe.</em>
            </h1>
            <p style={{ color: '#5A5C72', fontSize: 15, lineHeight: 1.55, marginTop: 18, maxWidth: 420 }}>
              Cruzando tus respuestas con tres modelos psicométricos y la demanda laboral
              de 115 grados universitarios. No tardamos mucho.
            </p>

            {/* Steps */}
            <div style={{ marginTop: 40, display: 'grid', gap: 4 }}>
              {LOADING_STEPS.map((s, i) => {
                const state = i < stepIdx ? 'done' : i === stepIdx ? 'active' : 'idle';
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 12px', borderRadius: 10,
                    background: state === 'active' ? 'rgba(59,63,219,0.06)' : 'transparent',
                    opacity: state === 'idle' ? 0.42 : 0.85,
                    transition: 'background 0.3s, opacity 0.3s',
                  }}>
                    {/* Bullet */}
                    <div style={{
                      width: 22, height: 22, borderRadius: 999, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                      background: state === 'done' ? '#2D8F5A' : 'transparent',
                      border: state === 'done' ? '1.5px solid #2D8F5A'
                            : state === 'active' ? '1.5px solid #3B3FDB'
                            : '1.5px solid rgba(20,21,43,0.2)',
                      transition: 'background 0.3s, border 0.3s',
                    }}>
                      {state === 'done' && (
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {state === 'active' && (
                        <span style={{
                          position: 'absolute', inset: 3, borderRadius: 999,
                          background: '#3B3FDB',
                          animation: 'lcBullet 1s ease-in-out infinite',
                        }}/>
                      )}
                    </div>
                    <span style={{ fontSize: 14, color: '#14152B', fontWeight: 500, flex: 1 }}>{s.t}</span>
                    <span style={{ fontSize: 11, color: '#8A8DA1', fontFamily: 'monospace' }}>
                      {state === 'done' ? '✓' : state === 'active' ? 'en curso' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: animated canvas */}
          <div style={{ position: 'relative', aspectRatio: '1/1', maxWidth: 520, width: '100%', margin: '0 auto' }}>
            <LoadingCanvas progress={progress}/>
            {chips.map(c => (
              <div key={c.id} style={{
                position: 'absolute',
                left: `${c.x}%`, top: `${c.y}%`,
                transform: 'translate(-50%,-50%)',
                padding: '6px 12px',
                background: '#fff',
                border: '1px solid rgba(20,21,43,0.08)',
                borderRadius: 999,
                fontSize: 12, color: '#14152B',
                whiteSpace: 'nowrap',
                boxShadow: '0 8px 24px -8px rgba(20,21,43,0.18)',
                display: 'flex', alignItems: 'center', gap: 6,
                pointerEvents: 'none',
                animation: c.leaving ? 'lcChipOut 0.5s ease forwards' : 'lcChipIn 0.6s ease both',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: c.c, flexShrink: 0, display: 'inline-block' }}/>
                {c.t}
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar + tip footer */}
        <div style={{ maxWidth: 1240, margin: '0 auto', width: '100%', padding: '0 40px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 12, color: '#5A5C72' }}>
            <span>{LOADING_STEPS[stepIdx]?.t || 'Finalizando'}…</span>
            <span>
              <strong style={{ fontFamily: 'monospace', color: '#14152B', fontWeight: 500 }}>{Math.round(progress)}%</strong>
              {' · '}{remSec > 0 ? `~${remSec}s` : 'casi listo'}
            </span>
          </div>
          <div style={{ height: 4, background: 'rgba(20,21,43,0.08)', borderRadius: 999, overflow: 'visible', position: 'relative' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #3B3FDB, #8B63E8)',
              borderRadius: 999,
              transition: 'width 0.4s cubic-bezier(.2,.8,.2,1)',
              position: 'relative',
            }}>
              <span style={{
                position: 'absolute', right: -4, top: '50%', transform: 'translateY(-50%)',
                width: 12, height: 12, borderRadius: 999,
                background: '#8B63E8',
                boxShadow: '0 0 12px #8B63E8',
                display: progress > 2 ? 'block' : 'none',
              }}/>
            </div>
          </div>
          <div style={{
            marginTop: 18, padding: '14px 18px',
            background: 'rgba(59,63,219,0.05)',
            border: '1px solid rgba(59,63,219,0.12)',
            borderRadius: 12,
            fontSize: 13, color: '#3A3C55',
            display: 'flex', alignItems: 'center', gap: 12,
            maxWidth: 720,
          }}>
            <span style={{
              flexShrink: 0, width: 24, height: 24, borderRadius: 999,
              background: '#3B3FDB', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-instrument-serif), Georgia, serif',
              fontSize: 14, fontStyle: 'italic',
            }}>"</span>
            <span style={{ fontStyle: 'italic', lineHeight: 1.45 }}>{LOADING_TIPS[tipIdx]}</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ── UI components ─────────────────────────────────────────────────────────────

function ElentioMark({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <circle cx="16" cy="16" r="14.5" stroke="#14152B" strokeOpacity="0.18" strokeWidth="1"/>
      <path d="M16 2 L16 16" stroke="#14152B" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M3.5 22.5 L16 16" stroke="#14152B" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M28.5 22.5 L16 16" stroke="#14152B" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="16" cy="16" r="2.6" fill="#3B3FDB"/>
      <circle cx="16" cy="16" r="5" stroke="#3B3FDB" strokeOpacity="0.35" strokeWidth="1"/>
    </svg>
  );
}

function TestHeader({ phase, current, total }) {
  const phaseLabel = () => {
    if (phase === 1) return `${current + 1} / ${total}`;
    if (phase === 2) return 'Intereses vocacionales';
    if (phase === 3) return 'Habilidades';
    if (phase === 4) return 'Valores profesionales';
    return '';
  };
  return (
    <header style={{
      background: 'rgba(250,248,243,0.92)', backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(20,21,43,0.08)',
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <ElentioMark size={22}/>
          <span style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 22, color: '#14152B', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: 1, paddingTop: 2 }}>
            elentio
          </span>
        </Link>
        <span style={{ fontSize: 13, color: '#8A8DA1' }}>
          {phase <= 4 ? `Fase ${phase} de 4` : ''}{phase <= 4 ? ' · ' : ''}{phaseLabel()}
        </span>
      </div>
    </header>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MbtiTest() {
  const [phase, setPhase] = useState(1);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(''));
  const [ratings, setRatings] = useState({});         // RIASEC
  const [skillRatings, setSkillRatings] = useState({}); // Skills
  const [valuePicks, setValuePicks] = useState({});   // Values
  const [error, setError] = useState('');
  const [apiDone, setApiDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoggedIn()) router.replace('/login');
  }, []);

  // ── Phase 5: loading ──────────────────────────────────────────────────────

  if (phase === 5) {
    return (
      <LoadingScreen
        apiDone={apiDone}
        onNavigate={() => router.push('/test/mbti/resultado')}
      />
    );
  }

  // ── Phase 4: values forced-choice ────────────────────────────────────────

  if (phase === 4) {
    const allPicked = VALUES_PAIRS.every(p => valuePicks[p.id] === 'A' || valuePicks[p.id] === 'B');
    const picked = VALUES_PAIRS.filter(p => valuePicks[p.id]).length;

    const handleSubmit = async () => {
      setPhase(5);
      setError('');
      try {
        const riasecScores  = computeRiasec(ratings);
        const skillsScores  = computeSkills(skillRatings);
        const valuesProfile = computeValues(valuePicks);
        const payload = QUESTIONS.map((q, i) => ({ question: q.text, answer: answers[i] }));
        const result = await submitMbtiTest(payload, riasecScores, skillsScores, valuesProfile);
        sessionStorage.setItem('elentio_mbti_result', JSON.stringify(result));

        // DEBUG: guardar snapshot completo en localStorage para análisis posterior (eliminar en producción)
        try {
          localStorage.setItem('elentio_debug_snapshot', JSON.stringify({
            timestamp: new Date().toISOString(),
            inputs: {
              openAnswers: QUESTIONS.map((q, i) => ({
                id: q.id, tag: q.tag, question: q.text, answer: answers[i],
              })),
              riasecRatings: RIASEC_ACTIVITIES.map(a => ({
                id: a.id, type: a.type, text: a.text, rating: ratings[a.id] ?? null,
              })),
              skillRatings: SKILLS_ITEMS.map(s => ({
                id: s.id, area: s.area, text: s.text, rating: skillRatings[s.id] ?? null,
              })),
              valuePicks: VALUES_PAIRS.map(p => ({
                id: p.id, A: p.A, B: p.B, chosen: valuePicks[p.id] ?? null,
              })),
            },
            computed: {
              riasecScores,
              skillsScores,
              valuesProfile,
            },
            result,
          }));
        } catch (_) {}

        setApiDone(true);
      } catch (e) {
        setError(e.message || 'Error al procesar el test. Inténtalo de nuevo.');
        setPhase(4);
      }
    };

    return (
      <div className="e-page">
        <TestHeader phase={4} current={0} total={VALUES_PAIRS.length}/>

        <div style={{ background: 'rgba(20,21,43,0.05)', height: 3 }}>
          <div style={{ height: '100%', width: `${(picked / VALUES_PAIRS.length) * 100}%`, background: '#3B3FDB', transition: 'width 0.4s ease' }}/>
        </div>

        <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 80px' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 400, color: '#14152B', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              ¿Qué valoras más en un trabajo?
            </h1>
            <p style={{ fontSize: 14, color: '#5A5C72', margin: 0 }}>
              En cada par, elige la opción que mejor refleja lo que priorizas. No hay respuestas correctas.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {VALUES_PAIRS.map((pair, idx) => (
              <div key={pair.id} className="e-card" style={{ padding: '20px 22px', borderColor: valuePicks[pair.id] ? 'rgba(59,63,219,0.2)' : undefined }}>
                <p style={{ fontSize: 12, color: '#8A8DA1', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 14px' }}>
                  {idx + 1} de {VALUES_PAIRS.length}
                </p>
                <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr' }}>
                  {['A', 'B'].map(opt => {
                    const isActive = valuePicks[pair.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => setValuePicks(p => ({ ...p, [pair.id]: opt }))}
                        style={{
                          padding: '14px 16px', borderRadius: 10, textAlign: 'left',
                          border: `1.5px solid ${isActive ? '#3B3FDB' : 'rgba(20,21,43,0.12)'}`,
                          background: isActive ? 'rgba(59,63,219,0.06)' : '#fff',
                          color: isActive ? '#3B3FDB' : '#14152B',
                          fontSize: 14, fontWeight: isActive ? 600 : 400,
                          cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'all 0.15s', lineHeight: 1.45,
                        }}
                      >
                        {pair[opt]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {error && <p className="e-error" style={{ marginTop: 20 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <button onClick={() => setPhase(3)} className="btn-g lg">
              ← Anterior
            </button>
            <button
              onClick={allPicked ? handleSubmit : undefined}
              disabled={!allPicked}
              className="btn-p lg"
              style={{ flex: 1, justifyContent: 'center', opacity: allPicked ? 1 : 0.6 }}
            >
              {allPicked
                ? 'Ver mis resultados →'
                : `Faltan ${VALUES_PAIRS.length - picked} por elegir`}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#8A8DA1', marginTop: 20 }}>
            Tus respuestas son confidenciales y solo se usan para generar tus recomendaciones.
          </p>
        </div>
      </div>
    );
  }

  // ── Phase 3: skills Likert ────────────────────────────────────────────────

  if (phase === 3) {
    const answeredSkills = SKILLS_ITEMS.filter(s => skillRatings[s.id] >= 1).length;
    const skillsComplete = SKILLS_ITEMS.every(s => skillRatings[s.id] >= 1);
    const progress = answeredSkills / SKILLS_ITEMS.length;

    return (
      <div className="e-page">
        <TestHeader phase={3} current={0} total={SKILLS_ITEMS.length}/>

        <div style={{ background: 'rgba(20,21,43,0.05)', height: 3 }}>
          <div style={{ height: '100%', width: `${progress * 100}%`, background: '#3B3FDB', transition: 'width 0.4s ease' }}/>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 400, color: '#14152B', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              ¿Con qué frecuencia haces esto?
            </h1>
            <p style={{ fontSize: 14, color: '#5A5C72', margin: 0 }}>
              Valora tu comportamiento real, no el ideal. {answeredSkills}/{SKILLS_ITEMS.length} respondidas.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {SKILLS_ITEMS.map((item, idx) => {
              const val = skillRatings[item.id];
              const answered = val >= 1;
              return (
                <div key={item.id} className="e-card" style={{ padding: '18px 20px', borderColor: answered ? 'rgba(59,63,219,0.2)' : undefined }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                    <span style={{
                      flexShrink: 0, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                      fontWeight: 600, color: '#3B3FDB', background: 'rgba(59,63,219,0.08)',
                      padding: '3px 8px', borderRadius: 999, whiteSpace: 'nowrap', marginTop: 1,
                    }}>
                      {item.area}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: '#14152B', margin: '0 0 12px', lineHeight: 1.5, fontWeight: 500 }}>
                    <span style={{ color: '#8A8DA1', fontWeight: 400, marginRight: 6 }}>{idx + 1}.</span>
                    {item.text}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5].map(n => {
                      const isActive = val === n;
                      return (
                        <button
                          key={n}
                          onClick={() => setSkillRatings(r => ({ ...r, [item.id]: n }))}
                          style={{
                            padding: '7px 11px', borderRadius: 8,
                            border: `1px solid ${isActive ? '#3B3FDB' : 'rgba(20,21,43,0.12)'}`,
                            background: isActive ? '#3B3FDB' : '#fff',
                            color: isActive ? '#fff' : '#5A5C72',
                            fontSize: 12, fontWeight: isActive ? 600 : 400,
                            cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'all 0.12s', whiteSpace: 'nowrap',
                          }}
                        >
                          {n} — {FREQ_LABELS[n]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <button onClick={() => setPhase(2)} className="btn-g lg">
              ← Anterior
            </button>
            <button
              onClick={skillsComplete ? () => setPhase(4) : undefined}
              disabled={!skillsComplete}
              className="btn-p lg"
              style={{ flex: 1, justifyContent: 'center', opacity: skillsComplete ? 1 : 0.6 }}
            >
              {skillsComplete
                ? 'Continuar con valores →'
                : `Faltan ${SKILLS_ITEMS.length - answeredSkills} por valorar`}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#8A8DA1', marginTop: 20 }}>
            Tus respuestas son confidenciales y solo se usan para generar tus recomendaciones.
          </p>
        </div>
      </div>
    );
  }

  // ── Phase 2: RIASEC structured ────────────────────────────────────────────

  if (phase === 2) {
    const answered = Object.keys(ratings).length;
    const total = RIASEC_ACTIVITIES.length;
    const riasecComplete = RIASEC_ACTIVITIES.every(a => ratings[a.id] >= 1);
    const progress = answered / total;

    return (
      <div className="e-page">
        <TestHeader phase={2} current={0} total={total}/>

        <div style={{ background: 'rgba(20,21,43,0.05)', height: 3 }}>
          <div style={{ height: '100%', width: `${progress * 100}%`, background: '#3B3FDB', transition: 'width 0.4s ease' }}/>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 400, color: '#14152B', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              ¿Con qué frecuencia harías esto?
            </h1>
            <p style={{ fontSize: 14, color: '#5A5C72', margin: 0 }}>
              Sé honesto — no hay respuestas correctas. {answered}/{total} respondidas.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {RIASEC_ACTIVITIES.map((act, idx) => {
              const val = ratings[act.id];
              const isAnswered = val >= 1;
              return (
                <div key={act.id} className="e-card" style={{ padding: '18px 20px', borderColor: isAnswered ? 'rgba(59,63,219,0.2)' : undefined }}>
                  <p style={{ fontSize: 14, color: '#14152B', margin: '0 0 12px', lineHeight: 1.5, fontWeight: 500 }}>
                    <span style={{ color: '#8A8DA1', fontWeight: 400, marginRight: 6 }}>{idx + 1}.</span>
                    {act.text}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5].map(n => {
                      const isActive = val === n;
                      return (
                        <button
                          key={n}
                          onClick={() => setRatings(r => ({ ...r, [act.id]: n }))}
                          style={{
                            padding: '7px 11px', borderRadius: 8,
                            border: `1px solid ${isActive ? '#3B3FDB' : 'rgba(20,21,43,0.12)'}`,
                            background: isActive ? '#3B3FDB' : '#fff',
                            color: isActive ? '#fff' : '#5A5C72',
                            fontSize: 12, fontWeight: isActive ? 600 : 400,
                            cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'all 0.12s', whiteSpace: 'nowrap',
                          }}
                        >
                          {n} — {FREQ_LABELS[n]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <button onClick={() => setPhase(1)} className="btn-g lg">
              ← Anterior
            </button>
            <button
              onClick={riasecComplete ? () => setPhase(3) : undefined}
              disabled={!riasecComplete}
              className="btn-p lg"
              style={{ flex: 1, justifyContent: 'center', opacity: riasecComplete ? 1 : 0.6 }}
            >
              {riasecComplete
                ? 'Continuar con habilidades →'
                : `Faltan ${total - answered} actividades por valorar`}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#8A8DA1', marginTop: 20 }}>
            Tus respuestas son confidenciales y solo se usan para generar tus recomendaciones.
          </p>
        </div>
      </div>
    );
  }

  // ── Phase 1: personality open questions ───────────────────────────────────

  const q = QUESTIONS[current];
  const answer = answers[current];
  const isLast = current === QUESTIONS.length - 1;
  const canContinue = answer.trim().length >= MIN_LENGTH;
  const progress = (current + 1) / QUESTIONS.length;

  const setAnswer = (val) => {
    const next = [...answers];
    next[current] = val;
    setAnswers(next);
  };

  const goNext = () => {
    if (!canContinue) return;
    if (!isLast) { setCurrent(c => c + 1); return; }
    setPhase(2);
  };

  return (
    <div className="e-page">
      <TestHeader phase={1} current={current} total={QUESTIONS.length}/>

      <div style={{ background: 'rgba(20,21,43,0.05)', height: 3 }}>
        <div style={{ height: '100%', width: `${progress * 100}%`, background: '#3B3FDB', transition: 'width 0.5s cubic-bezier(.2,.8,.2,1)' }}/>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px 80px', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="e-card" key={current} style={{ padding: '32px 28px', boxShadow: '0 4px 24px rgba(20,21,43,0.08)', animation: 'fadeSlide 0.3s ease' }}>
          <span style={{
            display: 'inline-block', fontSize: 11, letterSpacing: '0.12em',
            textTransform: 'uppercase', fontWeight: 600, color: '#3B3FDB',
            background: 'rgba(59,63,219,0.08)', padding: '4px 10px', borderRadius: 999, marginBottom: 20,
          }}>
            {q.tag}
          </span>

          <h2 style={{
            fontFamily: 'var(--font-instrument-serif), Georgia, serif',
            fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: 400, lineHeight: 1.25,
            letterSpacing: '-0.01em', color: '#14152B', margin: '0 0 10px',
          }}>
            {q.text}
          </h2>
          <p style={{ fontSize: 13, color: '#8A8DA1', margin: '0 0 24px', lineHeight: 1.5 }}>{q.hint}</p>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Escribe tu respuesta aquí…"
            rows={5}
            className="e-input"
            style={{ resize: 'none', height: 'auto', lineHeight: 1.6 }}
            autoFocus
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: canContinue ? '#22c55e' : '#8A8DA1' }}>
              {canContinue ? 'Respuesta suficiente ✓' : `Mínimo ${MIN_LENGTH - answer.trim().length} caracteres más`}
            </span>
            <span style={{ fontSize: 12, color: '#C4C6D4' }}>{answer.length}</span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {current > 0 && (
              <button onClick={() => setCurrent(c => c - 1)} className="btn-g lg" style={{ flex: 1 }}>
                ← Anterior
              </button>
            )}
            <button
              onClick={goNext}
              disabled={!canContinue}
              className="btn-p lg"
              style={{ flex: 1, justifyContent: 'center', opacity: canContinue ? 1 : 0.6 }}
            >
              {isLast ? 'Continuar con intereses →' : 'Siguiente →'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#C4C6D4', marginTop: 24 }}>
          Tus respuestas son confidenciales y solo se usan para generar tus recomendaciones.
        </p>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
