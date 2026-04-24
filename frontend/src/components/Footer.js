import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 font-bold text-xl text-white mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm font-stylish">E</span>
              </div>
              <span className="font-stylish">Elentio</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Plataforma de orientación académica y profesional basada en inteligencia artificial para centros educativos.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Plataforma</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#caracteristicas" className="hover:text-white transition">
                  Características
                </Link>
              </li>
              <li>
                <Link href="/#como-funciona" className="hover:text-white transition">
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link href="/solicitar-licencia" className="hover:text-white transition">
                  Solicitar licencia
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Acceder
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Términos de uso
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  RGPD
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">© 2026 Elentio. Todos los derechos reservados.</p>
          <p className="text-sm">Hecho con cuidado para la orientación educativa</p>
        </div>
      </div>
    </footer>
  );
}
