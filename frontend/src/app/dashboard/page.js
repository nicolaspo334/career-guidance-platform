'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem('mindpath_user');
    if (!stored) {
      router.replace('/login');
      return;
    }
    setUser(JSON.parse(stored));
  }, []);

  const logout = () => {
    sessionStorage.removeItem('mindpath_user');
    router.push('/login');
  };

  if (!user) return null;

  const firstName = user.name.split(' ')[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            MindPath
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-slate-600 text-sm hidden sm:block">{user.name}</span>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-slate-600 text-sm transition cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">¡Hola, {firstName}!</h1>
          <p className="text-slate-600 mt-2">
            Bienvenido a tu espacio de orientación académica y profesional.
          </p>
        </div>

        {/* Main card */}
        <div className="bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shrink-0">
              🧭
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Test de orientación académica</h2>
              <p className="text-white/80 mb-4">
                Responde a unas preguntas abiertas sobre tus intereses, motivaciones y personalidad.
                Nuestro sistema de IA generará recomendaciones de carrera personalizadas junto con
                su proyección en el mercado laboral.
              </p>
              <span className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium">
                <span className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse" />
                Próximamente disponible
              </span>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: '📚',
              title: 'Carreras universitarias',
              desc: 'Más de 500 carreras analizadas y puntuadas según tu perfil.',
            },
            {
              icon: '🏛️',
              title: 'Universidades',
              desc: 'Recomendaciones de universidades adaptadas a tu nota y preferencias.',
            },
            {
              icon: '💼',
              title: 'Mercado laboral',
              desc: 'Proyecciones de empleo para 2030 incluidas en cada recomendación.',
            },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-slate-200">
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-semibold text-slate-900 mb-1">{card.title}</h3>
              <p className="text-slate-500 text-sm">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
