'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isUserLoggedIn, getDegreeCategory, getDegreeType } from '@/lib/api';

// ── Label maps ────────────────────────────────────────────────────────────────

const MBTI_LABELS = {
  EI: ['Introvertido', 'Extrovertido'],
  SN: ['Intuitivo',    'Sensorial'],
  TF: ['Emocional',   'Racional'],
  JP: ['Flexible',    'Planificador'],
};

const RIASEC_INFO = {
  R: { name: 'Realista',      desc: 'Trabajo práctico y manual',          color: '#ea580c', bg: 'rgba(234,88,12,0.08)' },
  I: { name: 'Investigativo', desc: 'Análisis y resolución de problemas',  color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  A: { name: 'Artístico',     desc: 'Creatividad y expresión',             color: '#ec4899', bg: 'rgba(236,72,153,0.08)' },
  S: { name: 'Social',        desc: 'Ayudar y cuidar personas',            color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
  E: { name: 'Emprendedor',   desc: 'Liderar y gestionar',                 color: '#ca8a04', bg: 'rgba(234,179,8,0.08)' },
  C: { name: 'Convencional',  desc: 'Datos, orden y procedimientos',       color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
};

const NEO_INFO = {
  O:  { name: 'Apertura',        desc: 'Curiosidad e interés por nuevas ideas' },
  C:  { name: 'Responsabilidad', desc: 'Organización y autodisciplina' },
  E:  { name: 'Extraversión',    desc: 'Energía social y sociabilidad' },
  A:  { name: 'Amabilidad',      desc: 'Cooperación y empatía' },
  N:  { name: 'Neuroticismo',    desc: 'Sensibilidad emocional' },
};

// ── RIASEC vocational guidance ────────────────────────────────────────────────

const RIASEC_GUIDANCE = {
  R: {
    name: 'Realista', color: '#ea580c', bg: 'rgba(234,88,12,0.06)',
    description: 'Trabajo práctico con herramientas, máquinas o entornos naturales. Resolución de problemas concretos y tangibles.',
    jobGroups: [
      { sector: 'Ingeniería y construcción', jobs: ['Ingeniero civil', 'Ingeniero de obras públicas', 'Arquitecto técnico', 'Ingeniero topógrafo', 'Técnico de mantenimiento industrial', 'Inspector de infraestructuras'] },
      { sector: 'Industria y fabricación', jobs: ['Ingeniero de producción', 'Técnico en automatización', 'Mecánico industrial', 'Técnico en robótica', 'Operador de planta química', 'Técnico en calidad'] },
      { sector: 'Energía y medioambiente', jobs: ['Ingeniero energético', 'Técnico en energías renovables', 'Geólogo', 'Técnico ambiental', 'Ingeniero de minas', 'Técnico forestal'] },
      { sector: 'Ciencias agrarias y naturales', jobs: ['Agrónomo', 'Ingeniero agroalimentario', 'Veterinario de campo', 'Técnico en acuicultura', 'Guardabosques', 'Oceanógrafo'] },
    ],
    categories: [
      { id: 'ing_civil',      name: 'Ingeniería Civil y Construcción' },
      { id: 'ing_industrial', name: 'Ingeniería Industrial y Mecánica' },
      { id: 'ing_electrica',  name: 'Ingeniería Eléctrica y Electrónica' },
      { id: 'ing_quimica',    name: 'Ingeniería Química y Materiales' },
      { id: 'agricultura',    name: 'Agronomía y Ciencias Agrarias' },
    ],
  },
  I: {
    name: 'Investigativo', color: '#3b82f6', bg: 'rgba(59,130,246,0.06)',
    description: 'Investigación, análisis y resolución de problemas complejos. Ciencia, tecnología y pensamiento lógico-abstracto.',
    jobGroups: [
      { sector: 'Tecnología e informática', jobs: ['Ingeniero de software', 'Científico de datos', 'Investigador en IA', 'Arquitecto de sistemas', 'Ingeniero en ciberseguridad', 'Desarrollador de videojuegos', 'Analista de datos'] },
      { sector: 'Ciencias exactas', jobs: ['Matemático', 'Físico', 'Estadístico', 'Actuario', 'Investigador en criptografía', 'Astrónomo', 'Modelador climático'] },
      { sector: 'Ciencias de la vida', jobs: ['Biólogo molecular', 'Bioquímico', 'Genetista', 'Farmacólogo', 'Neurocientífico', 'Biotecnólogo', 'Investigador en vacunas'] },
      { sector: 'Medicina y salud investigadora', jobs: ['Médico especialista', 'Cirujano', 'Epidemiólogo', 'Investigador clínico', 'Radiólogo', 'Farmacéutico investigador'] },
    ],
    categories: [
      { id: 'informatica', name: 'Informática e Inteligencia Artificial' },
      { id: 'ciencias',    name: 'Ciencias (Física, Química, Biología)' },
      { id: 'medicina',    name: 'Medicina y Ciencias Biomédicas' },
      { id: 'ing_quimica', name: 'Ingeniería Química y Materiales' },
    ],
  },
  A: {
    name: 'Artístico', color: '#ec4899', bg: 'rgba(236,72,153,0.06)',
    description: 'Creación, diseño y expresión. Trabajo con ideas estéticas, narrativas y proyectos creativos sin estructura rígida.',
    jobGroups: [
      { sector: 'Diseño y arquitectura', jobs: ['Diseñador gráfico', 'Diseñador UX/UI', 'Diseñador de moda', 'Diseñador industrial', 'Arquitecto', 'Diseñador de interiores', 'Ilustrador', 'Director de arte'] },
      { sector: 'Medios y comunicación creativa', jobs: ['Periodista', 'Guionista', 'Realizador audiovisual', 'Editor de contenidos', 'Fotógrafo', 'Community manager', 'Productor de podcast'] },
      { sector: 'Artes escénicas y música', jobs: ['Actor', 'Músico', 'Compositor', 'Productor musical', 'Director de teatro', 'Coreógrafo', 'Animador 3D'] },
      { sector: 'Escritura y humanidades', jobs: ['Escritor', 'Traductor literario', 'Filólogo', 'Crítico cultural', 'Historiador del arte', 'Curador de museos', 'Editor editorial'] },
    ],
    categories: [
      { id: 'arte_diseno',  name: 'Arte, Diseño y Arquitectura' },
      { id: 'comunicacion', name: 'Comunicación y Periodismo' },
      { id: 'humanidades',  name: 'Humanidades y Ciencias del Lenguaje' },
    ],
  },
  S: {
    name: 'Social', color: '#16a34a', bg: 'rgba(34,197,94,0.06)',
    description: 'Ayudar, enseñar y cuidar personas. Trabajo en entornos humanos con impacto en el bienestar de la comunidad.',
    jobGroups: [
      { sector: 'Educación', jobs: ['Maestro de Primaria', 'Profesor de Secundaria', 'Orientador educativo', 'Logopeda', 'Pedagogo', 'Educador especial', 'Formador de adultos'] },
      { sector: 'Salud y cuidados', jobs: ['Médico de familia', 'Enfermero/a', 'Fisioterapeuta', 'Terapeuta ocupacional', 'Dentista', 'Nutricionista', 'Matron/a'] },
      { sector: 'Psicología y bienestar', jobs: ['Psicólogo clínico', 'Psicólogo educativo', 'Coach', 'Psicoterapeuta', 'Trabajador de salud mental', 'Counselor'] },
      { sector: 'Trabajo social y comunitario', jobs: ['Trabajador social', 'Educador social', 'Mediador familiar', 'Técnico en integración social', 'Gestor de ONG', 'Cooperante internacional'] },
    ],
    categories: [
      { id: 'educacion', name: 'Educación y Pedagogía' },
      { id: 'salud',     name: 'Ciencias de la Salud' },
      { id: 'sociales',  name: 'Ciencias Sociales y Trabajo Social' },
      { id: 'medicina',  name: 'Medicina y Ciencias Biomédicas' },
    ],
  },
  E: {
    name: 'Emprendedor', color: '#ca8a04', bg: 'rgba(234,179,8,0.06)',
    description: 'Liderar, persuadir y gestionar. Negocios, política y entornos donde influir en personas y decisiones estratégicas.',
    jobGroups: [
      { sector: 'Empresa y gestión', jobs: ['Director general (CEO)', 'Emprendedor/Fundador', 'Consultor estratégico', 'Gestor de proyectos', 'Director de operaciones', 'Responsable de expansión', 'Business developer'] },
      { sector: 'Finanzas y banca', jobs: ['Analista financiero', 'Gestor de inversiones', 'Banquero de inversión', 'Gestor de fondos', 'Director financiero', 'Analista de M&A', 'Asesor patrimonial'] },
      { sector: 'Derecho y relaciones internacionales', jobs: ['Abogado de empresa', 'Diplomático', 'Político', 'Funcionario internacional (UE, ONU)', 'Negociador', 'Lobbyist', 'Jurista internacional'] },
      { sector: 'Ventas y desarrollo de negocio', jobs: ['Director comercial', 'Key account manager', 'Director de ventas', 'Gestor de cuentas globales', 'Sales engineer', 'Responsable de partnerships'] },
    ],
    categories: [
      { id: 'empresa',   name: 'Economía, ADE y Empresa' },
      { id: 'derecho',   name: 'Derecho y Ciencias Jurídicas' },
      { id: 'sociales',  name: 'Ciencias Políticas y Relaciones Internacionales' },
    ],
  },
  C: {
    name: 'Convencional', color: '#64748b', bg: 'rgba(100,116,139,0.06)',
    description: 'Organización, datos y procedimientos. Trabajo estructurado con sistemas, registros y normativas claras.',
    jobGroups: [
      { sector: 'Contabilidad y finanzas', jobs: ['Contable', 'Auditor', 'Controller financiero', 'Técnico fiscal', 'Analista contable', 'Técnico en nóminas', 'Gestor tributario'] },
      { sector: 'Administración y RRHH', jobs: ['Técnico en RRHH', 'Administrador de empresas', 'Gestor de nóminas', 'Técnico en PRL', 'Responsable de cumplimiento (compliance)', 'Secretario/a de dirección'] },
      { sector: 'Logística y operaciones', jobs: ['Gestor logístico', 'Responsable de cadena de suministro', 'Planificador de producción', 'Técnico en compras', 'Coordinador de almacén', 'Gestor de inventarios'] },
      { sector: 'Tecnología y sistemas', jobs: ['Administrador de sistemas', 'Técnico de soporte TI', 'DBA (administrador de bases de datos)', 'Técnico en redes', 'Analista de procesos', 'Gestor de ERP'] },
    ],
    categories: [
      { id: 'empresa',        name: 'Economía, ADE y Empresa' },
      { id: 'informatica',    name: 'Informática e Inteligencia Artificial' },
      { id: 'ing_industrial', name: 'Ingeniería Industrial y Mecánica' },
    ],
  },
};

// ── Small helpers ─────────────────────────────────────────────────────────────

function ElentioMark({ size = 22 }) {
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

function Bar({ pct, color = '#3B3FDB', height = 5 }) {
  return (
    <div style={{ width: '100%', height, background: 'rgba(20,21,43,0.07)', borderRadius: height, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: height, transition: 'width 0.6s ease' }}/>
    </div>
  );
}

function ScoreBar({ score }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
      <div style={{ flex: 1 }}>
        <Bar pct={score} color="#3B3FDB"/>
      </div>
      <span style={{ fontSize: 12, color: '#3B3FDB', fontWeight: 600, width: 32, textAlign: 'right', flexShrink: 0 }}>{score}%</span>
    </div>
  );
}

function FutureBar({ score: _score }) {
  const score = 100; // TODO: calibrar con datos reales de mercado laboral
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
      <div style={{ flex: 1 }}>
        <Bar pct={score} color="#22c55e"/>
      </div>
      <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, width: 32, textAlign: 'right', flexShrink: 0 }}>{score}%</span>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="e-card" style={{ padding: '24px 28px', boxShadow: '0 1px 0 rgba(20,21,43,0.02), 0 4px 16px rgba(20,21,43,0.05)' }}>
      <h2 style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 20, fontWeight: 400, color: '#14152B', margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 12, color: '#8A8DA1', margin: '4px 0 20px', lineHeight: 1.4 }}>{subtitle}</p>}
      {!subtitle && <div style={{ marginTop: 20 }}/>}
      {children}
    </div>
  );
}

