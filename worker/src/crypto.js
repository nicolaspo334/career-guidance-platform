// ── Password hashing with PBKDF2 (Web Crypto API, built into Workers) ──

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = bufToHex(salt);

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 10_000 },
    key,
    256
  );

  return { hash: bufToHex(new Uint8Array(bits)), salt: saltHex };
}

export async function verifyPassword(password, storedHash, storedSalt) {
  const salt = hexToBuf(storedSalt);

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 10_000 },
    key,
    256
  );

  return bufToHex(new Uint8Array(bits)) === storedHash;
}

// ── JWT (HMAC-SHA256, sin dependencias externas) ──

export async function signJWT(payload, secret) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const data = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return `${data}.${bufToB64url(new Uint8Array(sig))}`;
}

export async function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, sig] = parts;
  const data = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    hexToBuf(b64urlToHex(sig)),
    new TextEncoder().encode(data)
  );

  if (!valid) return null;

  const payload = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/')));
  if (payload.exp && Date.now() / 1000 > payload.exp) return null;

  return payload;
}

// ── Secure random ID ──

export function generateId(prefix = '') {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return prefix + bufToHex(bytes);
}

// ── Secure license code: MIND-XXXX-XXXX ──

export function generateLicenseCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const values = crypto.getRandomValues(new Uint8Array(8));
  const seg = (offset) =>
    Array.from(values.slice(offset, offset + 4))
      .map((v) => chars[v % chars.length])
      .join('');
  return `MIND-${seg(0)}-${seg(4)}`;
}

// ── Secure password generator ──

export function generateSecurePassword(length = 16) {
  const charset = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values)
    .map((v) => charset[v % charset.length])
    .join('');
}

// ── Helpers ──

function bufToHex(buf) {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuf(hex) {
  const pairs = hex.match(/.{1,2}/g) || [];
  return new Uint8Array(pairs.map((b) => parseInt(b, 16)));
}

function b64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function bufToB64url(buf) {
  return btoa(String.fromCharCode(...buf))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function b64urlToHex(b64) {
  const bin = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
  return Array.from(bin)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}
