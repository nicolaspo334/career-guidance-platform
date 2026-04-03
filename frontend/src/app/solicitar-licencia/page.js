'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SolicitarLicencia() {
  const [form, setForm] = useState({
    centerName: '',
    centerType: '',
    contactName: '',
    email: '',
    phone: '',
    students: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const requests = JSON.parse(localStorage.getItem('mindpath_requests') || '[]');
    const newRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ...form,
      date: new Date().toISOString(),
      status: 'pending',
      licenseCode: null,
      maxUsers: null,
    };
    requests.push(newRequest);
    localStorage.setItem('mindpath_requests', JSON.stringify(requests));

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            ✓
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">¡Solicitud enviada!</h1>
          <p className="text-lg text-slate-600 mb-8">
            Hemos recibido la solicitud de licencia para{' '}
            <strong>{form.centerName}</strong>. Nos pondremos en contacto con{' '}
            <strong>{form.email}</strong> en las próximas 24–48 horas.
          </p>
          <Link
            href="/"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition"
          >
            Volver al inicio
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Solicitar licencia</h1>
          <p className="text-lg text-slate-600">
            Rellena el formulario y nos pondremos en contacto para activar tu licencia.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6"
        >
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombre del centro <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="centerName"
                value={form.centerName}
                onChange={handleChange}
                required
                placeholder="IES / Colegio / Centro..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tipo de centro <span className="text-red-500">*</span>
              </label>
              <select
                name="centerType"
                value={form.centerType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 bg-white"
              >
                <option value="">Seleccionar...</option>
                <option value="ies">Instituto de Educación Secundaria (IES)</option>
                <option value="colegio_publico">Colegio público</option>
                <option value="colegio_concertado">Colegio concertado</option>
                <option value="colegio_privado">Colegio privado</option>
                <option value="fp">Centro de Formación Profesional</option>
                <option value="universidad">Universidad</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Número de estudiantes (aprox.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="students"
                value={form.students}
                onChange={handleChange}
                required
                min="1"
                placeholder="200"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombre de contacto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contactName"
                value={form.contactName}
                onChange={handleChange}
                required
                placeholder="Nombre y apellidos"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="orientacion@instituto.es"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+34 600 000 000"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mensaje (opcional)
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                placeholder="Cuéntanos más sobre vuestras necesidades o cualquier duda que tengáis..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3.5 rounded-xl transition text-lg cursor-pointer"
          >
            {loading ? 'Enviando...' : 'Enviar solicitud'}
          </button>

          <p className="text-xs text-slate-500 text-center">
            Al enviar aceptas nuestra{' '}
            <Link href="#" className="text-indigo-600 hover:underline">
              política de privacidad
            </Link>
            . Tus datos serán tratados conforme al RGPD.
          </p>
        </form>
      </div>
      <Footer />
    </div>
  );
}