// ── University / degree drill-down ────────────────────────────────────────────

function UniversityList({ typeId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    getDegreeType(typeId).then(setData).catch(() => setData({ universities: [] }));
  }, [typeId]);

  if (!data) return <p style={{ fontSize: 12, color: '#8A8DA1', padding: '8px 0 4px 16px' }}>Cargando…</p>;
  if (!data.universities?.length) return <p style={{ fontSize: 12, color: '#8A8DA1', padding: '4px 0 4px 16px' }}>Sin datos disponibles.</p>;

  return (
    <div style={{ paddingLeft: 16, paddingBottom: 8, display: 'grid', gap: 3, marginTop: 4 }}>
      {data.universities.map(u => (
        <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#5A5C72' }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(20,21,43,0.2)', flexShrink: 0 }}/>
          {u.university}
        </div>
      ))}
    </div>
  );
}

function DegreeRowItem({ degree, rank }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(20,21,43,0.05)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 10px', background: open ? 'rgba(20,21,43,0.03)' : 'transparent',
          border: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: 8,
          fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 11, color: '#C4C6D4', width: 20, flexShrink: 0, textAlign: 'right' }}>{rank + 1}.</span>
        <span style={{ fontSize: 13, color: '#3A3C55', flex: 1, lineHeight: 1.35 }}>{degree.name}</span>
        <span style={{ fontSize: 11, color: '#8A8DA1', flexShrink: 0 }}>{degree.universityCount} univ.</span>
        <span style={{ fontSize: 10, color: '#C4C6D4', marginLeft: 4 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <UniversityList typeId={degree.id}/>}
    </div>
  );
}

