import {
  hashPassword, verifyPassword, signJWT, verifyJWT,
  generateId, generateLicenseCode, generateSecurePassword,
} from './crypto.js';
import { sendLicenseApprovedEmail } from './email.js';

// ── Career areas database ─────────────────────────────────────────────────────
// 10 broad knowledge areas. Each profile is the RIASEC/MBTI centroid for the
// cluster of Spanish university degrees in that field (O*NET calibrated).
// EI: 0=Introvertido, 100=Extrovertido · SN: 0=Intuitivo, 100=Sensorial
// TF: 0=Emocional, 100=Racional · JP: 0=Flexible, 100=Planificador
// future: WEF net-employment-change score (piecewise-linear → 0-100 via normalizeWEF)
const CAREERS = [
  { id: 'tecnologia_innovacion', name: 'Tecnología e Innovación Digital',
    area: 'Ingeniería',
    description: 'Programación, inteligencia artificial, datos, ciberseguridad y telecomunicaciones. El sector con mayor crecimiento laboral de la próxima década.',
    mbti:{EI:28,SN:42,TF:82,JP:58}, riasec:{R:45,I:92,A:35,S:12,E:30,C:68},
    values:{autonomy:65,innovative:80,socialImpact:35,growth:65}, future:58 },

  { id: 'economia_empresa', name: 'Economía, Empresa y Finanzas',
    area: 'Economía y Administración de Empresas',
    description: 'Dirección de empresas, economía, marketing, finanzas y comercio internacional. Formación para liderar organizaciones y tomar decisiones estratégicas.',
    mbti:{EI:52,SN:55,TF:68,JP:65}, riasec:{R:15,I:65,A:25,S:40,E:82,C:72},
    values:{autonomy:65,innovative:65,socialImpact:38,growth:62}, future:25 },

  { id: 'derecho_juridicas', name: 'Derecho y Ciencias Jurídicas',
    area: 'Derecho y Ciencias Jurídicas',
    description: 'Derecho, relaciones internacionales, ciencias políticas y criminología. Para quienes quieren entender y transformar las normas que rigen la sociedad.',
    mbti:{EI:45,SN:42,TF:55,JP:55}, riasec:{R:8,I:58,A:30,S:52,E:80,C:58},
    values:{autonomy:62,innovative:52,socialImpact:65,growth:55}, future:14 },

  { id: 'ciencias_salud', name: 'Ciencias de la Salud',
    area: 'Ciencias de la Salud',
    description: 'Medicina, enfermería, farmacia, fisioterapia y nutrición. Carreras orientadas al diagnóstico, cuidado y mejora de la salud humana.',
    mbti:{EI:38,SN:58,TF:45,JP:62}, riasec:{R:45,I:70,A:15,S:82,E:22,C:55},
    values:{autonomy:50,innovative:55,socialImpact:88,growth:55}, future:35 },

  { id: 'psicologia_sociales', name: 'Psicología y Ciencias Sociales',
    area: 'Ciencias Sociales',
    description: 'Psicología, trabajo social, sociología, comunicación y periodismo. Para entender el comportamiento humano y transformar la sociedad.',
    mbti:{EI:42,SN:35,TF:28,JP:45}, riasec:{R:12,I:60,A:38,S:78,E:42,C:38},
    values:{autonomy:55,innovative:55,socialImpact:80,growth:50}, future:20 },

  { id: 'ingenieria_industrial', name: 'Ingeniería Industrial y Tecnológica',
    area: 'Ingeniería',
    description: 'Ingeniería civil, mecánica, eléctrica, química, energías renovables y construcción. Diseñar y optimizar los sistemas del mundo físico.',
    mbti:{EI:32,SN:68,TF:82,JP:68}, riasec:{R:82,I:78,A:18,S:10,E:30,C:60},
    values:{autonomy:65,innovative:70,socialImpact:38,growth:58}, future:42 },

  { id: 'arquitectura_diseno', name: 'Arquitectura y Diseño',
    area: 'Arquitectura',
    description: 'Arquitectura, diseño gráfico, diseño de interiores e industrial. La intersección entre la creatividad visual y la construcción del entorno.',
    mbti:{EI:38,SN:42,TF:50,JP:60}, riasec:{R:60,I:50,A:72,S:18,E:38,C:55},
    values:{autonomy:78,innovative:78,socialImpact:45,growth:55}, future:15 },

  { id: 'artes_humanidades', name: 'Artes, Comunicación y Humanidades',
    area: 'Artes y Humanidades',
    description: 'Bellas artes, historia, filosofía, idiomas, periodismo y comunicación audiovisual. Para mentes creativas y pensadores críticos.',
    mbti:{EI:35,SN:28,TF:28,JP:32}, riasec:{R:25,I:38,A:88,S:42,E:32,C:25},
    values:{autonomy:72,innovative:72,socialImpact:52,growth:55}, future:6 },

  { id: 'ciencias_puras', name: 'Ciencias Puras y Matemáticas',
    area: 'Ciencias Puras y Matemáticas',
    description: 'Matemáticas, física, química, biología y ciencias medioambientales. La base del conocimiento científico y de la investigación del mundo natural.',
    mbti:{EI:28,SN:50,TF:82,JP:55}, riasec:{R:52,I:88,A:22,S:18,E:12,C:72},
    values:{autonomy:62,innovative:70,socialImpact:30,growth:60}, future:32 },

  { id: 'educacion', name: 'Educación y Magisterio',
    area: 'Ciencias Sociales',
    description: 'Magisterio, pedagogía, educación social y formación del profesorado. Transformar vidas a través de la enseñanza y el acompañamiento educativo.',
    mbti:{EI:48,SN:35,TF:30,JP:48}, riasec:{R:15,I:48,A:42,S:88,E:35,C:35},
    values:{autonomy:50,innovative:48,socialImpact:82,growth:48}, future:18 },
];

const MBTI_INFO = {
  INTJ: { label: 'El Arquitecto',    tagline: 'Estratégico, independiente y de alto rendimiento.' },
  INTP: { label: 'El Lógico',        tagline: 'Analítico, curioso y apasionado por las ideas.' },
  ENTJ: { label: 'El Comandante',    tagline: 'Líder nato, decidido y orientado a los objetivos.' },
  ENTP: { label: 'El Innovador',     tagline: 'Creativo, debatidor y amante de los retos intelectuales.' },
  INFJ: { label: 'El Consejero',     tagline: 'Visionario, empático y profundamente comprometido.' },
  INFP: { label: 'El Mediador',      tagline: 'Idealista, creativo y guiado por sus valores.' },
  ENFJ: { label: 'El Protagonista',  tagline: 'Carismático, inspirador y orientado a las personas.' },
  ENFP: { label: 'El Activista',     tagline: 'Entusiasta, imaginativo y lleno de energía.' },
  ISTJ: { label: 'El Inspector',     tagline: 'Fiable, metódico y comprometido con sus deberes.' },
  ISFJ: { label: 'El Defensor',      tagline: 'Protector, detallista y dedicado a los demás.' },
  ESTJ: { label: 'El Ejecutivo',     tagline: 'Organizado, decidido y excelente gestor.' },
  ESFJ: { label: 'El Cónsul',        tagline: 'Sociable, atento y comprometido con la comunidad.' },
  ISTP: { label: 'El Virtuoso',      tagline: 'Práctico, observador y hábil con las manos.' },
  ISFP: { label: 'El Aventurero',    tagline: 'Artístico, espontáneo y en sintonía con el presente.' },
  ESTP: { label: 'El Emprendedor',   tagline: 'Audaz, perceptivo y experto en la acción.' },
  ESFP: { label: 'El Animador',      tagline: 'Espontáneo, entusiasta y con gran sentido de la vida.' },
};

