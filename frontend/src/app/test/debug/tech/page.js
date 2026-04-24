'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// ── Helpers ───────────────────────────────────────────────────────────────────

const R2 = (v) => typeof v === 'number' ? Math.round(v * 100) / 100 : '—';
const PCT = (v) => typeof v === 'number' ? `${Math.round(v * 100)}%` : '—';

const RIASEC_COLOR = { R:'#059669', I:'#2563eb', A:'#7c3aed', S:'#db2777', E:'#ea580c', C:'#ca8a04' };
const RIASEC_NAME  = { R:'Realista', I:'Investigador', A:'Artístico', S:'Social', E:'Emprendedor', C:'Convencional' };
const MBTI_DIM_LABEL = {
  EI: ['Introversión (0)', 'Extraversión (100)'],
  SN: ['Intuición/abstracto (0)', 'Sensorial/concreto (100)'],
  TF: ['Emocional/relacional (0)', 'Lógico/racional (100)'],
  JP: ['Espontáneo/flexible (0)', 'Planificador/organizado (100)'],
};

function Tag({ label, color = '#3B3FDB' }) {
  return (
    <span style={{ display:'inline-block', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase',
      fontWeight:700, color, background:`${color}18`, padding:'3px 8px', borderRadius:999 }}>
      {label}
    </span>
  );
}

function Code({ children, block }) {
  const style = block
    ? { display:'block', background:'#0f0f23', color:'#a5b4fc', fontSize:13, lineHeight:1.7,
        padding:'14px 16px', borderRadius:10, overflowX:'auto', whiteSpace:'pre-wrap', wordBreak:'break-word', margin:'10px 0' }
    : { background:'#f1f0ec', color:'#14152B', fontSize:12, padding:'2px 6px', borderRadius:4, fontFamily:'monospace' };
  return <code style={style}>{children}</code>;
}

function Section({ n, title, subtitle, children, collapsed: initCollapsed = false }) {
  const [open, setOpen] = useState(!initCollapsed);
  return (
    <div style={{ marginBottom:32, borderRadius:14, border:'1px solid rgba(20,21,43,0.09)', overflow:'hidden', background:'#fff' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'16px 20px',
          background:'none', border:'none', cursor:'pointer', textAlign:'left' }}
      >
        <div style={{ width:32, height:32, borderRadius:8, background:'#14152B', display:'flex',
          alignItems:'center', justifyContent:'center', flexShrink:0,
          fontSize:13, fontWeight:800, color:'#fff' }}>{n}</div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:16, fontWeight:700, color:'#14152B', margin:0 }}>{title}</p>
          {subtitle && <p style={{ fontSize:12, color:'#8A8DA1', margin:'2px 0 0' }}>{subtitle}</p>}
        </div>
        <span style={{ fontSize:18, color:'#8A8DA1', transform: open ? 'rotate(180deg)' : 'none', transition:'0.2s' }}>▾</span>
      </button>
      {open && <div style={{ padding:'0 20px 20px', borderTop:'1px solid rgba(20,21,43,0.06)' }}>{children}</div>}
    </div>
  );
}

function Row({ label, value, sub, mono }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
      padding:'9px 0', borderBottom:'1px solid rgba(20,21,43,0.05)', gap:16 }}>
      <span style={{ fontSize:13, color:'#5A5C72', lineHeight:1.4 }}>{label}</span>
      <span style={{ fontSize:13, color:'#14152B', fontWeight:600, textAlign:'right',
        fontFamily: mono ? 'monospace' : 'inherit', lineHeight:1.4 }}>
        {value}
        {sub && <span style={{ display:'block', fontSize:11, color:'#8A8DA1', fontWeight:400 }}>{sub}</span>}
      </span>
    </div>
  );
}

