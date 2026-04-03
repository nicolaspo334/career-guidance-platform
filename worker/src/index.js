import {
  hashPassword,
  verifyPassword,
  signJWT,
  verifyJWT,
  generateId,
  generateLicenseCode,
  generateSecurePassword,
} from './crypto.js';

// JWT viene en Authorization: Bearer <token> — funciona cross-origin sin problemas de cookies
function getToken(req) {
  const auth = req.headers.get('Authorization') || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

async function requireAdmin(req, env) {
  const token = getToken(req);
  if (!token) return null;
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

async function requireUser(req, env) {
  const token = getToken(req);
  if (!token) return null;
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload || payload.role !== 'user') return null;
  return payload;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function err(msg, status = 400) {
  return json({ error: msg }, status);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // ── SETUP (solo funciona una vez) ──
    if (path === '/api/setup' && method === 'POST') {
      const existing = await env.DB.prepare('SELECT id FROM admin LIMIT 1').first();
      if (existing) return err('Setup ya completado', 403);

      const { password } = await req.json();
      if (!password || password.length < 8) return err('Contraseña mínimo 8 caracteres');

      const { hash, salt } = await hashPassword(password);
      await env.DB.prepare('INSERT INTO admin (id, password_hash, salt) VALUES (1, ?, ?)')
        .bind(hash, salt)
        .run();

      return json({ ok: true, message: 'Admin creado correctamente' });
    }

    // ── CHECK SETUP ──
    if (path === '/api/setup/status' && method === 'GET') {
      const existing = await env.DB.prepare('SELECT id FROM admin LIMIT 1').first();
      return json({ configured: !!existing });
    }

    // ── ADMIN LOGIN ──
    if (path === '/api/admin/login' && method === 'POST') {
      const { password } = await req.json();
      if (!password) return err('Contraseña requerida');

      const admin = await env.DB.prepare(
        'SELECT password_hash, salt FROM admin LIMIT 1'
      ).first();
      if (!admin) return err('Setup no completado', 403);

      const valid = await verifyPassword(password, admin.password_hash, admin.salt);
      if (!valid) return err('Credenciales incorrectas', 401);

      const token = await signJWT(
        { role: 'admin', exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8 },
        env.JWT_SECRET
      );

      return json({ ok: true, token });
    }

    // ── SOLICITAR LICENCIA (público) ──
    if (path === '/api/licenses/request' && method === 'POST') {
      const body = await req.json();
      const { centerName, centerType, contactName, email, phone, students, message } = body;

      if (!centerName || !contactName || !email) return err('Faltan campos obligatorios');

      const id = generateId('req_');
      await env.DB.prepare(
        `INSERT INTO centers (id, name, type, contact_name, email, phone, students, message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(id, centerName, centerType, contactName, email, phone || null, students || null, message || null)
        .run();

      return json({ ok: true, id });
    }

    // ── LISTAR SOLICITUDES (admin) ──
    if (path === '/api/admin/requests' && method === 'GET') {
      if (!(await requireAdmin(req, env))) return err('No autorizado', 401);

      const { results } = await env.DB.prepare(
        `SELECT c.*, l.code as license_code, l.max_users, l.id as license_id
         FROM centers c
         LEFT JOIN licenses l ON l.center_id = c.id
         ORDER BY c.created_at DESC`
      ).all();

      return json({ requests: results });
    }

    // ── APROBAR SOLICITUD (admin) ──
    if (path === '/api/admin/requests/approve' && method === 'POST') {
      if (!(await requireAdmin(req, env))) return err('No autorizado', 401);

      const { centerId, maxUsers } = await req.json();
      if (!centerId || !maxUsers) return err('Faltan campos');

      const center = await env.DB.prepare(
        "SELECT * FROM centers WHERE id = ? AND status = 'pending'"
      )
        .bind(centerId)
        .first();
      if (!center) return err('Solicitud no encontrada o ya procesada', 404);

      const code = generateLicenseCode();
      const licenseId = generateId('lic_');

      await env.DB.batch([
        env.DB.prepare("UPDATE centers SET status = 'approved' WHERE id = ?").bind(centerId),
        env.DB.prepare(
          'INSERT INTO licenses (id, center_id, code, max_users) VALUES (?, ?, ?, ?)'
        ).bind(licenseId, centerId, code, maxUsers),
      ]);

      return json({ ok: true, licenseCode: code, licenseId });
    }

    // ── RECHAZAR SOLICITUD (admin) ──
    if (path === '/api/admin/requests/reject' && method === 'POST') {
      if (!(await requireAdmin(req, env))) return err('No autorizado', 401);

      const { centerId } = await req.json();
      if (!centerId) return err('Falta centerId');

      await env.DB.prepare("UPDATE centers SET status = 'rejected' WHERE id = ?")
        .bind(centerId)
        .run();

      return json({ ok: true });
    }

    // ── CREAR USUARIO (admin) ──
    if (path === '/api/admin/users' && method === 'POST') {
      if (!(await requireAdmin(req, env))) return err('No autorizado', 401);

      const { name, email, licenseId } = await req.json();
      if (!name || !email || !licenseId) return err('Faltan campos');

      const license = await env.DB.prepare('SELECT * FROM licenses WHERE id = ?')
        .bind(licenseId)
        .first();
      if (!license) return err('Licencia no encontrada', 404);

      const existingUser = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
        .bind(email)
        .first();
      if (existingUser) return err('Ya existe un usuario con ese email');

      const { results: licenseUsers } = await env.DB.prepare(
        'SELECT id FROM users WHERE license_id = ?'
      )
        .bind(licenseId)
        .all();
      if (licenseUsers.length >= license.max_users) {
        return err('La licencia ha alcanzado el máximo de usuarios');
      }

      const password = generateSecurePassword();
      const { hash, salt } = await hashPassword(password);
      const userId = generateId('usr_');

      await env.DB.prepare(
        'INSERT INTO users (id, license_id, name, email, password_hash, salt) VALUES (?, ?, ?, ?, ?, ?)'
      )
        .bind(userId, licenseId, name, email, hash, salt)
        .run();

      // Contraseña devuelta UNA sola vez — después solo existe el hash en D1
      return json({ ok: true, userId, email, password });
    }

    // ── LISTAR USUARIOS (admin) ──
    if (path === '/api/admin/users' && method === 'GET') {
      if (!(await requireAdmin(req, env))) return err('No autorizado', 401);

      const { results } = await env.DB.prepare(
        `SELECT u.id, u.name, u.email, u.created_at, l.code as license_code, c.name as center_name
         FROM users u
         JOIN licenses l ON l.id = u.license_id
         JOIN centers c ON c.id = l.center_id
         ORDER BY u.created_at DESC`
      ).all();

      return json({ users: results });
    }

    // ── LISTAR LICENCIAS (admin) ──
    if (path === '/api/admin/licenses' && method === 'GET') {
      if (!(await requireAdmin(req, env))) return err('No autorizado', 401);

      const { results } = await env.DB.prepare(
        `SELECT l.*, c.name as center_name,
         (SELECT COUNT(*) FROM users u WHERE u.license_id = l.id) as used_users
         FROM licenses l
         JOIN centers c ON c.id = l.center_id
         ORDER BY l.created_at DESC`
      ).all();

      return json({ licenses: results });
    }

    // ── USER LOGIN ──
    if (path === '/api/auth/login' && method === 'POST') {
      const { email, password } = await req.json();
      if (!email || !password) return err('Faltan campos');

      const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
        .bind(email)
        .first();

      // Mismo mensaje siempre para evitar enumeración de emails
      if (!user) return err('Credenciales incorrectas', 401);

      const valid = await verifyPassword(password, user.password_hash, user.salt);
      if (!valid) return err('Credenciales incorrectas', 401);

      const token = await signJWT(
        {
          role: 'user',
          userId: user.id,
          name: user.name,
          email: user.email,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        },
        env.JWT_SECRET
      );

      return json({ ok: true, token, name: user.name, email: user.email });
    }

    // ── USER SESSION CHECK ──
    if (path === '/api/auth/me' && method === 'GET') {
      const payload = await requireUser(req, env);
      if (!payload) return err('No autenticado', 401);
      return json({ name: payload.name, email: payload.email });
    }

    return err('Ruta no encontrada', 404);
  },
};