const MAX_ATTEMPTS   = 5;
const LOCKOUT_MINS   = 15;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getToken(req) {
  const auth = req.headers.get('Authorization') || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

function getIP(req) {
  return req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || 'unknown';
}

async function verifyRole(req, env, role) {
  const token = getToken(req);
  if (!token) return null;
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload || payload.role !== role) return null;
  return payload;
}

async function checkRateLimit(env, ip, key) {
  const cutoff = new Date(Date.now() - LOCKOUT_MINS * 60 * 1000).toISOString();
  const { results } = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM login_attempts WHERE (ip = ? OR email = ?) AND attempted_at > ?`
  ).bind(ip, key, cutoff).all();
  return (results[0]?.count ?? 0) >= MAX_ATTEMPTS;
}

async function recordAttempt(env, ip, key) {
  await env.DB.prepare('INSERT INTO login_attempts (id, ip, email) VALUES (?, ?, ?)')
    .bind(generateId(), ip, key).run();
}

async function clearAttempts(env, ip, key) {
  await env.DB.prepare('DELETE FROM login_attempts WHERE ip = ? OR email = ?')
    .bind(ip, key).run();
}

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json', ...cors() },
  });
}

function err(msg, status = 400) { return json({ error: msg }, status); }

// ── Main handler ──────────────────────────────────────────────────────────────

export default {
  async fetch(req, env) {
    const { pathname: path } = new URL(req.url);
    const method = req.method;

    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: cors() });

    try {

      // ── SETUP ───────────────────────────────────────────────────────────────

      if (path === '/api/setup/status' && method === 'GET') {
        const existing = await env.DB.prepare('SELECT id FROM admin LIMIT 1').first();
        return json({ configured: !!existing });
      }

      if (path === '/api/setup' && method === 'POST') {
        const existing = await env.DB.prepare('SELECT id FROM admin LIMIT 1').first();
        if (existing) return err('Setup ya completado', 403);
        const { password } = await req.json();
        if (!password || password.length < 8) return err('Mínimo 8 caracteres');
        const { hash, salt } = await hashPassword(password);
        await env.DB.prepare('INSERT INTO admin (id, password_hash, salt) VALUES (1, ?, ?)')
          .bind(hash, salt).run();
        return json({ ok: true });
      }

      // ── ADMIN AUTH ──────────────────────────────────────────────────────────

      if (path === '/api/admin/login' && method === 'POST') {
        const ip = getIP(req);
        const { password } = await req.json();
        if (!password) return err('Contraseña requerida');
        if (await checkRateLimit(env, ip, 'admin')) return err(`Demasiados intentos. Espera ${LOCKOUT_MINS} min.`, 429);
        const admin = await env.DB.prepare('SELECT password_hash, salt FROM admin LIMIT 1').first();
        if (!admin) return err('Setup no completado', 403);
        const valid = await verifyPassword(password, admin.password_hash, admin.salt);
        if (!valid) { await recordAttempt(env, ip, 'admin'); return err('Credenciales incorrectas', 401); }
        await clearAttempts(env, ip, 'admin');
        const token = await signJWT(
          { role: 'admin', exp: Math.floor(Date.now() / 1000) + 8 * 3600 },
          env.JWT_SECRET
        );
        return json({ ok: true, token });
      }

      // ── PUBLIC STATS ─────────────────────────────────────────────────────────

      if (path === '/api/stats' && method === 'GET') {
        const { results } = await env.DB.prepare(
          `SELECT COUNT(*) as total FROM users WHERE active = 1`
        ).all();
        return json({ students: results[0]?.total ?? 0 });
      }

      // ── LICENSE REQUESTS ────────────────────────────────────────────────────

      if (path === '/api/licenses/request' && method === 'POST') {
        const { centerName, centerType, contactName, email, phone, students, message } = await req.json();
        if (!centerName || !contactName || !email) return err('Faltan campos obligatorios');
        const id = generateId('req_');
        await env.DB.prepare(
          `INSERT INTO centers (id, name, type, contact_name, email, phone, students, message)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(id, centerName, centerType, contactName, email, phone || null, students || null, message || null).run();
        return json({ ok: true });
      }

      // ── ADMIN: REQUESTS ─────────────────────────────────────────────────────

      if (path === '/api/admin/requests' && method === 'GET') {
        if (!await verifyRole(req, env, 'admin')) return err('No autorizado', 401);
        const { results } = await env.DB.prepare(
          `SELECT c.*, l.code as license_code, l.max_users, l.id as license_id, l.revoked
           FROM centers c LEFT JOIN licenses l ON l.center_id = c.id
           ORDER BY c.created_at DESC`
        ).all();
        return json({ requests: results });
      }

      if (path === '/api/admin/requests/approve' && method === 'POST') {
        if (!await verifyRole(req, env, 'admin')) return err('No autorizado', 401);
        const { centerId, maxUsers } = await req.json();
        if (!centerId || !maxUsers) return err('Faltan campos');

        const center = await env.DB.prepare(
          "SELECT * FROM centers WHERE id = ? AND status = 'pending'"
        ).bind(centerId).first();
        if (!center) return err('Solicitud no encontrada', 404);

        const code = generateLicenseCode();
        const licenseId = generateId('lic_');
        const tempPassword = generateSecurePassword();
        const { hash, salt } = await hashPassword(tempPassword);

        await env.DB.batch([
          env.DB.prepare(
            "UPDATE centers SET status = 'approved', password_hash = ?, salt = ?, must_change_password = 1 WHERE id = ?"
          ).bind(hash, salt, centerId),
          env.DB.prepare(
            'INSERT INTO licenses (id, center_id, code, max_users) VALUES (?, ?, ?, ?)'
          ).bind(licenseId, centerId, code, maxUsers),
        ]);

        // Send email — non-blocking, errors logged but don't fail the request
        if (env.RESEND_API_KEY) {
          await sendLicenseApprovedEmail(env.RESEND_API_KEY, {
            to: center.email,
            centerName: center.name,
            licenseCode: code,
            password: tempPassword,
          });
        }

        return json({ ok: true, licenseCode: code, licenseId });
      }

      if (path === '/api/admin/requests/reject' && method === 'POST') {
        if (!await verifyRole(req, env, 'admin')) return err('No autorizado', 401);
        const { centerId } = await req.json();
        await env.DB.prepare("UPDATE centers SET status = 'rejected' WHERE id = ?").bind(centerId).run();
        return json({ ok: true });
      }

      // ── ADMIN: LICENSES ─────────────────────────────────────────────────────

      if (path === '/api/admin/licenses' && method === 'GET') {
        if (!await verifyRole(req, env, 'admin')) return err('No autorizado', 401);
        const { results } = await env.DB.prepare(
          `SELECT l.*, c.name as center_name, c.email as center_email,
           (SELECT COUNT(*) FROM users u WHERE u.license_id = l.id AND u.active = 1) as used_users
           FROM licenses l JOIN centers c ON c.id = l.center_id ORDER BY l.created_at DESC`
        ).all();
        return json({ licenses: results });
      }

      if (path === '/api/admin/licenses/revoke' && method === 'PATCH') {
        if (!await verifyRole(req, env, 'admin')) return err('No autorizado', 401);
        const { licenseId, revoked } = await req.json();
        await env.DB.prepare('UPDATE licenses SET revoked = ? WHERE id = ?')
          .bind(revoked ? 1 : 0, licenseId).run();
        return json({ ok: true });
      }

      if (path === '/api/admin/licenses/delete' && method === 'DELETE') {
        if (!await verifyRole(req, env, 'admin')) return err('No autorizado', 401);
        const { licenseId } = await req.json();
        if (!licenseId) return err('Falta licenseId');

        // Get center_id before deleting
        const license = await env.DB.prepare('SELECT center_id FROM licenses WHERE id = ?')
          .bind(licenseId).first();
        if (!license) return err('Licencia no encontrada', 404);

        // Delete in order: users → sessions → license → center
        await env.DB.batch([
          env.DB.prepare('DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE license_id = ?)').bind(licenseId),
          env.DB.prepare('DELETE FROM users WHERE license_id = ?').bind(licenseId),
          env.DB.prepare('DELETE FROM licenses WHERE id = ?').bind(licenseId),
          env.DB.prepare('DELETE FROM centers WHERE id = ?').bind(license.center_id),
        ]);

        return json({ ok: true });
      }

      if (path === '/api/admin/licenses/max-users' && method === 'PATCH') {
        if (!await verifyRole(req, env, 'admin')) return err('No autorizado', 401);
        const { licenseId, maxUsers } = await req.json();
        if (!licenseId || !maxUsers || maxUsers < 1) return err('Datos inválidos');
        await env.DB.prepare('UPDATE licenses SET max_users = ? WHERE id = ?')
          .bind(maxUsers, licenseId).run();
        return json({ ok: true });
      }

      // ── ADMIN: USERS ────────────────────────────────────────────────────────

      if (path === '/api/admin/users' && method === 'GET') {
        if (!await verifyRole(req, env, 'admin')) return err('No autorizado', 401);
        const { results } = await env.DB.prepare(
          `SELECT u.id, u.name, u.email, u.created_at, u.active,
           l.code as license_code, c.name as center_name
           FROM users u
           JOIN licenses l ON l.id = u.license_id
           JOIN centers c ON c.id = l.center_id
           ORDER BY u.created_at DESC`
        ).all();
        return json({ users: results });
      }

      if (path === '/api/admin/users' && method === 'POST') {
        if (!await verifyRole(req, env, 'admin')) return err('No autorizado', 401);
        const { name, email, licenseId } = await req.json();
        if (!name || !email || !licenseId) return err('Faltan campos');
        const result = await createUserForLicense(env, { name, email, licenseId });
        if (result.error) return err(result.error, result.status || 400);
        return json({ ok: true, ...result });
      }

      // ── CENTER AUTH ─────────────────────────────────────────────────────────

      if (path === '/api/center/login' && method === 'POST') {
        const ip = getIP(req);
        const { email, password } = await req.json();
        if (!email || !password) return err('Faltan campos');

        if (await checkRateLimit(env, ip, email)) {
          return err(`Demasiados intentos. Espera ${LOCKOUT_MINS} min.`, 429);
        }

        const center = await env.DB.prepare(
          `SELECT c.*, l.id as license_id, l.code as license_code, l.revoked
           FROM centers c LEFT JOIN licenses l ON l.center_id = c.id
           WHERE c.email = ? AND c.status = 'approved'`
        ).bind(email).first();

        if (!center || !center.password_hash) {
          await recordAttempt(env, ip, email);
          return err('Credenciales incorrectas', 401);
        }

        if (center.revoked === 1) return err('Tu licencia ha sido revocada. Contacta con MindPath.', 403);

        const valid = await verifyPassword(password, center.password_hash, center.salt);
        if (!valid) {
          await recordAttempt(env, ip, email);
          return err('Credenciales incorrectas', 401);
        }

        await clearAttempts(env, ip, email);
        const mustChange = center.must_change_password === 1;
        const token = await signJWT(
          {
            role: 'center',
            centerId: center.id,
            licenseId: center.license_id,
            centerName: center.name,
            email: center.email,
            mustChangePassword: mustChange,
            exp: Math.floor(Date.now() / 1000) + 8 * 3600,
          },
          env.JWT_SECRET
        );
        return json({
          ok: true, token,
          centerName: center.name,
          licenseCode: center.license_code,
          mustChangePassword: mustChange,
        });
      }

      if (path === '/api/center/change-password' && method === 'POST') {
        const ip = getIP(req);
        const { email, currentPassword, newPassword } = await req.json();
        if (!email || !currentPassword || !newPassword) return err('Faltan campos');
        if (newPassword.length < 8) return err('La contraseña debe tener al menos 8 caracteres');

        if (await checkRateLimit(env, ip, email)) {
          return err(`Demasiados intentos. Espera ${LOCKOUT_MINS} min.`, 429);
        }

        const center = await env.DB.prepare(
          "SELECT * FROM centers WHERE email = ? AND status = 'approved'"
        ).bind(email).first();

        if (!center || !center.password_hash) {
          await recordAttempt(env, ip, email);
          return err('Credenciales incorrectas', 401);
        }

        const valid = await verifyPassword(currentPassword, center.password_hash, center.salt);
        if (!valid) {
          await recordAttempt(env, ip, email);
          return err('La contraseña actual es incorrecta', 401);
        }

        const { hash, salt } = await hashPassword(newPassword);
        await env.DB.prepare(
          'UPDATE centers SET password_hash = ?, salt = ?, must_change_password = 0 WHERE id = ?'
        ).bind(hash, salt, center.id).run();

        await clearAttempts(env, ip, email);

        // Issue new token without mustChangePassword
        const license = await env.DB.prepare('SELECT id, code FROM licenses WHERE center_id = ?')
          .bind(center.id).first();
        const token = await signJWT(
          {
            role: 'center', centerId: center.id, licenseId: license?.id,
            centerName: center.name, email: center.email, mustChangePassword: false,
            exp: Math.floor(Date.now() / 1000) + 8 * 3600,
          },
          env.JWT_SECRET
        );
        return json({ ok: true, token, centerName: center.name });
      }

      // ── CENTER: INFO ────────────────────────────────────────────────────────

      if (path === '/api/center/info' && method === 'GET') {
        const center = await verifyRole(req, env, 'center');
        if (!center) return err('No autorizado', 401);
        const license = await env.DB.prepare(
          `SELECT l.*, c.name as center_name, c.email as center_email,
           (SELECT COUNT(*) FROM users u WHERE u.license_id = l.id AND u.active = 1) as used_users
           FROM licenses l JOIN centers c ON c.id = l.center_id WHERE l.id = ?`
        ).bind(center.licenseId).first();
        if (!license) return err('Licencia no encontrada', 404);
        return json({ license });
      }

      // ── CENTER: USERS ───────────────────────────────────────────────────────

      if (path === '/api/center/users' && method === 'GET') {
        const center = await verifyRole(req, env, 'center');
        if (!center) return err('No autorizado', 401);
        const { results } = await env.DB.prepare(
          'SELECT id, name, email, created_at, active FROM users WHERE license_id = ? ORDER BY created_at DESC'
        ).bind(center.licenseId).all();
        return json({ users: results });
      }

      if (path === '/api/center/users' && method === 'POST') {
        const center = await verifyRole(req, env, 'center');
        if (!center) return err('No autorizado', 401);
        const { name, email } = await req.json();
        if (!name || !email) return err('Faltan campos');
        const result = await createUserForLicense(env, { name, email, licenseId: center.licenseId });
        if (result.error) return err(result.error, result.status || 400);
        return json({ ok: true, ...result });
      }

      if (path === '/api/center/users/deactivate' && method === 'POST') {
        const center = await verifyRole(req, env, 'center');
        if (!center) return err('No autorizado', 401);
        const { userId } = await req.json();
        const user = await env.DB.prepare('SELECT id FROM users WHERE id = ? AND license_id = ?')
          .bind(userId, center.licenseId).first();
        if (!user) return err('Usuario no encontrado', 404);
        await env.DB.prepare('UPDATE users SET active = 0 WHERE id = ?').bind(userId).run();
        return json({ ok: true });
      }

      if (path === '/api/center/users/reactivate' && method === 'POST') {
        const center = await verifyRole(req, env, 'center');
        if (!center) return err('No autorizado', 401);
        const { userId } = await req.json();
        const license = await env.DB.prepare('SELECT max_users FROM licenses WHERE id = ?')
          .bind(center.licenseId).first();
        const { results: active } = await env.DB.prepare(
          'SELECT id FROM users WHERE license_id = ? AND active = 1'
        ).bind(center.licenseId).all();
        if (active.length >= license.max_users) return err('Licencia sin plazas disponibles');
        const user = await env.DB.prepare('SELECT id FROM users WHERE id = ? AND license_id = ?')
          .bind(userId, center.licenseId).first();
        if (!user) return err('Usuario no encontrado', 404);
        await env.DB.prepare('UPDATE users SET active = 1 WHERE id = ?').bind(userId).run();
        return json({ ok: true });
      }

      // ── USER AUTH ───────────────────────────────────────────────────────────

      if (path === '/api/auth/register' && method === 'POST') {
        const ip = getIP(req);
        const { name, email, password, licenseCode } = await req.json();
        if (!name || !email || !password || !licenseCode) return err('Faltan campos');
        if (password.length < 8) return err('La contraseña debe tener al menos 8 caracteres');

        if (await checkRateLimit(env, ip, email)) return err(`Demasiados intentos. Espera ${LOCKOUT_MINS} min.`, 429);

        const license = await env.DB.prepare(
          'SELECT * FROM licenses WHERE code = ? AND revoked = 0'
        ).bind(licenseCode.toUpperCase()).first();
        if (!license) { await recordAttempt(env, ip, email); return err('Código de licencia no válido', 400); }

        const { results: activeUsers } = await env.DB.prepare(
          'SELECT id FROM users WHERE license_id = ? AND active = 1'
        ).bind(license.id).all();
        if (activeUsers.length >= license.max_users) return err('Esta licencia no tiene plazas disponibles', 400);

        const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
        if (existing) return err('El email ya está registrado', 400);

        const { hash, salt } = await hashPassword(password);
        const userId = generateId('usr_');
        await env.DB.prepare(
          'INSERT INTO users (id, license_id, name, email, password_hash, salt, active) VALUES (?, ?, ?, ?, ?, ?, 1)'
        ).bind(userId, license.id, name, email, hash, salt).run();

        await clearAttempts(env, ip, email);
        const token = await signJWT(
          { role: 'user', userId, name, email, exp: Math.floor(Date.now() / 1000) + 24 * 3600 },
          env.JWT_SECRET
        );
        return json({ ok: true, token, name, email });
      }

      if (path === '/api/auth/login' && method === 'POST') {
        const ip = getIP(req);
        const { email, password } = await req.json();
        if (!email || !password) return err('Faltan campos');

        if (await checkRateLimit(env, ip, email)) return err(`Demasiados intentos. Espera ${LOCKOUT_MINS} min.`, 429);

        const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? AND active = 1').bind(email).first();
        if (!user) { await recordAttempt(env, ip, email); return err('Credenciales incorrectas', 401); }

        const license = await env.DB.prepare('SELECT revoked FROM licenses WHERE id = ?').bind(user.license_id).first();
        if (license?.revoked) return err('Tu licencia ha sido revocada. Contacta con tu centro.', 403);

        const valid = await verifyPassword(password, user.password_hash, user.salt);
        if (!valid) { await recordAttempt(env, ip, email); return err('Credenciales incorrectas', 401); }

        await clearAttempts(env, ip, email);
        const mustChange = user.must_change_password === 1;
        const token = await signJWT(
          { role: 'user', userId: user.id, name: user.name, email: user.email,
            mustChangePassword: mustChange, exp: Math.floor(Date.now() / 1000) + 24 * 3600 },
          env.JWT_SECRET
        );
        return json({ ok: true, token, name: user.name, email: user.email, mustChangePassword: mustChange });
      }

      if (path === '/api/auth/change-password' && method === 'POST') {
        const ip = getIP(req);
        const { email, currentPassword, newPassword } = await req.json();
        if (!email || !currentPassword || !newPassword) return err('Faltan campos');
        if (newPassword.length < 8) return err('Mínimo 8 caracteres');
        if (currentPassword === newPassword) return err('La nueva contraseña debe ser distinta');

        if (await checkRateLimit(env, ip, email)) return err(`Demasiados intentos. Espera ${LOCKOUT_MINS} min.`, 429);

        const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? AND active = 1').bind(email).first();
        if (!user) { await recordAttempt(env, ip, email); return err('Credenciales incorrectas', 401); }

        const valid = await verifyPassword(currentPassword, user.password_hash, user.salt);
        if (!valid) { await recordAttempt(env, ip, email); return err('La contraseña actual es incorrecta', 401); }

        const { hash, salt } = await hashPassword(newPassword);
        await env.DB.prepare('UPDATE users SET password_hash = ?, salt = ?, must_change_password = 0 WHERE id = ?')
          .bind(hash, salt, user.id).run();

        await clearAttempts(env, ip, email);
        const token = await signJWT(
          { role: 'user', userId: user.id, name: user.name, email: user.email,
            mustChangePassword: false, exp: Math.floor(Date.now() / 1000) + 24 * 3600 },
          env.JWT_SECRET
        );
        return json({ ok: true, token, name: user.name, email: user.email });
      }

      if (path === '/api/auth/me' && method === 'GET') {
        const payload = await verifyRole(req, env, 'user');
        if (!payload) return err('No autenticado', 401);
        return json({ name: payload.name, email: payload.email });
      }

      // ── TEST: MBTI + RIASEC + Skills + Values ────────────────────────────────

      if (path === '/api/test/mbti' && method === 'POST') {
        const payload = await verifyRole(req, env, 'user');
        if (!payload) return err('No autorizado', 401);

        const body = await req.json();
        const { answers, riasecScores, skillsScores, valuesProfile } = body;
        if (!Array.isArray(answers) || answers.length < 10) return err('Faltan respuestas');
        if (!env.GROQ_API_KEY) return err('Servicio de IA no configurado', 503);

        const qa = answers.map((a, i) =>
          `Pregunta ${i + 1}: ${a.question}\nRespuesta del alumno: ${a.answer}`
        ).join('\n\n');

        const hasPrecomputedRiasec = riasecScores &&
          ['R','I','A','S','E','C'].every(k => typeof riasecScores[k] === 'number');

        const hasValues = valuesProfile &&
          ['autonomy','innovative','socialImpact','growth'].every(k => typeof valuesProfile[k] === 'number');

        const structuredContext = hasPrecomputedRiasec
          ? `\nPerfil RIASEC del cuestionario estructurado: R=${riasecScores.R} I=${riasecScores.I} A=${riasecScores.A} S=${riasecScores.S} E=${riasecScores.E} C=${riasecScores.C}`
          : '';
        const skillsContext = skillsScores
          ? `\nHabilidades auto-evaluadas (0-100): lógica=${skillsScores.logic} verbal=${skillsScores.verbal} creatividad=${skillsScores.creative} digital=${skillsScores.digital} social=${skillsScores.social} planificación=${skillsScores.planning}`
          : '';

        const prompt = `Eres un experto en psicología vocacional. Analiza las siguientes respuestas de un estudiante para determinar su perfil MBTI y sus intereses vocacionales RIASEC.
${structuredContext}${skillsContext}

Respuestas del estudiante:
${qa}

INSTRUCCIONES DE PUNTUACIÓN:
Para MBTI usa la escala 0-100 con estos anclajes exactos:
• 0-15 = polo izquierdo muy marcado | 16-35 = polo izquierdo moderado | 36-64 = zona neutra, sin señal clara | 65-84 = polo derecho moderado | 85-100 = polo derecho muy marcado
EI: 0=introvertido puro → 100=extrovertido puro
SN: 0=intuitivo/abstracto puro → 100=sensorial/concreto puro
TF: 0=emocional/empático puro → 100=lógico/analítico puro
JP: 0=espontáneo/flexible puro → 100=planificador/estructurado puro

Para cada tipo RIASEC devuelve "score" (0-100) y "confidence" (0.0-1.0):
• confidence 0.0 = el alumno no menciona nada relacionado con este tipo en sus respuestas abiertas
• confidence 0.3 = mención vaga o indirecta
• confidence 0.6 = referencia clara pero puntual
• confidence 1.0 = menciones explícitas, repetidas y coherentes
IMPORTANTE: Si el alumno no proporciona evidencia de un tipo RIASEC en el texto, pon confidence=0.0. El cuestionario estructurado ya mide ese tipo; aquí solo puntúas lo que aparece explícitamente en las respuestas abiertas.

Devuelve ÚNICAMENTE un objeto JSON válido (sin texto adicional, sin bloques markdown):
{
  "MBTI": {
    "EI": <entero 0-100>,
    "SN": <entero 0-100>,
    "TF": <entero 0-100>,
    "JP": <entero 0-100>
  },
  "RIASEC": {
    "R": { "score": <entero 0-100>, "confidence": <decimal 0.0-1.0> },
    "I": { "score": <entero 0-100>, "confidence": <decimal 0.0-1.0> },
    "A": { "score": <entero 0-100>, "confidence": <decimal 0.0-1.0> },
    "S": { "score": <entero 0-100>, "confidence": <decimal 0.0-1.0> },
    "E": { "score": <entero 0-100>, "confidence": <decimal 0.0-1.0> },
    "C": { "score": <entero 0-100>, "confidence": <decimal 0.0-1.0> }
  },
  "analysis": "<2-3 frases en español describiendo el perfil vocacional del alumno>",
  "reasoning": {
    "EI": "<cita frases EXACTAS del alumno que determinaron este valor y explica por qué apuntan a introversión o extraversión>",
    "SN": "<ídem para intuitivo vs sensorial>",
    "TF": "<ídem para emocional vs racional>",
    "JP": "<ídem para espontáneo vs planificador>",
    "R": "<frases exactas que justifican el score y confidence asignados al tipo Realista>",
    "I": "<ídem para Investigador>",
    "A": "<ídem para Artístico>",
    "S": "<ídem para Social>",
    "E": "<ídem para Emprendedor>",
    "C": "<ídem para Convencional>"
  }
}`;

        // ── AI call helper with timeout ───────────────────────────────────────
        const groqCall = async (p, tokens = 1200) => {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 25000); // 25s timeout
          try {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              signal: controller.signal,
              headers: {
                'Authorization': `Bearer ${env.GROQ_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: p }],
                temperature: 0.1,
                max_tokens: tokens,
              }),
            });
            if (!res.ok) {
              const errBody = await res.text();
              throw new Error(`Groq ${res.status}: ${errBody}`);
            }
            const data = await res.json();
            const raw = data.choices?.[0]?.message?.content || '';
            // Extract the outermost JSON object robustly
            const start = raw.indexOf('{');
            const end   = raw.lastIndexOf('}');
            if (start === -1 || end === -1) throw new Error(`No JSON object in: ${raw.slice(0, 200)}`);
            const parsed = JSON.parse(raw.slice(start, end + 1));
            return { parsed, raw };
          } finally {
            clearTimeout(timer);
          }
        };

        // Primary: two sequential calls (avoids Groq rate-limit on simultaneous requests)
        // then average the scores for objectivity
        let valid1 = null, valid2 = null;
        try { valid1 = await groqCall(prompt); } catch (e) { console.error('Call 1 failed:', e.message); }
        try { valid2 = await groqCall(prompt); } catch (e) { console.error('Call 2 failed:', e.message); }

        // Fallback: if both failed, retry with a minimal plain-number prompt
        if (!valid1 && !valid2) {
          console.error('Both AI calls failed. Trying minimal fallback prompt.');
          const fallbackPrompt = `Eres un orientador vocacional. Analiza estas respuestas y devuelve ÚNICAMENTE el JSON, sin ningún texto adicional ni markdown.

${qa}

JSON exacto a devolver:
{"MBTI":{"EI":50,"SN":50,"TF":50,"JP":50},"RIASEC":{"R":50,"I":50,"A":50,"S":50,"E":50,"C":50},"analysis":"Perfil en proceso de análisis.","reasoning":{"EI":"","SN":"","TF":"","JP":"","R":"","I":"","A":"","S":"","E":"","C":""}}

Sustituye los valores 50 por los valores reales según las respuestas. Solo JSON, sin texto extra.`;
          try {
            valid1 = await groqCall(fallbackPrompt, 600);
          } catch (retryErr) {
            console.error('Fallback also failed:', retryErr.message);
            return err('Error al procesar las respuestas con IA. Inténtalo de nuevo.', 502);
          }
        }

        const d1 = valid1?.parsed;
        const d2 = valid2?.parsed;
        const dims = d1 || d2; // fallback to whichever succeeded

        const clamp  = (v, def = 50) => Math.min(100, Math.max(0, Math.round(Number(v) || def)));
        const clampC = (v) => Math.min(1, Math.max(0, Number(v) || 0));

        // Average two values if both calls succeeded; otherwise use the valid one
        const avgInt = (a, b, def = 50) =>
          (d1 && d2) ? Math.round((clamp(a, def) + clamp(b, def)) / 2)
                     : d1 ? clamp(a, def) : clamp(b, def);
        const avgFloat = (a, b) =>
          (d1 && d2) ? Math.round(((clampC(a) + clampC(b)) / 2) * 100) / 100
                     : d1 ? clampC(a) : clampC(b);

        // Average MBTI (accepts flat or nested format from the model)
        const EI = avgInt(d1?.MBTI?.EI ?? d1?.EI, d2?.MBTI?.EI ?? d2?.EI);
        const SN = avgInt(d1?.MBTI?.SN ?? d1?.SN, d2?.MBTI?.SN ?? d2?.SN);
        const TF = avgInt(d1?.MBTI?.TF ?? d1?.TF, d2?.MBTI?.TF ?? d2?.TF);
        const JP = avgInt(d1?.MBTI?.JP ?? d1?.JP, d2?.MBTI?.JP ?? d2?.JP);

        // Average RIASEC scores + confidence across both calls
        const riasecAI = {};
        for (const k of ['R','I','A','S','E','C']) {
          const r1 = d1?.RIASEC?.[k], r2 = d2?.RIASEC?.[k];
          riasecAI[k] = {
            score:      avgInt(r1?.score   ?? r1, r2?.score   ?? r2),
            confidence: avgFloat(r1?.confidence, r2?.confidence),
          };
        }

        // ── Confidence-weighted RIASEC blend ─────────────────────────────────
        // weight_ai = 0.35 × confidence
        // confidence=0 → 100% structured score (silence is not penalized)
        // confidence=1 → 65% structured + 35% AI (full blend)
        const blendConfidence = (structured, aiScore, conf) => {
          const w = 0.35 * Math.min(1, Math.max(0, conf));
          return Math.round((1 - w) * clamp(structured) + w * clamp(aiScore));
        };

        const RR = hasPrecomputedRiasec ? blendConfidence(riasecScores.R, riasecAI.R.score, riasecAI.R.confidence) : clamp(riasecAI.R.score);
        const RI = hasPrecomputedRiasec ? blendConfidence(riasecScores.I, riasecAI.I.score, riasecAI.I.confidence) : clamp(riasecAI.I.score);
        const RA = hasPrecomputedRiasec ? blendConfidence(riasecScores.A, riasecAI.A.score, riasecAI.A.confidence) : clamp(riasecAI.A.score);
        const RS = hasPrecomputedRiasec ? blendConfidence(riasecScores.S, riasecAI.S.score, riasecAI.S.confidence) : clamp(riasecAI.S.score);
        const RE = hasPrecomputedRiasec ? blendConfidence(riasecScores.E, riasecAI.E.score, riasecAI.E.confidence) : clamp(riasecAI.E.score);
        const RC = hasPrecomputedRiasec ? blendConfidence(riasecScores.C, riasecAI.C.score, riasecAI.C.confidence) : clamp(riasecAI.C.score);

        const mbtiType =
          (EI >= 50 ? 'E' : 'I') +
          (SN >= 50 ? 'S' : 'N') +
          (TF >= 50 ? 'T' : 'F') +
          (JP >= 50 ? 'J' : 'P');

        const riasecCode = Object.entries({ R: RR, I: RI, A: RA, S: RS, E: RE, C: RC })
          .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k).join('');

        const student = { EI, SN, TF, JP, R: RR, I: RI, A: RA, S: RS, E: RE, C: RC };
        const d = (a, b) => Math.pow(1 - Math.abs(a - b) / 100, 2);
        const r2 = (v) => Math.round(v * 100) / 100;

        const scoredCareers = CAREERS.map(c => {
          const dEI = d(student.EI, c.mbti.EI), dSN = d(student.SN, c.mbti.SN);
          const dTF = d(student.TF, c.mbti.TF), dJP = d(student.JP, c.mbti.JP);
          const mbtiC = Math.pow(dEI * dSN * dTF * dJP, 1 / 4);

          const dR = d(student.R, c.riasec.R), dI = d(student.I, c.riasec.I);
          const dA = d(student.A, c.riasec.A), dS = d(student.S, c.riasec.S);
          const dE = d(student.E, c.riasec.E), dC = d(student.C, c.riasec.C);
          const riasecC = Math.pow(dR * dI * dA * dS * dE * dC, 1 / 6);

          let compat, valC = null;
          if (hasValues) {
            valC = valuesCompat(c, valuesProfile);
            compat = Math.pow(riasecC, 0.50) * Math.pow(mbtiC, 0.30) * Math.pow(valC, 0.20);
          } else {
            compat = Math.pow(riasecC, 0.60) * Math.pow(mbtiC, 0.40);
          }

          const compatScore = Math.min(99, Math.round(Math.pow(compat, 1.5) * 160));

          const futureNorm = normalizeWEF(c.future ?? 0);
          const blendedRaw = 0.7 * compat + 0.3 * (futureNorm / 100);
          const scoreFuture = Math.min(99, Math.round(Math.pow(blendedRaw, 1.5) * 160));

          const _debug = {
            mbtiC: r2(mbtiC), riasecC: r2(riasecC), valC: valC !== null ? r2(valC) : null,
            rawCompat: r2(compat),
            mbtiD: { EI: r2(dEI), SN: r2(dSN), TF: r2(dTF), JP: r2(dJP) },
            riasecD: { R: r2(dR), I: r2(dI), A: r2(dA), S: r2(dS), E: r2(dE), C: r2(dC) },
            careerIdeal: { mbti: c.mbti, riasec: c.riasec },
          };

          return { id: c.id, name: c.name, area: c.area, description: c.description,
                   score: compatScore, compatScore, futureScore: Math.round(futureNorm),
                   scoreFuture, _debug };
        }).sort((a, b) => b.score - a.score).slice(0, 10);

        const resultId = generateId('res_');
        const analysis = typeof dims.analysis === 'string' ? dims.analysis.slice(0, 500) : '';

        // NEO columns kept for DB compatibility; set to neutral (50)
        await env.DB.prepare(
          `INSERT INTO test_results
           (id, user_id, mbti_type, ei_score, sn_score, tf_score, jp_score,
            riasec_r, riasec_i, riasec_a, riasec_s, riasec_e, riasec_c, riasec_code,
            neo_o, neo_c, neo_e, neo_a, neo_n,
            analysis, careers_json, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
        ).bind(
          resultId, payload.userId, mbtiType, EI, SN, TF, JP,
          RR, RI, RA, RS, RE, RC, riasecCode,
          50, 50, 50, 50, 50,
          analysis, JSON.stringify(scoredCareers)
        ).run();

        const mbtiInfo = MBTI_INFO[mbtiType] || { label: mbtiType, tagline: '' };
        return json({
          ok: true, resultId, mbtiType,
          mbtiLabel: mbtiInfo.label, mbtiTagline: mbtiInfo.tagline,
          dimensions: { EI, SN, TF, JP },
          riasec: { R: RR, I: RI, A: RA, S: RS, E: RE, C: RC, code: riasecCode },
          analysis,
          careers: scoredCareers,
          _debug: {
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            max_tokens: 1400,
            callsSucceeded: (valid1 ? 1 : 0) + (valid2 ? 1 : 0),
            promptSent: prompt,
            rawAiResponse: valid1?.raw || valid2?.raw || null,
            call1: { raw: valid1?.raw || null, succeeded: !!valid1 },
            call2: { raw: valid2?.raw || null, succeeded: !!valid2 },
            averagedScores: { mbti: { EI, SN, TF, JP }, riasec: riasecAI },
            aiReasoning: dims.reasoning || null,
            aiRawScores: {
              mbti: { EI: dims.MBTI?.EI ?? dims.EI, SN: dims.MBTI?.SN ?? dims.SN,
                      TF: dims.MBTI?.TF ?? dims.TF, JP: dims.MBTI?.JP ?? dims.JP },
              riasec: Object.fromEntries(['R','I','A','S','E','C'].map(k => [k, riasecAI[k].score])),
            },
            riasecPipeline: hasPrecomputedRiasec ? {
              structured: riasecScores,
              ai: Object.fromEntries(['R','I','A','S','E','C'].map(k => [k, riasecAI[k].score])),
              aiConfidence: Object.fromEntries(['R','I','A','S','E','C'].map(k => [k, riasecAI[k].confidence])),
              effectiveWeights: Object.fromEntries(['R','I','A','S','E','C'].map(k => [k, {
                structured: Math.round((1 - 0.35 * riasecAI[k].confidence) * 100) / 100,
                ai: Math.round(0.35 * riasecAI[k].confidence * 100) / 100,
              }])),
              blended: { R: RR, I: RI, A: RA, S: RS, E: RE, C: RC },
            } : null,
            skillsScores: skillsScores || null,
            valuesProfile: valuesProfile || null,
            careerScoring: {
              formula: hasValues
                ? 'compat = riasecC^0.50 × mbtiC^0.30 × valC^0.20'
                : 'compat = riasecC^0.60 × mbtiC^0.40',
              displayFormula: 'displayScore = min(99, round(compat^1.5 × 160))',
              distanceFormula: 'd(a,b) = (1 - |a-b|/100)^2',
              top10: scoredCareers.map(c => ({
                name: c.name, area: c.area, displayScore: c.score,
                ...c._debug,
              })),
            },
          },
        });
      }

      if (path === '/api/test/results' && method === 'GET') {
        const payload = await verifyRole(req, env, 'user');
        if (!payload) return err('No autorizado', 401);
        const { results } = await env.DB.prepare(
          `SELECT id, mbti_type, ei_score, sn_score, tf_score, jp_score,
           riasec_r, riasec_i, riasec_a, riasec_s, riasec_e, riasec_c, riasec_code,
           neo_o, neo_c, neo_e, neo_a, neo_n,
           analysis, careers_json, created_at
           FROM test_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`
        ).bind(payload.userId).all();
        return json({
          results: results.map(r => ({ ...r, careers: JSON.parse(r.careers_json || '[]') })),
        });
      }

      // ── DEGREES: 3-level lazy loading ────────────────────────────────────────────

      if (path === '/api/degrees/categories' && method === 'GET') {
        const sp = new URL(req.url).searchParams;
        const s = extractStudentProfile(sp);

        const { results: degreeTypes } = await env.DB.prepare(
          `SELECT category_id,
           mbti_ei, mbti_sn, mbti_tf, mbti_jp,
           riasec_r, riasec_i, riasec_a, riasec_s, riasec_e, riasec_c,
           neo_o, neo_c, neo_e, neo_a, neo_n, future_score
           FROM degree_types`
        ).all();

        const catBest = {};
        for (const dt of degreeTypes) {
          const sc = rawCompat(s, dt);
          if (catBest[dt.category_id] === undefined || sc > catBest[dt.category_id]) {
            catBest[dt.category_id] = sc;
          }
        }

        const { results: categories } = await env.DB.prepare(
          'SELECT id, name, icon, display_order FROM degree_categories ORDER BY display_order'
        ).all();

        const withRaw = categories.map(c => ({ ...c, _raw: catBest[c.id] ?? 0 }));
        const sorted = withRaw.sort((a, b) => b._raw - a._raw);
        // Use absolute score — rawCompat is already 0-1, multiply by 100
        return json({
          categories: sorted.map(c => {
            const { _raw, ...rest } = c;
            return { ...rest, score: Math.min(99, Math.round(Math.pow(_raw, 1.5) * 160)) };
          }),
        });
      }

      if (path.startsWith('/api/degrees/category/') && method === 'GET') {
        const categoryId = path.split('/')[4];
        if (!categoryId) return err('ID de categoría requerido', 400);
        const sp = new URL(req.url).searchParams;
        const s = extractStudentProfile(sp);

        const { results: degreeTypes } = await env.DB.prepare(
          `SELECT id, name, campo, university_count, future_score,
           mbti_ei, mbti_sn, mbti_tf, mbti_jp,
           riasec_r, riasec_i, riasec_a, riasec_s, riasec_e, riasec_c,
           neo_o, neo_c, neo_e, neo_a, neo_n
           FROM degree_types WHERE category_id = ?`
        ).bind(categoryId).all();

        const raw = degreeTypes.map(dt => ({
          id: dt.id, name: dt.name, campo: dt.campo,
          universityCount: dt.university_count,
          futureScore: dt.future_score ?? 50,
          _compat: rawCompat(s, dt),
        }));

        raw.sort((a, b) => b._compat - a._compat);
        const scored = raw.map(d => {
          const { _compat, ...rest } = d;
          const compatScore = Math.min(99, Math.round(Math.pow(_compat, 1.5) * 160));
          return { ...rest, compatScore, score: compatScore };
        });

        return json({ degrees: scored });
      }

      if (path.startsWith('/api/degrees/type/') && method === 'GET') {
        const typeId = path.split('/')[4];
        if (!typeId) return err('ID de grado requerido', 400);

        const degreeType = await env.DB.prepare(
          'SELECT id, name, campo, future_score FROM degree_types WHERE id = ?'
        ).bind(typeId).first();
        if (!degreeType) return err('Grado no encontrado', 404);

        const { results: universities } = await env.DB.prepare(
          'SELECT id, university, ministry_code FROM degrees WHERE degree_type_id = ? ORDER BY university'
        ).bind(typeId).all();

        return json({ ...degreeType, universities });
      }

      return err('Ruta no encontrada', 404);

    } catch (e) {
      console.error(e?.message || e);
      return err('Error interno del servidor', 500);
    }
  },
};

