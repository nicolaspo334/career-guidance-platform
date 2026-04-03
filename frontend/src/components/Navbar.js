'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-slate-900">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          MindPath
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/#caracteristicas" className="text-slate-600 hover:text-slate-900 transition">
            Características
          </Link>
          <Link href="/#como-funciona" className="text-slate-600 hover:text-slate-900 transition">
            Cómo funciona
          </Link>
          <Link href="/#centros" className="text-slate-600 hover:text-slate-900 transition">
            Para centros
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/licencias" className="text-slate-600 hover:text-slate-900 px-4 py-2 text-sm transition">
            Portal centros
          </Link>
          <Link href="/login" className="text-slate-600 hover:text-slate-900 px-4 py-2 text-sm transition">
            Iniciar sesión
          </Link>
          <Link
            href="/solicitar-licencia"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Solicitar licencia
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-slate-600"
          onClick={() => setOpen(!open)}
          aria-label="Abrir menú"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-3 text-sm">
          <Link href="/#caracteristicas" className="text-slate-600 py-2" onClick={() => setOpen(false)}>
            Características
          </Link>
          <Link href="/#como-funciona" className="text-slate-600 py-2" onClick={() => setOpen(false)}>
            Cómo funciona
          </Link>
          <Link href="/#centros" className="text-slate-600 py-2" onClick={() => setOpen(false)}>
            Para centros
          </Link>
          <hr className="border-slate-100" />
          <Link href="/login" className="text-slate-600 py-2" onClick={() => setOpen(false)}>
            Iniciar sesión
          </Link>
          <Link
            href="/solicitar-licencia"
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-center font-medium"
            onClick={() => setOpen(false)}
          >
            Solicitar licencia
          </Link>
        </div>
      )}
    </nav>
  );
}
