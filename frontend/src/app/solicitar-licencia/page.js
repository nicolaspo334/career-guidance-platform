'use client';
import { useState } from 'react';
import Link from 'next/link';
import { requestLicense } from '@/lib/api';

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

function PageHeader() {
  return (
    <header className="e-header">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <ElentioMark size={22}/>
          <span style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 22, color: '#14152B', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: 1, paddingTop: 2 }}>
            elentio
          </span>
        </Link>
        <Link href="/" className="btn-g" style={{ textDecoration: 'none', fontSize: 13 }}>
          ← Volver al inicio
        </Link>
      </div>
    </header>
  );
}

export default function SolicitarLicencia() {
  const [form, setForm] = useState({
    centerName: '', centerType: '', contactName: '',
    email: '', phone: '', students: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await requestLicense(form);
      setSubmitted(true);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="e-page">
        <PageHeader/>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: 28 }}>
            ✓
          </div>
          <h1 style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, letterSpacing: '-0.02em', color: '#14152B', margin: '0 0 16px' }}>
            ¡Solicitud enviada!
          </h1>
          <p style={{ fontSize: 16, color: '#5A5C72', lineHeight: 1.55, margin: '0 0 32px' }}>
            Hemos recibido la solicitud de licencia para{' '}
            <strong style={{ color: '#14152B' }}>{form.centerName}</strong>. Nos pondremos en contacto con{' '}
            <strong style={{ color: '#14152B' }}>{form.email}</strong> en las próximas 24–48 horas.
          </p>
          <Link href="/" className="btn-p lg" style={{ textDecoration: 'none' }}>
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = 'e-input';
  const labelClass = 'e-label';

  return (
    <div className="e-page">
      <PageHeader/>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '56px 24px 80px' }}>
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A5C72', marginBottom: 12 }}>Para centros educativos</p>
          <h1 style={{ fontFamily: 'var(--font-instrument-serif), Georgia, serif', fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 400, letterSpacing: '-0.02em', color: '#14152B', margin: '0 0 12px' }}>
            Solicitar licencia
          </h1>
          <p style={{ fontSize: 16, color: '#5A5C72', lineHeight: 1.5, margin: 0 }}>
            Rellena el formulario y nos pondremos en contacto para activar tu licencia.
          </p>
        </div>

        <div className="e-card" style={{ padding: '32px 36px', boxShadow: '0 4px 24px rgba(20,21,43,0.06)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20 }}>
            <div>
              <label className={labelClass}>Nombre del centro <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="text" name="centerName" value={form.centerName} onChange={handleChange}
                required placeholder="IES / Colegio / Centro…" className={inputClass}/>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className={labelClass}>Tipo de centro <span style={{ color: '#ef4444' }}>*</span></label>
                <select name="centerType" value={form.centerType} onChange={handleChange} required
                  className={inputClass} style={{ appearance: 'auto' }}>
                  <option value="">Seleccionar…</option>
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
                <label className={labelClass}>Nº de estudiantes (aprox.) <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="number" name="students" value={form.students} onChange={handleChange}
                  required min="1" placeholder="200" className={inputClass}/>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className={labelClass}>Nombre de contacto <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" name="contactName" value={form.contactName} onChange={handleChange}
                  required placeholder="Nombre y apellidos" className={inputClass}/>
              </div>

              <div>
                <label className={labelClass}>Correo electrónico <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  required placeholder="orientacion@instituto.es" className={inputClass}/>
              </div>
            </div>

            <div>
              <label className={labelClass}>Teléfono</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                placeholder="+34 600 000 000" className={inputClass}/>
            </div>

            <div>
              <label className={labelClass}>Mensaje (opcional)</label>
              <textarea name="message" value={form.message} onChange={handleChange}
                rows={4} placeholder="Cuéntanos más sobre vuestras necesidades…"
                className={inputClass} style={{ resize: 'none', height: 'auto' }}/>
            </div>

            {error && <p className="e-error">{error}</p>}

            <button type="submit" disabled={loading} className="btn-p lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? 'Enviando…' : 'Enviar solicitud'}
            </button>

            <p style={{ fontSize: 12, color: '#8A8DA1', textAlign: 'center', margin: 0 }}>
              Al enviar aceptas nuestra{' '}
              <Link href="#" style={{ color: '#3B3FDB', textDecoration: 'none' }}>política de privacidad</Link>.
              Tus datos serán tratados conforme al RGPD.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