function CategoryItem({ catId, catName, profile }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next && !data) {
      getDegreeCategory(catId, profile)
        .then(setData)
        .catch(() => setData({ degrees: [] }));
    }
  };

  return (
    <div style={{ border: '1px solid rgba(20,21,43,0.08)', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
      <button
        onClick={handleOpen}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 14px', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 10, color: '#C4C6D4', width: 12 }}>{open ? '▲' : '▼'}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#3A3C55', flex: 1 }}>{catName}</span>
        <span style={{ fontSize: 11, color: '#8A8DA1' }}>{open ? 'Cerrar' : 'Ver grados'}</span>
      </button>
      {open && (
        <div style={{ borderTop: '1px solid rgba(20,21,43,0.06)', padding: '4px 6px 4px' }}>
          {!data && <p style={{ fontSize: 12, color: '#8A8DA1', padding: '8px 10px' }}>Cargando grados…</p>}
          {data?.degrees?.length === 0 && <p style={{ fontSize: 12, color: '#8A8DA1', padding: '8px 10px' }}>Sin grados disponibles.</p>}
          {data?.degrees?.slice(0, 20).map((d, i) => (
            <DegreeRowItem key={d.id} degree={d} rank={i}/>
          ))}
        </div>
      )}
    </div>
  );
}

function RiasecGuidance({ riasec, profile }) {
  const sorted = Object.entries(riasec || {})
    .filter(([k]) => k !== 'code')
    .sort((a, b) => b[1] - a[1]);

  const topTypes = sorted.filter(([, v]) => v >= 55).slice(0, 3);

  if (!topTypes.length) return (
    <p style={{ color: '#8A8DA1', fontSize: 14, padding: '16px 0' }}>
      Tu perfil es muy equilibrado entre varios tipos vocacionales. Explora las áreas con mayor puntuación en tu código RIASEC arriba.
    </p>
  );

  const areaLabels = ['1ª área', '2ª área', '3ª área'];

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {topTypes.map(([type, score], idx) => {
        const g = RIASEC_GUIDANCE[type];
        if (!g) return null;
        return (
          <div key={type} style={{ border: `1px solid ${g.color}22`, borderRadius: 16, overflow: 'hidden', background: g.bg }}>
            <div style={{ padding: '22px 22px 20px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '4px 10px', borderRadius: 999, flexShrink: 0,
                  background: `${g.color}18`, color: g.color,
                }}>
                  {areaLabels[idx]}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#14152B', margin: 0 }}>{g.name}</h3>
                    <span style={{ fontSize: 13, color: g.color, fontWeight: 600 }}>{score}/100</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#5A5C72', margin: 0, lineHeight: 1.45 }}>{g.description}</p>
                </div>
              </div>

              {/* Score bar */}
              <div style={{ marginBottom: 20 }}>
                <Bar pct={score} color={g.color} height={4}/>
              </div>

              {/* Jobs grouped by sector */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8DA1', margin: '0 0 12px' }}>
                  Empleos típicos
                </p>
                <div style={{ display: 'grid', gap: 12 }}>
                  {g.jobGroups.map(group => (
                    <div key={group.sector}>
                      <p style={{ fontSize: 11, color: '#8A8DA1', fontWeight: 500, margin: '0 0 6px' }}>{group.sector}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {group.jobs.map(job => (
                          <span key={job} style={{
                            fontSize: 11, padding: '4px 10px', borderRadius: 999, fontWeight: 500,
                            background: `${g.color}15`, color: g.color,
                          }}>
                            {job}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Degree categories */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8DA1', margin: '0 0 10px' }}>
                  Grados universitarios relacionados
                </p>
                <div style={{ display: 'grid', gap: 6 }}>
                  {g.categories.map(cat => (
                    <CategoryItem key={cat.id} catId={cat.id} catName={cat.name} profile={profile}/>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MbtiResultado() {
  const [result, setResult] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoggedIn()) { router.replace('/login'); return; }
    const stored = sessionStorage.getItem('elentio_mbti_result');
    if (!stored) { router.replace('/test/mbti'); return; }
    try { setResult(JSON.parse(stored)); }
    catch { router.replace('/test/mbti'); }
  }, []);

  if (!result) return null;

  const { mbtiType, mbtiLabel, mbtiTagline, dimensions, riasec, neo, analysis, careers } = result;

  const profile = {
    EI: dimensions?.EI ?? 50, SN: dimensions?.SN ?? 50,
    TF: dimensions?.TF ?? 50, JP: dimensions?.JP ?? 50,
    R: riasec?.R ?? 50, I: riasec?.I ?? 50, A: riasec?.A ?? 50,
    S: riasec?.S ?? 50, E: riasec?.E ?? 50, C: riasec?.C ?? 50,
    O: neo?.O ?? 50, NC: neo?.C ?? 50, NE: neo?.E ?? 50,
    NA: neo?.A ?? 50, NN: neo?.N ?? 50,
  };

  const dims = [
    { key: 'EI', score: dimensions?.EI ?? 50 },
    { key: 'SN', score: dimensions?.SN ?? 50 },
    { key: 'TF', score: dimensions?.TF ?? 50 },
    { key: 'JP', score: dimensions?.JP ?? 50 },
  ];

  const riasecEntries = Object.entries(riasec || {})
    .filter(([k]) => k !== 'code')
    .sort((a, b) => b[1] - a[1]);

  const neoEntries = Object.entries(neo || {}).filter(([k]) => k !== 'code');

  const rankStyle = (i) => {
    if (i === 0) return { background: 'rgba(217,166,71,0.15)', color: '#b45309' };
    if (i === 1) return { background: 'rgba(100,116,139,0.12)', color: '#475569' };
    if (i === 2) return { background: 'rgba(180,83,9,0.1)', color: '#9a3412' };
    return { background: 'rgba(20,21,43,0.06)', color: '#5A5C72' };
  };

  return (
    <div className="e-page">
      {/* Header */}
      <header className="e-header">
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <ElentioMark size={22}/>
            <span style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 22, color: '#14152B', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: 1, paddingTop: 2 }}>
              elentio
            </span>
          </Link>
          <Link href="/dashboard" style={{ fontSize: 13, color: '#8A8DA1', textDecoration: 'none' }}>
            ← Volver al inicio
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px', display: 'grid', gap: 16 }}>

        {/* MBTI type hero card */}
        <div style={{ background: '#14152B', borderRadius: 20, padding: '32px 36px', color: '#F5F2EA' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,242,234,0.5)', margin: '0 0 16px', fontWeight: 600 }}>
            Tu tipo de personalidad
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 'clamp(52px, 8vw, 72px)', letterSpacing: '0.06em', lineHeight: 1, color: '#F5F2EA' }}>
              {mbtiType}
            </span>
            {mbtiLabel && (
              <span style={{ fontFamily: 'var(--font-instrument-serif), serif', fontSize: 24, color: 'rgba(245,242,234,0.7)', fontStyle: 'italic' }}>
                {mbtiLabel}
              </span>
            )}
          </div>
          {mbtiTagline && (
            <p style={{ fontSize: 14, color: 'rgba(245,242,234,0.65)', margin: '0 0 20px' }}>{mbtiTagline}</p>
          )}
          {analysis && (
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: 14, color: 'rgba(245,242,234,0.85)', lineHeight: 1.65, margin: 0 }}>{analysis}</p>
            </div>
          )}
        </div>

        {/* MBTI dimensions */}
        <Section title="Dimensiones MBTI" subtitle="Tus cuatro ejes de personalidad según el modelo Myers-Briggs">
          <div style={{ display: 'grid', gap: 20 }}>
            {dims.map(({ key, score }) => {
              const [leftLabel, rightLabel] = MBTI_LABELS[key];
              const leftScore = 100 - score;
              const dominant = score >= 50 ? rightLabel : leftLabel;
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                    <span style={{ color: leftScore > score ? '#3B3FDB' : '#8A8DA1', fontWeight: leftScore > score ? 600 : 400 }}>
                      {leftLabel} ({leftScore}%)
                    </span>
                    <span style={{ color: score >= 50 ? '#3B3FDB' : '#8A8DA1', fontWeight: score >= 50 ? 600 : 400 }}>
                      {rightLabel} ({score}%)
                    </span>
                  </div>
                  <div style={{ position: 'relative', height: 8, background: 'rgba(20,21,43,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${score}%`, background: '#3B3FDB', borderRadius: 4, transition: 'width 0.6s ease' }}/>
                    <div style={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: 1.5, background: 'rgba(255,255,255,0.7)' }}/>
                  </div>
                  <p style={{ fontSize: 11, color: '#8A8DA1', marginTop: 5 }}>
                    Tendencia: <strong style={{ color: '#3A3C55' }}>{dominant}</strong>
                  </p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* RIASEC profile */}
        {riasec && (
          <Section title="Perfil de Intereses RIASEC" subtitle="Modelo de Holland — tus 6 tipos de interés vocacional">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div/>
              {riasec.code && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-instrument-serif), serif', fontSize: 36, letterSpacing: '0.1em', color: '#3B3FDB', lineHeight: 1 }}>{riasec.code}</div>
                  <p style={{ fontSize: 11, color: '#8A8DA1', margin: '3px 0 0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Código RIASEC</p>
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              {riasecEntries.map(([key, score]) => {
                const info = RIASEC_INFO[key];
                if (!info) return null;
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: info.bg, color: info.color }}>
                          {info.name}
                        </span>
                        <span style={{ fontSize: 12, color: '#8A8DA1' }}>{info.desc}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: info.color }}>{score}%</span>
                    </div>
                    <Bar pct={score} color={info.color} height={5}/>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* NEO Big Five */}
        {neo && (
          <Section title="Perfil NEO Big Five" subtitle="Los cinco grandes factores de personalidad">
            <div style={{ display: 'grid', gap: 14 }}>
              {neoEntries.map(([key, score]) => {
                const info = NEO_INFO[key];
                if (!info) return null;
                const isN = key === 'N';
                const barColor = isN
                  ? (score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#22c55e')
                  : '#3B3FDB';
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#14152B' }}>{info.name}</span>
                        <span style={{ fontSize: 12, color: '#8A8DA1', marginLeft: 8 }}>{info.desc}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: barColor }}>{score}%</span>
                    </div>
                    <Bar pct={score} color={barColor} height={5}/>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Career recommendations */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 24, fontWeight: 400, color: '#14152B', margin: '8px 0 6px', letterSpacing: '-0.01em' }}>
            Tus áreas más compatibles
          </h2>
          <p style={{ fontSize: 13, color: '#8A8DA1', margin: '0 0 18px', lineHeight: 1.5 }}>
            Basadas en compatibilidad RIASEC (35%) + MBTI (35%) + NEO (30%) y proyección laboral.
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            {careers?.map((career, i) => (
              <div key={career.id} className="e-card" style={{ padding: '20px 22px', boxShadow: '0 1px 0 rgba(20,21,43,0.02), 0 4px 12px rgba(20,21,43,0.05)' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0,
                    ...rankStyle(i),
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#14152B', margin: 0 }}>{career.name}</h3>
                      {career.area && (
                        <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 999, background: 'rgba(59,63,219,0.08)', color: '#3B3FDB' }}>
                          {career.area}
                        </span>
                      )}
                    </div>
                    {career.description && (
                      <p style={{ fontSize: 13, color: '#5A5C72', margin: '0 0 14px', lineHeight: 1.5 }}>{career.description}</p>
                    )}

                    {/* Global score bar */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8A8DA1', marginBottom: 5 }}>
                        <span>Puntuación global</span>
                        <span style={{ fontWeight: 700, color: '#3B3FDB' }}>{career.score}%</span>
                      </div>
                      <Bar pct={career.score} color="#3B3FDB" height={6}/>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <span style={{ fontSize: 11, color: '#8A8DA1' }}>Compatibilidad</span>
                        <ScoreBar score={career.compatScore}/>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#8A8DA1' }}>Futuro laboral</span>
                        <FutureBar score={career.futureScore}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIASEC vocational guidance */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 24, fontWeight: 400, color: '#14152B', margin: '8px 0 6px', letterSpacing: '-0.01em' }}>
            Áreas vocacionales y grados universitarios
          </h2>
          <p style={{ fontSize: 13, color: '#8A8DA1', margin: '0 0 18px', lineHeight: 1.5 }}>
            Basado en tu código RIASEC <strong style={{ color: '#14152B' }}>{riasec?.code}</strong>.
            Las áreas donde tu perfil encaja según la teoría vocacional de Holland, con los grados del
            catálogo del Ministerio de Educación que puedes explorar.
          </p>
          <RiasecGuidance riasec={riasec} profile={profile}/>
        </div>

        {/* Footer action */}
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <button
            onClick={() => {
              sessionStorage.removeItem('elentio_mbti_result');
              router.push('/test/mbti');
            }}
            className="btn-g"
          >
            ↻ Repetir el test
          </button>
        </div>

        {/* O*NET attribution (required by terms of service) */}
        <div style={{ borderTop: '1px solid rgba(20,21,43,0.07)', paddingTop: 20, marginTop: 8 }}>
          <p style={{ fontSize: 11, color: '#C4C6D4', lineHeight: 1.6, textAlign: 'center', margin: 0 }}>
            This site incorporates information from{' '}
            <a href="https://www.onetcenter.org" target="_blank" rel="noopener noreferrer" style={{ color: '#8A8DA1', textDecoration: 'none' }}>
              O*NET Web Services
            </a>{' '}
            by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA).
            O*NET® is a trademark of USDOL/ETA.
          </p>
        </div>
      </div>
    </div>
  );
}