// ── WEF future-score normalization ───────────────────────────────────────────
// Piecewise linear map of WEF net-employment-change score to 0-100:
//   < 0      →  0–20  (decline)
//   0–5      → 20–40  (stable)
//   5–15     → 40–60  (moderate growth)
//   15–30    → 60–80  (high growth)
//   > 30     → 80–100 (very high growth)

function normalizeWEF(wef) {
  if (wef < 0)  return Math.max(0, 20 + wef * (20 / 30));
  if (wef < 5)  return 20 + (wef / 5) * 20;
  if (wef < 15) return 40 + ((wef - 5) / 10) * 20;
  if (wef < 30) return 60 + ((wef - 15) / 15) * 20;
  return Math.min(100, 80 + ((wef - 30) / 30) * 20);
}

// ── Values compatibility for career scoring ───────────────────────────────────
// Each career now carries its own values profile derived from O*NET Work Values.
// Formula: Independence→autonomy, avg(Independence,Achievement)→innovative,
// Relationships→socialImpact, clamp(Achievement-Recognition+50)→growth.

function valuesCompat(career, values) {
  const ideal = career.values || { autonomy: 55, innovative: 60, socialImpact: 50, growth: 50 };
  const sq = (a, b) => Math.pow(1 - Math.abs(a - b) / 100, 2);
  return Math.pow(
    sq(values.autonomy, ideal.autonomy) * sq(values.innovative, ideal.innovative) *
    sq(values.socialImpact, ideal.socialImpact) * sq(values.growth, ideal.growth),
    1 / 4
  );
}

