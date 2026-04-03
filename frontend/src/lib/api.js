const API = 'https://mindpath-worker.nicolaspo334.workers.dev';

function getAdminToken() {
  return sessionStorage.getItem('mindpath_admin_token');
}

function getUserToken() {
  return sessionStorage.getItem('mindpath_user_token');
}

async function request(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error del servidor');
  return data;
}

// ── Admin ──

export async function adminLogin(password) {
  const data = await request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  sessionStorage.setItem('mindpath_admin_token', data.token);
  return data;
}

export async function adminLogout() {
  sessionStorage.removeItem('mindpath_admin_token');
}

export async function getRequests() {
  return request('/api/admin/requests', {}, getAdminToken());
}

export async function approveRequest(centerId, maxUsers) {
  return request(
    '/api/admin/requests/approve',
    { method: 'POST', body: JSON.stringify({ centerId, maxUsers }) },
    getAdminToken()
  );
}

export async function rejectRequest(centerId) {
  return request(
    '/api/admin/requests/reject',
    { method: 'POST', body: JSON.stringify({ centerId }) },
    getAdminToken()
  );
}

export async function createUser(name, email, licenseId) {
  return request(
    '/api/admin/users',
    { method: 'POST', body: JSON.stringify({ name, email, licenseId }) },
    getAdminToken()
  );
}

export async function getUsers() {
  return request('/api/admin/users', {}, getAdminToken());
}

export async function getLicenses() {
  return request('/api/admin/licenses', {}, getAdminToken());
}

// ── Setup ──

export async function checkSetup() {
  return request('/api/setup/status');
}

export async function runSetup(password) {
  return request('/api/setup', { method: 'POST', body: JSON.stringify({ password }) });
}

// ── Solicitar licencia (público) ──

export async function requestLicense(formData) {
  return request('/api/licenses/request', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
}

// ── User auth ──

export async function userLogin(email, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  sessionStorage.setItem('mindpath_user_token', data.token);
  sessionStorage.setItem('mindpath_user', JSON.stringify({ name: data.name, email: data.email }));
  return data;
}

export async function userLogout() {
  sessionStorage.removeItem('mindpath_user_token');
  sessionStorage.removeItem('mindpath_user');
}

export function getStoredUser() {
  const stored = sessionStorage.getItem('mindpath_user');
  return stored ? JSON.parse(stored) : null;
}

export function isAdminLoggedIn() {
  return !!getAdminToken();
}

export function isUserLoggedIn() {
  return !!getUserToken();
}
