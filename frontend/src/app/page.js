import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const features = [
  {
    icon: '💬',
    color: 'bg-blue-50 text-blue-600',
    title: 'Preguntas abiertas',
    desc: 'El alumno se expresa en sus propias palabras, sin tests rígidos ni respuestas predefinidas.',
  },
  {
    icon: '🔬',
    color: 'bg-purple-50 text-purple-600',
    title: 'Análisis RIASEC',
    desc: 'Usamos el modelo de orientación más reconocido internacionalmente para interpretar cada respuesta.',
  },
  {
    icon: '⭐',
    color: 'bg-amber-50 text-amber-600',
    title: 'Recomendaciones personalizadas',
    desc: 'El sistema genera varias opciones de carrera con una explicación clara de por qué encajan con el alumno.',
  },
  {
    icon: '📈',
    color: 'bg-green-50 text-green-600',
    title: 'Tendencias laborales',
    desc: 'Combinamos el perfil del alumno con proyecciones del mercado laboral para 2030+ en cada recomendación.',
  },
];

const steps = [
  {
    title: 'El alumno responde',
    desc: 'A través de preguntas abiertas sobre sus intereses, motivaciones y experiencias personales.',
  },
  {
    title: 'La IA analiza',
    desc: 'Procesamos sus respuestas con modelos de embedding y el marco RIASEC para construir su perfil.',
  },
  {
    title: 'Se generan recomendaciones',
    desc: 'Carreras, universidades y salidas profesionales ordenadas por compatibilidad y proyección futura.',
  },
];

const benefits = [
  'Panel de administración para gestionar alumnos',
  'Informes exportables por alumno',
  'Configuración adaptada a tu centro',
  'Soporte técnico y formación incluidos',
  'Alta privacidad y cumplimiento RGPD',
];

const licenseFeatures = [
  { icon: '👥', title: 'Usuarios configurables', desc: 'Licencia adaptada al tamaño de tu centro' },
  { icon: '🤖', title: 'IA de orientación completa', desc: 'Carreras, universidades y empleo' },
  { icon: '📊', title: 'Panel de administración', desc: 'Gestiona todos tus alumnos en un solo lugar' },
  { icon: '🔒', title: 'Datos seguros y privados', desc: 'Cumplimiento total con RGPD' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(6,182,212,0.3) 0%, transparent 50%)',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-8">
            <span className="w-2 h-2 bg-cyan-400 rounded-full inline-block" style={{ animation: 'pulse 2s infinite' }} />
            Orientación académica potenciada por IA
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Cada estudiante merece
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
              su propio camino
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            MindPath analiza los intereses, motivaciones y personalidad de cada alumno para recomendar carreras y salidas profesionales que realmente encajen con ellos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/solicitar-licencia"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl transition text-lg"
            >
              Solicitar licencia para tu centro →
            </Link>
            <Link
              href="/login"
              className="bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-4 rounded-xl border border-white/20 transition text-lg"
            >
              Acceder a la plataforma
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 justify-center mt-20 pt-12 border-t border-white/10">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">3 modelos</div>
              <div className="text-slate-400 text-sm mt-1">de orientación con IA</div>
            </div>
            <div className="hidden sm:block w-px bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">+500</div>
              <div className="text-slate-400 text-sm mt-1">carreras universitarias</div>
            </div>
            <div className="hidden sm:block w-px bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">RIASEC</div>
              <div className="text-slate-400 text-sm mt-1">método validado internacionalmente</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="caracteristicas" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">¿Por qué MindPath?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Un enfoque diferente a la orientación tradicional, diseñado para el alumno real.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4 text-2xl`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Cómo funciona</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Un proceso sencillo y personalizado en tres pasos.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl text-2xl font-bold mb-6 flex items-center justify-center mx-auto">
                  {i + 1}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For centers */}
      <section id="centros" className="py-24 bg-indigo-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-800 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-6">
                B2B SaaS para centros educativos
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Integra MindPath en tu centro educativo
              </h2>
              <p className="text-indigo-200 text-lg mb-8 leading-relaxed">
                Ofrecemos licencias por centro con acceso para todos tus alumnos. Solicita tu licencia y descubre cómo MindPath puede transformar tu departamento de orientación.
              </p>
              <ul className="space-y-3 mb-10">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-0.5 font-bold">✓</span>
                    <span className="text-indigo-200">{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/solicitar-licencia"
                className="inline-block bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-8 py-4 rounded-xl transition text-lg"
              >
                Solicitar licencia gratuita
              </Link>
            </div>
            <div className="bg-indigo-800/50 rounded-2xl p-8 border border-indigo-700">
              <h3 className="font-semibold text-lg mb-6 text-center">¿Qué incluye la licencia?</h3>
              <div className="space-y-4">
                {licenseFeatures.map((lf, i) => (
                  <div key={i} className="flex items-center gap-4 bg-indigo-800/50 rounded-xl p-4">
                    <span className="text-2xl">{lf.icon}</span>
                    <div>
                      <div className="font-medium">{lf.title}</div>
                      <div className="text-indigo-300 text-sm">{lf.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">¿Listo para empezar?</h2>
          <p className="text-xl text-white/80 mb-8">
            Solicita tu licencia ahora y empieza a orientar a tus alumnos de forma personalizada.
          </p>
          <Link
            href="/solicitar-licencia"
            className="inline-block bg-white text-indigo-600 font-bold px-10 py-4 rounded-xl hover:bg-indigo-50 transition text-lg"
          >
            Solicitar licencia →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
