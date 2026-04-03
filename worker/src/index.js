import {
  hashPassword, verifyPassword, signJWT, verifyJWT,
  generateId, generateLicenseCode, generateSecurePassword,
} from './crypto.js';
import { sendLicenseApprovedEmail } from './email.js';

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

      return err('Ruta no encontrada', 404);

    } catch (e) {
      console.error(e?.message || e);
      return err('Error interno del servidor', 500);
    }
  },
};

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