// ── Degree scoring helpers ────────────────────────────────────────────────────

function extractStudentProfile(sp) {
  const p = (k, d = 50) => Math.min(100, Math.max(0, parseInt(sp.get(k) ?? d, 10) || d));
  return {
    EI: p('ei'), SN: p('sn'), TF: p('tf'), JP: p('jp'),
    R:  p('r'),  I:  p('i'),  A:  p('a'),  S:  p('s'),  E: p('e'), C: p('c'),
    O:  p('o'),  NC: p('nc'), NE: p('ne'), NA: p('na'), NN: p('nn'),
  };
}

// rawCompat: geometric mean within each model group, then weighted geometric between groups.
// Geometric mean is scientifically correct for vocational matching: a strong mismatch on
// any single dimension (e.g. student E=100, career E=10) cannot be compensated by other
// dimensions. This creates natural spread (40-90%) instead of the arithmetic compression (79-87%).
function rawCompat(s, dt) {
  const sq = (a, b) => Math.pow(1 - Math.abs(a - b) / 100, 2);
  // Geometric mean within each model (n-th root of product)
  const mbtiC = Math.pow(
    sq(s.EI, dt.mbti_ei) * sq(s.SN, dt.mbti_sn) *
    sq(s.TF, dt.mbti_tf) * sq(s.JP, dt.mbti_jp),
    1 / 4
  );
  const riasecC = Math.pow(
    sq(s.R,  dt.riasec_r) * sq(s.I,  dt.riasec_i) * sq(s.A,  dt.riasec_a) *
    sq(s.S,  dt.riasec_s) * sq(s.E,  dt.riasec_e) * sq(s.C,  dt.riasec_c),
    1 / 6
  );
  const neoC = Math.pow(
    sq(s.O,  dt.neo_o) * sq(s.NC, dt.neo_c) * sq(s.NE, dt.neo_e) *
    sq(s.NA, dt.neo_a) * sq(s.NN, dt.neo_n),
    1 / 5
  );
  // Weighted geometric mean between the three models
  return Math.pow(riasecC, 0.35) * Math.pow(mbtiC, 0.35) * Math.pow(neoC, 0.30);
}

// ── Shared helper ─────────────────────────────────────────────────────────────

async function createUserForLicense(env, { name, email, licenseId }) {
  const license = await env.DB.prepare('SELECT * FROM licenses WHERE id = ? AND revoked = 0').bind(licenseId).first();
  if (!license) return { error: 'Licencia no encontrada o revocada', status: 404 };

  const { results: activeUsers } = await env.DB.prepare(
    'SELECT id FROM users WHERE license_id = ? AND active = 1'
  ).bind(licenseId).all();
  if (activeUsers.length >= license.max_users) return { error: 'Licencia sin plazas disponibles' };

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) return { error: 'Ya existe un usuario con ese email' };

  const password = generateSecurePassword();
  const { hash, salt } = await hashPassword(password);
  const userId = generateId('usr_');

  await env.DB.prepare(
    'INSERT INTO users (id, license_id, name, email, password_hash, salt, active, must_change_password) VALUES (?, ?, ?, ?, ?, ?, 1, 1)'
  ).bind(userId, licenseId, name, email, hash, salt).run();

  return { userId, email, password };
}