function ScoreBar({ value, max=1, color='#3B3FDB', label }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
      {label && <span style={{ fontSize:12, color:'#5A5C72', width:90, flexShrink:0 }}>{label}</span>}
      <div style={{ flex:1, background:'rgba(20,21,43,0.06)', borderRadius:99, height:7, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, background:color, height:'100%', borderRadius:99 }}/>
      </div>
      <span style={{ fontSize:12, fontWeight:700, color, width:38, textAlign:'right' }}>
        {typeof value === 'number' && value <= 1 ? PCT(value) : value}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TechDebugPage() {
  const [snap, setSnap] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('elentio_debug_snapshot');
      if (!raw) { setErr('no_data'); return; }
      const parsed = JSON.parse(raw);
      if (!parsed?.result?._debug) { setErr('no_debug'); return; }
      setSnap(parsed);
    } catch { setErr('parse'); }
  }, []);

  if (err === 'no_data') return (
    <div style={{ maxWidth:600, margin:'80px auto', padding:'0 24px', textAlign:'center' }}>
      <h2 style={{ fontFamily:'Georgia, serif', fontWeight:400 }}>Sin datos</h2>
      <p style={{ color:'#6B6E87' }}>Haz el test primero para generar el informe técnico.</p>
      <Link href="/test/mbti" style={{ color:'#3B3FDB' }}>Ir al test →</Link>
    </div>
  );

  if (err === 'no_debug') return (
    <div style={{ maxWidth:600, margin:'80px auto', padding:'0 24px', textAlign:'center' }}>
      <h2 style={{ fontFamily:'Georgia, serif', fontWeight:400 }}>Datos incompletos</h2>
      <p style={{ color:'#6B6E87' }}>
        El snapshot no contiene datos técnicos. Haz el test de nuevo — el nuevo worker
        ya guarda toda la información.
      </p>
      <Link href="/test/mbti" style={{ color:'#3B3FDB' }}>Repetir test →</Link>
    </div>
  );

  if (!snap) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <p style={{ color:'#8A8DA1' }}>Cargando…</p>
    </div>
  );

  const { inputs, computed, result, timestamp } = snap;
  const dbg = result._debug;
  const { openAnswers, riasecRatings, skillRatings: skillRaw, valuePicks } = inputs;
  const date = timestamp ? new Date(timestamp).toLocaleString('es-ES') : '';

  return (
    <div style={{ minHeight:'100vh', background:'#F4F3EF', fontFamily:'system-ui, sans-serif' }}>

      {/* ── HEADER ── */}
      <div style={{ background:'#14152B', color:'#fff', padding:'36px 24px 32px' }}>
        <div style={{ maxWidth:820, margin:'0 auto' }}>
          <div style={{ fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase',
            color:'rgba(255,255,255,0.35)', marginBottom:8 }}>
            Informe técnico interno · {date}
          </div>
          <h1 style={{ fontFamily:'Georgia, serif', fontSize:30, fontWeight:400, margin:'0 0 10px', letterSpacing:'-0.015em' }}>
            Radiografía completa del algoritmo
          </h1>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', margin:0, lineHeight:1.65, maxWidth:640 }}>
            Cada paso que ha seguido el software: el prompt exacto enviado a la IA, las palabras que
            analizó, los valores brutos que devolvió, todos los cálculos intermedios y cómo se llegó
            a la puntuación final de cada carrera.
          </p>
          <div style={{ display:'flex', gap:12, marginTop:18, flexWrap:'wrap' }}>
            <Link href="/test/debug" style={{ fontSize:12, color:'rgba(255,255,255,0.5)',
              textDecoration:'none', border:'1px solid rgba(255,255,255,0.15)',
              padding:'6px 12px', borderRadius:8 }}>
              ← Informe usuario
            </Link>
            <Link href="/dashboard" style={{ fontSize:12, color:'rgba(255,255,255,0.5)',
              textDecoration:'none', border:'1px solid rgba(255,255,255,0.15)',
              padding:'6px 12px', borderRadius:8 }}>
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:820, margin:'0 auto', padding:'32px 24px 80px' }}>

        {/* ── 1. PARÁMETROS DE LLAMADA A LA IA ── */}
        <Section n="1" title="Parámetros de la llamada a la IA"
          subtitle="Configuración técnica con la que se invocó el modelo de lenguaje">
          <div style={{ paddingTop:12 }}>
            <Row label="Modelo" value={dbg.model} mono/>
            <Row label="Temperatura" value={dbg.temperature}
              sub="0 = respuestas deterministas; 1 = creativas/aleatorias. 0.2 es conservador para psicometría."/>
            <Row label="Max tokens" value={dbg.max_tokens}
              sub="Límite de longitud de la respuesta de la IA (~1 token ≈ 0.75 palabras)."/>
            <Row label="Proveedor" value="Groq Cloud" />
            <Row label="Formato de salida pedido" value="JSON estricto (sin texto libre)" />
            <Row label="Idioma del prompt" value="Español" />
          </div>
        </Section>

        {/* ── 2. PROMPT ENVIADO ── */}
        <Section n="2" title="Prompt exacto enviado a la IA"
          subtitle="El texto literal que recibió el modelo de lenguaje, incluyendo todas tus respuestas"
          collapsed>
          <div style={{ paddingTop:12 }}>
            <p style={{ fontSize:13, color:'#6B6E87', marginBottom:8 }}>
              El prompt es la instrucción completa que recibe la IA. Incluye: el rol que se le asigna al modelo,
              el contexto de datos estructurados (RIASEC del cuestionario, habilidades), tus respuestas literales,
              y el formato JSON exacto que debe devolver.
            </p>
            <Code block>{dbg.promptSent}</Code>
          </div>
        </Section>

        {/* ── 3. RESPUESTA BRUTA DE LA IA ── */}
        <Section n="3" title="Respuesta bruta devuelta por la IA"
          subtitle="El JSON sin procesar tal como lo devolvió el modelo">
          <div style={{ paddingTop:12 }}>
            <p style={{ fontSize:13, color:'#6B6E87', marginBottom:8 }}>
              La IA devuelve un objeto JSON. El worker valida que sea JSON válido, extrae cada campo
              y aplica <Code>clamp(0, 100)</Code> para evitar valores fuera de rango.
              Si la IA devuelve texto extra (fuera del JSON), se ignora con la regex <Code>{'/{[\\s\\S]*}/'}</Code>.
            </p>
            <Code block>{dbg.rawAiResponse}</Code>
          </div>
        </Section>

        {/* ── 4. RAZONAMIENTO DE LA IA ── */}
        <Section n="4" title="Razonamiento de la IA: qué palabras analizó y por qué"
          subtitle="La IA explica explícitamente qué frases exactas de tus respuestas determinaron cada puntuación">
          <div style={{ paddingTop:16 }}>

            {dbg.aiReasoning ? (
              <>
                <p style={{ fontSize:13, color:'#6B6E87', marginBottom:20, lineHeight:1.6 }}>
                  La IA no trabaja con listas de palabras clave. Procesa el texto de forma holística —
                  analiza estructura de frases, tono, vocabulario elegido y coherencia entre respuestas.
                  A continuación, lo que el modelo identificó en cada dimensión:
                </p>

                {/* MBTI */}
                <p style={{ fontSize:12, fontWeight:700, color:'#8A8DA1', letterSpacing:'0.1em',
                  textTransform:'uppercase', margin:'0 0 12px' }}>Dimensiones MBTI</p>
                {['EI','SN','TF','JP'].map(dim => {
                  const score = result.dimensions?.[dim] ?? 50;
                  const [left, right] = MBTI_DIM_LABEL[dim];
                  const dominant = score >= 50 ? right : left;
                  const intensity = Math.abs(score - 50);
                  const word = intensity < 12 ? 'muy leve' : intensity < 25 ? 'moderada' : intensity < 38 ? 'clara' : 'fuerte';
                  return (
                    <div key={dim} style={{ marginBottom:16, background:'#FAF8F3', borderRadius:12,
                      padding:'14px 16px', borderLeft:`4px solid #3B3FDB` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                        <Tag label={dim} color="#3B3FDB"/>
                        <span style={{ fontSize:13, fontWeight:700, color:'#3B3FDB' }}>
                          {score}/100 — tendencia {word} hacia {dominant.split('(')[0].trim()}
                        </span>
                      </div>
                      <p style={{ fontSize:13, color:'#14152B', margin:0, lineHeight:1.65 }}>
                        {dbg.aiReasoning[dim] || <em style={{ color:'#C4C6D4' }}>sin razonamiento disponible</em>}
                      </p>
                    </div>
                  );
                })}

                {/* RIASEC */}
                <p style={{ fontSize:12, fontWeight:700, color:'#8A8DA1', letterSpacing:'0.1em',
                  textTransform:'uppercase', margin:'24px 0 12px' }}>Tipos RIASEC (inferidos de preguntas abiertas)</p>
                {['R','I','A','S','E','C'].map(t => {
                  const aiScore = dbg.aiRawScores?.riasec?.[t] ?? '—';
                  const color = RIASEC_COLOR[t];
                  return (
                    <div key={t} style={{ marginBottom:12, background:'#FAF8F3', borderRadius:12,
                      padding:'14px 16px', borderLeft:`4px solid ${color}` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                        <Tag label={`${t} — ${RIASEC_NAME[t]}`} color={color}/>
                        <span style={{ fontSize:13, fontWeight:700, color }}>
                          {aiScore}/100 (IA bruto)
                        </span>
                      </div>
                      <p style={{ fontSize:13, color:'#14152B', margin:0, lineHeight:1.65 }}>
                        {dbg.aiReasoning[t] || <em style={{ color:'#C4C6D4' }}>sin razonamiento disponible</em>}
                      </p>
                    </div>
                  );
                })}
              </>
            ) : (
              <div style={{ padding:'20px', background:'#FFF9E6', borderRadius:12,
                border:'1px solid #f59e0b', color:'#92400e', fontSize:13 }}>
                El snapshot no contiene razonamiento de la IA. Haz el test de nuevo — el worker
                actualizado ya solicita explicaciones por dimensión.
              </div>
            )}
          </div>
        </Section>

        {/* ── 5. PIPELINE RIASEC ── */}
        <Section n="5" title="Pipeline de cálculo RIASEC"
          subtitle="Cómo se fusionan el cuestionario estructurado con la inferencia de la IA">
          <div style={{ paddingTop:16 }}>

            <p style={{ fontSize:13, color:'#6B6E87', marginBottom:16, lineHeight:1.6 }}>
              El RIASEC final no viene de una sola fuente. Se mezclan dos señales complementarias:
              el cuestionario de 12 actividades (más fiable, menos influenciado por deseabilidad social)
              y la inferencia de la IA sobre tus respuestas abiertas (más matizada, puede captar señales
              implícitas). Fórmula: <Code>final = 0.65 × estructurado + 0.35 × IA</Code>
            </p>

            {/* Tabla comparativa */}
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ background:'#14152B', color:'#fff' }}>
                    <th style={{ padding:'10px 14px', textAlign:'left', borderRadius:'8px 0 0 0' }}>Tipo</th>
                    <th style={{ padding:'10px 14px', textAlign:'center' }}>Cuestionario (65%)</th>
                    <th style={{ padding:'10px 14px', textAlign:'center' }}>IA bruto (35%)</th>
                    <th style={{ padding:'10px 14px', textAlign:'center', borderRadius:'0 8px 0 0' }}>Final mezclado</th>
                  </tr>
                </thead>
                <tbody>
                  {['R','I','A','S','E','C'].map((t, i) => {
                    const struct = dbg.riasecPipeline?.structured?.[t] ?? computed.riasecScores?.[t] ?? '—';
                    const ai = dbg.riasecPipeline?.ai?.[t] ?? '—';
                    const final = dbg.riasecPipeline?.blended?.[t] ?? result.riasec?.[t] ?? '—';
                    const color = RIASEC_COLOR[t];
                    return (
                      <tr key={t} style={{ background: i % 2 === 0 ? '#fff' : '#FAF8F3' }}>
                        <td style={{ padding:'10px 14px', fontWeight:700, color }}>
                          {t} — {RIASEC_NAME[t]}
                        </td>
                        <td style={{ padding:'10px 14px', textAlign:'center' }}>
                          <ScoreBar value={typeof struct==='number'?struct:0} max={100} color={color}/>
                          <span style={{ fontSize:13, fontWeight:700, color }}>{struct}</span>
                        </td>
                        <td style={{ padding:'10px 14px', textAlign:'center' }}>
                          <ScoreBar value={typeof ai==='number'?ai:0} max={100} color={`${color}88`}/>
                          <span style={{ fontSize:13, color:`${color}bb` }}>{ai}</span>
                        </td>
                        <td style={{ padding:'10px 14px', textAlign:'center', background:`${color}0a` }}>
                          <ScoreBar value={typeof final==='number'?final:0} max={100} color={color}/>
                          <span style={{ fontSize:14, fontWeight:800, color }}>{final}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop:16, background:'#FAF8F3', borderRadius:10, padding:'12px 14px' }}>
              <p style={{ fontSize:12, color:'#6B6E87', margin:0, lineHeight:1.7 }}>
                <strong>Ejemplo de cálculo (tipo I):</strong><br/>
                {(() => {
                  const s = dbg.riasecPipeline?.structured?.I ?? '?';
                  const a = dbg.riasecPipeline?.ai?.I ?? '?';
                  const f = dbg.riasecPipeline?.blended?.I ?? '?';
                  return `0.65 × ${s} + 0.35 × ${a} = ${typeof s==='number'&&typeof a==='number' ? Math.round(0.65*s+0.35*a) : f}`;
                })()}
              </p>
            </div>
          </div>
        </Section>

        {/* ── 6. HABILIDADES ── */}
        <Section n="6" title="Cálculo del perfil de habilidades"
          subtitle="Conversión de valoraciones Likert (1-5) a puntuaciones 0-100">
          <div style={{ paddingTop:16 }}>
            <p style={{ fontSize:13, color:'#6B6E87', marginBottom:14, lineHeight:1.6 }}>
              Fórmula: <Code>score = round((rating − 1) / 4 × 100)</Code><br/>
              Un 1 (nunca) → 0. Un 3 (a veces) → 50. Un 5 (siempre) → 100.
              Esta normalización es lineal — no penaliza extremos.
            </p>
            {skillRaw?.map(s => {
              const score = computed.skillsScores?.[
                {sk1:'logic',sk2:'verbal',sk3:'creative',sk4:'digital',sk5:'social',sk6:'planning'}[s.id]
              ] ?? '—';
              return (
                <div key={s.id} style={{ marginBottom:10, padding:'12px 14px', background:'#FAF8F3',
                  borderRadius:10, display:'flex', gap:12, alignItems:'flex-start' }}>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, color:'#14152B', margin:'0 0 4px', fontWeight:500 }}>{s.text}</p>
                    <p style={{ fontSize:12, color:'#8A8DA1', margin:0 }}>
                      Rating: <strong>{s.rating ?? '—'}/5</strong>
                      &nbsp;→&nbsp;Fórmula: <Code>({s.rating ?? '?'} − 1) / 4 × 100</Code>
                      &nbsp;→&nbsp;<strong style={{ color:'#7c3aed' }}>{score}/100</strong>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── 7. VALORES ── */}
        <Section n="7" title="Conversión del perfil de valores"
          subtitle="Cómo se transforman las elecciones forzadas en números para el algoritmo">
          <div style={{ paddingTop:16 }}>
            <p style={{ fontSize:13, color:'#6B6E87', marginBottom:14, lineHeight:1.6 }}>
              Cada par forzado produce un valor binario: elegir A → 80, elegir B → 20.
              El umbral 80/20 (en vez de 100/0) está calibrado para que ninguna respuesta
              domine completamente la puntuación final.
            </p>
            {[
              ['v1', 'autonomy', 'Autonomía', 'A=autonomía (80) / B=seguridad (20)'],
              ['v2', 'innovative', 'Innovación', 'A=innovar (80) / B=método probado (20)'],
              ['v3', 'socialImpact', 'Impacto social', 'A=impacto social (80) / B=impacto económico (20)'],
              ['v4', 'growth', 'Crecimiento', 'A=reconocimiento (20) / B=aprendizaje (80)'],
            ].map(([id, key, label, note]) => {
              const pick = valuePicks?.find(p => p.id === id);
              const val = computed.valuesProfile?.[key] ?? '—';
              return (
                <div key={id} style={{ marginBottom:10, padding:'12px 14px', background:'#FAF8F3',
                  borderRadius:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <strong style={{ fontSize:13, color:'#14152B' }}>{label}</strong>
                    <span style={{ fontSize:13, fontWeight:700, color:'#ea580c' }}>{val}/100</span>
                  </div>
                  <p style={{ fontSize:12, color:'#8A8DA1', margin:'0 0 6px' }}>{note}</p>
                  <p style={{ fontSize:12, color:'#5A5C72', margin:0 }}>
                    Elegiste: <strong style={{ color:'#3B3FDB' }}>
                      {pick?.chosen === 'A' ? pick.A : pick?.chosen === 'B' ? pick.B : '—'}
                    </strong> → valor resultante: <Code>{val}</Code>
                  </p>
                </div>
              );
            })}

            <div style={{ marginTop:12, padding:'12px 14px', background:'#fff',
              border:'1px solid rgba(20,21,43,0.08)', borderRadius:10 }}>
              <p style={{ fontSize:12, fontWeight:700, color:'#6B6E87', margin:'0 0 8px',
                textTransform:'uppercase', letterSpacing:'0.08em' }}>
                Perfiles ideales de las áreas de carrera
              </p>
              <p style={{ fontSize:12, color:'#8A8DA1', margin:'0 0 10px' }}>
                Cada área de carrera tiene un perfil de valores ideal codificado. La compatibilidad
                se calcula como media geométrica de las distancias cuadráticas:
                <Code> valC = (d(auto)×d(innov)×d(social)×d(growth))^(1/4)</Code>
              </p>
              {[
                ['Tecnología', {autonomy:65, innovative:80, socialImpact:30, growth:75}],
                ['Salud', {autonomy:40, innovative:55, socialImpact:85, growth:65}],
                ['Empresa', {autonomy:55, innovative:55, socialImpact:30, growth:65}],
                ['Educación', {autonomy:50, innovative:55, socialImpact:90, growth:60}],
                ['Arte', {autonomy:85, innovative:90, socialImpact:50, growth:55}],
              ].map(([area, ideal]) => (
                <div key={area} style={{ fontSize:12, color:'#5A5C72', marginBottom:4 }}>
                  <strong>{area}:</strong>{' '}
                  auto={ideal.autonomy} | innov={ideal.innovative} | social={ideal.socialImpact} | growth={ideal.growth}
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 8. FUNCIÓN DE DISTANCIA ── */}
        <Section n="8" title="La función de distancia d(a, b)"
          subtitle="El núcleo matemático que mide cuánto se parece tu perfil al ideal de cada carrera">
          <div style={{ paddingTop:16 }}>
            <p style={{ fontSize:13, color:'#6B6E87', marginBottom:12, lineHeight:1.6 }}>
              Para comparar el valor del alumno con el valor ideal de la carrera en cada dimensión,
              se usa esta función:
            </p>
            <Code block>d(a, b) = (1 − |a − b| / 100)²</Code>
            <p style={{ fontSize:13, color:'#6B6E87', margin:'12px 0', lineHeight:1.6 }}>
              Devuelve un valor entre 0 y 1. El cuadrado hace que las diferencias grandes sean
              mucho más penalizantes que las pequeñas — no es lineal.
            </p>

            <div style={{ overflowX:'auto', marginBottom:16 }}>
              <table style={{ borderCollapse:'collapse', fontSize:13, width:'100%' }}>
                <thead>
                  <tr style={{ background:'#14152B', color:'#fff' }}>
                    <th style={{ padding:'8px 14px', textAlign:'left' }}>Diferencia |a−b|</th>
                    <th style={{ padding:'8px 14px', textAlign:'center' }}>Cálculo</th>
                    <th style={{ padding:'8px 14px', textAlign:'center' }}>d(a,b)</th>
                    <th style={{ padding:'8px 14px', textAlign:'left' }}>Interpretación</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [0,   'Coincidencia perfecta'],
                    [10,  'Diferencia muy pequeña'],
                    [20,  'Diferencia leve'],
                    [30,  'Diferencia moderada'],
                    [50,  'Diferencia grande'],
                    [70,  'Diferencia muy grande'],
                    [100, 'Opuesto total'],
                  ].map(([diff, label], i) => {
                    const d = Math.pow(1 - diff / 100, 2);
                    return (
                      <tr key={diff} style={{ background: i % 2 === 0 ? '#fff' : '#FAF8F3' }}>
                        <td style={{ padding:'8px 14px' }}>{diff} puntos</td>
                        <td style={{ padding:'8px 14px', textAlign:'center', fontFamily:'monospace', fontSize:12 }}>
                          (1 − {diff}/100)² = {(1-diff/100).toFixed(2)}²
                        </td>
                        <td style={{ padding:'8px 14px', textAlign:'center', fontWeight:700,
                          color: d > 0.8 ? '#059669' : d > 0.5 ? '#ca8a04' : '#e11d48' }}>
                          {d.toFixed(4)}
                        </td>
                        <td style={{ padding:'8px 14px', color:'#5A5C72' }}>{label}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p style={{ fontSize:13, color:'#6B6E87', lineHeight:1.6 }}>
              Estas distancias se combinan mediante <strong>media geométrica</strong> (raíz n-ésima del producto),
              no media aritmética. Esto es clave: una diferencia de 70 puntos en UNA dimensión no puede
              compensarse con coincidencias perfectas en las demás.
            </p>
            <Code block>
{`// MBTI (4 dimensiones → raíz 4ª)
mbtiC = (d(EI) × d(SN) × d(TF) × d(JP)) ^ (1/4)

// RIASEC (6 dimensiones → raíz 6ª)
riasecC = (d(R) × d(I) × d(A) × d(S) × d(E) × d(C)) ^ (1/6)

// Valores (4 dimensiones → raíz 4ª)
valC = (d(auto) × d(innov) × d(social) × d(growth)) ^ (1/4)

// Compatibilidad final (media geométrica ponderada)
compat = riasecC^0.50 × mbtiC^0.30 × valC^0.20

// Score de visualización (amplifica separación)
displayScore = min(99, round(compat^1.5 × 160))`}
            </Code>
          </div>
        </Section>

        {/* ── 9. SCORING POR CARRERA ── */}
        <Section n="9" title="Desglose completo por carrera — Top 10"
          subtitle="Todos los valores intermedios de cada carrera: d() por dimensión, sub-scores y score final">
          <div style={{ paddingTop:16 }}>

            {dbg.careerScoring?.top10?.map((c, i) => (
              <div key={c.name} style={{ marginBottom:20, border:'1px solid rgba(20,21,43,0.09)',
                borderRadius:14, overflow:'hidden', background:'#fff' }}>
                {/* Career header */}
                <div style={{ background: i === 0 ? '#14152B' : '#FAF8F3',
                  padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <span style={{ fontSize:12, color: i===0?'rgba(255,255,255,0.4)':'#8A8DA1' }}>
                      #{i+1} · {c.area}
                    </span>
                    <h3 style={{ fontSize:16, fontWeight:700, color: i===0?'#fff':'#14152B',
                      margin:'2px 0 0' }}>{c.name}</h3>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:28, fontWeight:900, color: i===0?'#a5b4fc':'#3B3FDB',
                      lineHeight:1 }}>{c.displayScore}%</div>
                    <div style={{ fontSize:11, color: i===0?'rgba(255,255,255,0.4)':'#8A8DA1' }}>
                      display score
                    </div>
                  </div>
                </div>

                <div style={{ padding:'14px 18px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>

                  {/* RIASEC distances */}
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:'#8A8DA1', letterSpacing:'0.08em',
                      textTransform:'uppercase', margin:'0 0 8px' }}>d() RIASEC</p>
                    {['R','I','A','S','E','C'].map(t => {
                      const myScore = result.riasec?.[t] ?? 0;
                      const idealScore = c.careerIdeal?.riasec?.[t] ?? 50;
                      const dVal = c.riasecD?.[t] ?? '—';
                      return (
                        <div key={t} style={{ fontSize:12, marginBottom:4, display:'flex',
                          justifyContent:'space-between' }}>
                          <span style={{ color: RIASEC_COLOR[t], fontWeight:600 }}>{t}</span>
                          <span style={{ color:'#5A5C72' }}>
                            {myScore}→{idealScore}
                          </span>
                          <span style={{ fontWeight:700,
                            color: typeof dVal==='number' ? (dVal>0.7?'#059669':dVal>0.4?'#ca8a04':'#e11d48') : '#8A8DA1' }}>
                            {typeof dVal==='number' ? dVal.toFixed(3) : dVal}
                          </span>
                        </div>
                      );
                    })}
                    <div style={{ borderTop:'1px dashed rgba(20,21,43,0.1)', paddingTop:6, marginTop:6 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:700 }}>
                        <span>riasecC</span>
                        <span style={{ color:'#2563eb' }}>{c.riasecC ?? '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* MBTI distances */}
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:'#8A8DA1', letterSpacing:'0.08em',
                      textTransform:'uppercase', margin:'0 0 8px' }}>d() MBTI</p>
                    {['EI','SN','TF','JP'].map(dim => {
                      const myScore = result.dimensions?.[dim] ?? 50;
                      const idealScore = c.careerIdeal?.mbti?.[dim] ?? 50;
                      const dVal = c.mbtiD?.[dim] ?? '—';
                      return (
                        <div key={dim} style={{ fontSize:12, marginBottom:4, display:'flex',
                          justifyContent:'space-between' }}>
                          <span style={{ color:'#3B3FDB', fontWeight:600 }}>{dim}</span>
                          <span style={{ color:'#5A5C72' }}>{myScore}→{idealScore}</span>
                          <span style={{ fontWeight:700,
                            color: typeof dVal==='number' ? (dVal>0.7?'#059669':dVal>0.4?'#ca8a04':'#e11d48') : '#8A8DA1' }}>
                            {typeof dVal==='number' ? dVal.toFixed(3) : dVal}
                          </span>
                        </div>
                      );
                    })}
                    <div style={{ borderTop:'1px dashed rgba(20,21,43,0.1)', paddingTop:6, marginTop:6 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:700 }}>
                        <span>mbtiC</span>
                        <span style={{ color:'#3B3FDB' }}>{c.mbtiC ?? '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Composite */}
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:'#8A8DA1', letterSpacing:'0.08em',
                      textTransform:'uppercase', margin:'0 0 8px' }}>Composición</p>
                    <div style={{ fontSize:12, marginBottom:4, display:'flex', justifyContent:'space-between' }}>
                      <span>riasecC^0.50</span>
                      <span style={{ color:'#2563eb', fontWeight:600 }}>
                        {typeof c.riasecC==='number' ? Math.pow(c.riasecC,0.50).toFixed(3) : '—'}
                      </span>
                    </div>
                    <div style={{ fontSize:12, marginBottom:4, display:'flex', justifyContent:'space-between' }}>
                      <span>mbtiC^0.30</span>
                      <span style={{ color:'#3B3FDB', fontWeight:600 }}>
                        {typeof c.mbtiC==='number' ? Math.pow(c.mbtiC,0.30).toFixed(3) : '—'}
                      </span>
                    </div>
                    {c.valC !== null && (
                      <div style={{ fontSize:12, marginBottom:4, display:'flex', justifyContent:'space-between' }}>
                        <span>valC^0.20</span>
                        <span style={{ color:'#ea580c', fontWeight:600 }}>
                          {typeof c.valC==='number' ? Math.pow(c.valC,0.20).toFixed(3) : '—'}
                        </span>
                      </div>
                    )}
                    <div style={{ borderTop:'1px dashed rgba(20,21,43,0.1)', paddingTop:6, marginTop:6 }}>
                      <div style={{ fontSize:12, marginBottom:4, display:'flex', justifyContent:'space-between' }}>
                        <span style={{ fontWeight:600 }}>rawCompat</span>
                        <span style={{ fontWeight:700 }}>{c.rawCompat ?? '—'}</span>
                      </div>
                      <div style={{ fontSize:12, marginBottom:4, display:'flex', justifyContent:'space-between' }}>
                        <span>rawCompat^1.5</span>
                        <span>{typeof c.rawCompat==='number' ? Math.pow(c.rawCompat,1.5).toFixed(3) : '—'}</span>
                      </div>
                      <div style={{ fontSize:12, marginBottom:4, display:'flex', justifyContent:'space-between' }}>
                        <span>× 160</span>
                        <span>{typeof c.rawCompat==='number' ? (Math.pow(c.rawCompat,1.5)*160).toFixed(1) : '—'}</span>
                      </div>
                      <div style={{ borderTop:'1px dashed rgba(20,21,43,0.1)', paddingTop:6, marginTop:4,
                        display:'flex', justifyContent:'space-between', fontSize:14, fontWeight:800 }}>
                        <span>displayScore</span>
                        <span style={{ color:'#3B3FDB' }}>{c.displayScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <div style={{ textAlign:'center', padding:'16px', color:'#8A8DA1', fontSize:12 }}>
          Página interna de diagnóstico — eliminar en producción.
          <br/>
          <Link href="/test/debug" style={{ color:'#3B3FDB', textDecoration:'none' }}>← Informe usuario</Link>
          {' · '}
          <Link href="/dashboard" style={{ color:'#3B3FDB', textDecoration:'none' }}>Dashboard</Link>
        </div>

      </div>
    </div>
  );
}
