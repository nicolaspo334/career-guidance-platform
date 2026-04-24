'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const RIASEC_NAMES = {
  R: 'Realista', I: 'Investigador', A: 'Artístico', S: 'Social', E: 'Emprendedor', C: 'Convencional',
};
const RIASEC_DESC = {
  R: 'trabajar con las manos, máquinas o al aire libre',
  I: 'analizar, investigar y resolver problemas complejos',
  A: 'crear, expresarse artísticamente y pensar de forma original',
  S: 'ayudar, enseñar y trabajar con personas',
  E: 'liderar, convencer y gestionar proyectos',
  C: 'organizar, seguir procedimientos y trabajar con datos',
};
const SKILL_NAMES = {
  logic: 'Lógica y análisis', verbal: 'Comunicación', creative: 'Creatividad',
  digital: 'Habilidad digital', social: 'Habilidades sociales', planning: 'Planificación',
};
const MBTI_DIM = {
  EI: ['Introvertido', 'Extrovertido'],
  SN: ['Intuitivo (abstracto)', 'Sensorial (concreto)'],
  TF: ['Emocional / relacional', 'Lógico / racional'],
  JP: ['Espontáneo / flexible', 'Planificador / organizado'],
};

function Bar({ value, max = 100, color = '#3B3FDB' }) {
  return (
    <div style={{ background: 'rgba(20,21,43,0.06)', borderRadius: 99, height: 8, overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${(value / max) * 100}%`, background: color, height: '100%', borderRadius: 99, transition: 'width 0.6s ease' }}/>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 400, color: '#14152B', margin: '0 0 4px', letterSpacing: '-0.01em' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 14, color: '#6B6E87', margin: 0 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Card({ children, accent }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12,
      border: `1px solid ${accent ? 'rgba(59,63,219,0.25)' : 'rgba(20,21,43,0.08)'}`,
      padding: '18px 20px', marginBottom: 10,
      boxShadow: accent ? '0 0 0 3px rgba(59,63,219,0.06)' : 'none',
    }}>
      {children}
    </div>
  );
}

function Pill({ label, color = '#3B3FDB' }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
      fontWeight: 700, color, background: `${color}18`, padding: '3px 8px', borderRadius: 999,
    }}>{label}</span>
  );
}

export default function DebugPage() {
  const [snap, setSnap] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('elentio_debug_snapshot');
      if (!raw) { setError('no_data'); return; }
      setSnap(JSON.parse(raw));
    } catch {
      setError('parse_error');
    }
  }, []);

  if (error === 'no_data') return (
    <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, color: '#14152B' }}>No hay datos de test</h2>
      <p style={{ color: '#6B6E87' }}>Completa el test primero para generar el informe.</p>
      <Link href="/test/mbti" style={{ color: '#3B3FDB' }}>Ir al test →</Link>
    </div>
  );

  if (!snap) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <p style={{ color: '#8A8DA1' }}>Cargando…</p>
    </div>
  );

  const { inputs, computed, result, timestamp } = snap;
  const { openAnswers, riasecRatings, skillRatings: skillRaw, valuePicks } = inputs;
  const { riasecScores, skillsScores, valuesProfile } = computed;
  const riasecTypes = ['R', 'I', 'A', 'S', 'E', 'C'];

  // Determine MBTI type label
  const { EI, SN, TF, JP } = result?.dimensions || {};
  const mbtiLetters = [
    EI >= 50 ? 'E' : 'I',
    SN >= 50 ? 'S' : 'N',
    TF >= 50 ? 'T' : 'F',
    JP >= 50 ? 'J' : 'P',
  ];

  const fmt = (v) => Math.round(v);
  const date = timestamp ? new Date(timestamp).toLocaleString('es-ES') : '';

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#14152B', color: '#fff', padding: '32px 24px 28px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
            Informe de diagnóstico · {date}
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, margin: '0 0 8px', letterSpacing: '-0.015em' }}>
            Cómo Elentio ha analizado tu perfil
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>
            Este informe explica, paso a paso, qué datos recogiste, cómo los procesó el sistema y por qué aparecen esas carreras como recomendadas.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ── PASO 1: Preguntas abiertas ── */}
        <Section
          title="Paso 1 — Preguntas abiertas"
          subtitle="Estas 10 preguntas sirven para entender cómo piensas, cómo te relacionas y qué te importa. La inteligencia artificial las analiza para deducir tu tipo de personalidad (MBTI) y calibrar tus intereses."
        >
          {openAnswers.map((q, i) => (
            <Card key={q.id}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                <Pill label={q.tag}/>
              </div>
              <p style={{ fontSize: 13, color: '#14152B', fontWeight: 500, margin: '0 0 6px', lineHeight: 1.4 }}>{q.question}</p>
              <p style={{ fontSize: 13, color: '#5A5C72', margin: 0, lineHeight: 1.55, background: 'rgba(59,63,219,0.04)', padding: '8px 10px', borderRadius: 8, borderLeft: '3px solid rgba(59,63,219,0.2)' }}>
                "{q.answer || <em style={{ color: '#C4C6D4' }}>sin respuesta</em>}"
              </p>
            </Card>
          ))}

          <div style={{ background: '#fff', border: '1px solid rgba(20,21,43,0.08)', borderRadius: 12, padding: '18px 20px', marginTop: 16 }}>
            <p style={{ fontSize: 13, color: '#6B6E87', margin: '0 0 14px', fontWeight: 600 }}>
              Lo que dedujo la IA a partir de estas respuestas:
            </p>
            <div style={{ display: 'grid', gap: 10 }}>
              {Object.entries({ EI, SN, TF, JP }).map(([dim, val]) => {
                const [left, right] = MBTI_DIM[dim];
                const pct = val ?? 50;
                const label = pct >= 50 ? right : left;
                const intensity = Math.abs(pct - 50);
                const word = intensity < 15 ? 'ligeramente' : intensity < 30 ? 'bastante' : 'muy';
                return (
                  <div key={dim}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8A8DA1', marginBottom: 4 }}>
                      <span>{left}</span><span>{right}</span>
                    </div>
                    <div style={{ position: 'relative', background: 'rgba(20,21,43,0.06)', borderRadius: 99, height: 8, marginBottom: 4 }}>
                      <div style={{ position: 'absolute', left: `${pct}%`, top: -2, width: 12, height: 12, background: '#3B3FDB', borderRadius: '50%', transform: 'translateX(-50%)', border: '2px solid #fff', boxShadow: '0 1px 4px rgba(59,63,219,0.4)' }}/>
                    </div>
                    <p style={{ fontSize: 12, color: '#5A5C72', margin: 0 }}>
                      → Perfil <strong>{word} {label.toLowerCase()}</strong> ({pct}/100)
                    </p>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 12, color: '#3B3FDB', fontWeight: 600, margin: '14px 0 0', letterSpacing: '0.04em' }}>
              Tipo MBTI resultante: {result?.mbtiType || '—'} — {result?.mbtiLabel}
            </p>
          </div>
        </Section>

        {/* ── PASO 2: Cuestionario RIASEC ── */}
        <Section
          title="Paso 2 — Cuestionario de intereses vocacionales (RIASEC)"
          subtitle="Valoraste 12 actividades del 1 al 5, según con qué frecuencia las harías. Cada actividad pertenece a uno de los 6 tipos de Holland. El sistema promedia las valoraciones de cada tipo para obtener tu perfil."
        >
          <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
            {riasecRatings.map(a => (
              <Card key={a.id}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Pill label={a.type} color={
                    { R:'#059669', I:'#2563eb', A:'#7c3aed', S:'#db2777', E:'#ea580c', C:'#ca8a04' }[a.type]
                  }/>
                  <p style={{ fontSize: 13, color: '#14152B', margin: 0, flex: 1, lineHeight: 1.4 }}>{a.text}</p>
                  <span style={{ fontSize: 18, fontWeight: 700, color: a.rating >= 4 ? '#059669' : a.rating <= 2 ? '#e11d48' : '#8A8DA1', minWidth: 24, textAlign: 'right' }}>
                    {a.rating ?? '—'}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          <div style={{ background: '#fff', border: '1px solid rgba(20,21,43,0.08)', borderRadius: 12, padding: '18px 20px' }}>
            <p style={{ fontSize: 13, color: '#6B6E87', margin: '0 0 14px', fontWeight: 600 }}>
              Puntuaciones por tipo (0-100), calculadas a partir de tus valoraciones:
            </p>
            {riasecTypes.map(t => {
              const score = riasecScores?.[t] ?? 0;
              const color = { R:'#059669', I:'#2563eb', A:'#7c3aed', S:'#db2777', E:'#ea580c', C:'#ca8a04' }[t];
              return (
                <div key={t} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color, width: 90 }}>{RIASEC_NAMES[t]}</span>
                    <Bar value={score} color={color}/>
                    <span style={{ fontSize: 13, fontWeight: 700, color, width: 36, textAlign: 'right' }}>{score}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#8A8DA1', margin: 0, paddingLeft: 100 }}>
                    Inclinación a {RIASEC_DESC[t]}
                  </p>
                </div>
              );
            })}
            <p style={{ fontSize: 12, color: '#6B6E87', margin: '14px 0 0', padding: '10px', background: '#FAF8F3', borderRadius: 8 }}>
              <strong>Fórmula:</strong> rating promedio de las actividades de ese tipo → normalizado a 0-100. Un 5 en todas daría 100; un 1 en todas daría 0.
            </p>
          </div>
        </Section>

        {/* ── PASO 3: Mezcla RIASEC ── */}
        <Section
          title="Paso 3 — Fusión del perfil RIASEC"
          subtitle="El cuestionario estructurado es preciso, pero puede estar influido por conveniencia. La IA también infirió tus intereses leyendo tus respuestas abiertas. El sistema fusiona ambas señales para mayor fiabilidad."
        >
          <Card>
            <p style={{ fontSize: 13, color: '#14152B', margin: '0 0 12px', lineHeight: 1.6 }}>
              <strong>Fórmula:</strong> RIASEC final = 65% cuestionario estructurado + 35% inferencia de la IA sobre tus respuestas abiertas.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {riasecTypes.map(t => {
                const final = result?.riasec?.[t] ?? riasecScores?.[t] ?? 0;
                const color = { R:'#059669', I:'#2563eb', A:'#7c3aed', S:'#db2777', E:'#ea580c', C:'#ca8a04' }[t];
                return (
                  <div key={t} style={{ textAlign: 'center', padding: '12px', background: '#FAF8F3', borderRadius: 10 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color }}>{final}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.06em' }}>{t} — {RIASEC_NAMES[t]}</div>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 12, color: '#6B6E87', margin: '12px 0 0' }}>
              Código RIASEC (3 tipos dominantes): <strong style={{ color: '#3B3FDB' }}>{result?.riasec?.code || '—'}</strong>
            </p>
          </Card>
        </Section>

        {/* ── PASO 4: Habilidades ── */}
        <Section
          title="Paso 4 — Perfil de habilidades"
          subtitle="Valoraste 6 preguntas sobre la frecuencia con que ejerces distintas habilidades. Esto da contexto sobre tus capacidades reales, más allá de lo que te gusta."
        >
          {skillRaw?.map(s => (
            <Card key={s.id}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Pill label={s.area} color="#7c3aed"/>
                <p style={{ fontSize: 13, color: '#14152B', margin: 0, flex: 1, lineHeight: 1.4 }}>{s.text}</p>
                <span style={{ fontSize: 18, fontWeight: 700, color: s.rating >= 4 ? '#059669' : s.rating <= 2 ? '#e11d48' : '#8A8DA1', minWidth: 24, textAlign: 'right' }}>
                  {s.rating ?? '—'}
                </span>
              </div>
            </Card>
          ))}
          <div style={{ background: '#fff', border: '1px solid rgba(20,21,43,0.08)', borderRadius: 12, padding: '18px 20px', marginTop: 8 }}>
            <p style={{ fontSize: 13, color: '#6B6E87', margin: '0 0 12px', fontWeight: 600 }}>
              Puntuaciones de habilidad (0-100):
            </p>
            {Object.entries(skillsScores || {}).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#14152B', width: 140, fontWeight: 500 }}>{SKILL_NAMES[key]}</span>
                <Bar value={val} color="#7c3aed"/>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', width: 36, textAlign: 'right' }}>{val}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── PASO 5: Valores ── */}
        <Section
          title="Paso 5 — Perfil de valores laborales"
          subtitle="Elegiste entre pares de opciones opuestas. No hay respuesta correcta — simplemente revela qué priorizas en un trabajo."
        >
          {valuePicks?.map(p => (
            <Card key={p.id} accent={!!p.chosen}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {['A','B'].map(opt => (
                  <div key={opt} style={{
                    padding: '10px 12px', borderRadius: 8, fontSize: 13, lineHeight: 1.4,
                    background: p.chosen === opt ? 'rgba(59,63,219,0.07)' : '#FAF8F3',
                    border: `1.5px solid ${p.chosen === opt ? '#3B3FDB' : 'transparent'}`,
                    color: p.chosen === opt ? '#3B3FDB' : '#8A8DA1',
                    fontWeight: p.chosen === opt ? 600 : 400,
                  }}>
                    {p.chosen === opt ? '✓ ' : ''}{p[opt]}
                  </div>
                ))}
              </div>
            </Card>
          ))}
          <div style={{ background: '#fff', border: '1px solid rgba(20,21,43,0.08)', borderRadius: 12, padding: '18px 20px', marginTop: 8 }}>
            <p style={{ fontSize: 13, color: '#6B6E87', margin: '0 0 12px', fontWeight: 600 }}>
              Perfil de valores resultante (0=mínimo, 80=máximo):
            </p>
            {[
              ['autonomy', 'Autonomía en el trabajo', '#ea580c'],
              ['innovative', 'Innovación y creatividad', '#7c3aed'],
              ['socialImpact', 'Impacto social', '#db2777'],
              ['growth', 'Aprendizaje y crecimiento', '#059669'],
            ].map(([key, label, color]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#14152B', width: 180, fontWeight: 500 }}>{label}</span>
                <Bar value={valuesProfile?.[key] ?? 50} color={color}/>
                <span style={{ fontSize: 13, fontWeight: 700, color, width: 36, textAlign: 'right' }}>{valuesProfile?.[key] ?? 50}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── PASO 6: Matching de carreras ── */}
        <Section
          title="Paso 6 — Cómo se calculó la compatibilidad con cada carrera"
          subtitle="El sistema compara tu perfil con el perfil ideal de cada carrera usando tres dimensiones. La fórmula es una media geométrica ponderada: no compensa — un desajuste en RIASEC no lo arregla un buen MBTI."
        >
          <Card>
            <p style={{ fontSize: 13, color: '#14152B', lineHeight: 1.6, margin: '0 0 12px' }}>
              <strong>Fórmula de compatibilidad:</strong>
            </p>
            <div style={{ background: '#14152B', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
              <code style={{ fontSize: 13, color: '#a5b4fc', lineHeight: 1.8 }}>
                compatibilidad = RIASEC<sup>0.50</sup> × MBTI<sup>0.30</sup> × Valores<sup>0.20</sup>
              </code>
            </div>
            <ul style={{ fontSize: 13, color: '#5A5C72', margin: 0, padding: '0 0 0 18px', lineHeight: 2 }}>
              <li><strong>RIASEC (50%):</strong> ¿cuánto se alinean tus intereses con los de esa carrera?</li>
              <li><strong>MBTI (30%):</strong> ¿el tipo de personalidad encaja con el perfil típico de esa profesión?</li>
              <li><strong>Valores (20%):</strong> ¿lo que buscas en un trabajo coincide con lo que esa carrera suele ofrecer?</li>
            </ul>
            <p style={{ fontSize: 12, color: '#8A8DA1', margin: '12px 0 0', padding: '8px 10px', background: '#FAF8F3', borderRadius: 8 }}>
              Dentro de cada dimensión, un desajuste en cualquier subdimensión penaliza el resultado. Ejemplo: si tu perfil RIASEC es muy Artístico pero la carrera requiere mucho Convencional, el score RIASEC cae drásticamente aunque coincidas en los demás tipos.
            </p>
          </Card>
          <Card>
            <p style={{ fontSize: 13, color: '#14152B', lineHeight: 1.6, margin: '0 0 6px' }}>
              <strong>Escala de visualización:</strong> el score bruto (0-1) se transforma con una función potencial
              <code style={{ background: '#FAF8F3', padding: '1px 5px', borderRadius: 4, marginLeft: 4 }}>compat^1.5 × 160</code>
              para ampliar la separación visual entre el primero y el último. El orden nunca cambia — solo la escala.
            </p>
          </Card>
        </Section>

        {/* ── PASO 7: Resultados ── */}
        <Section
          title="Paso 7 — Tus 10 carreras recomendadas"
          subtitle={`Análisis de la IA: "${result?.analysis || '—'}"`}
        >
          {result?.careers?.map((c, i) => (
            <Card key={c.id} accent={i === 0}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: i === 0 ? '#3B3FDB' : 'rgba(20,21,43,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800,
                  color: i === 0 ? '#fff' : '#8A8DA1',
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#14152B', margin: '0 0 2px' }}>{c.name}</p>
                      <p style={{ fontSize: 12, color: '#8A8DA1', margin: 0 }}>{c.area}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: i === 0 ? '#3B3FDB' : '#14152B' }}>{c.score}%</span>
                      <p style={{ fontSize: 11, color: '#8A8DA1', margin: 0 }}>compatibilidad</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: '#5A5C72', margin: '6px 0 8px', lineHeight: 1.5 }}>{c.description}</p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Bar value={c.score} color={i === 0 ? '#3B3FDB' : '#8A8DA1'}/>
                    <span style={{ fontSize: 11, color: '#8A8DA1', whiteSpace: 'nowrap' }}>
                      Perspectiva laboral: {c.futureScore}/100
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </Section>

        {/* ── Footer note ── */}
        <div style={{ background: 'rgba(20,21,43,0.04)', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#8A8DA1', margin: 0, lineHeight: 1.6 }}>
            Esta página es temporal y está en modo de pruebas. Los datos se leen de tu navegador local y no se comparten con nadie.
            <br/>
            <Link href="/dashboard" style={{ color: '#3B3FDB', textDecoration: 'none' }}>← Volver al dashboard</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
