const API = 'https://mindpath-worker.nicolaspo334.workers.dev';

async function request(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error del servidor');
  return data;
}

const getAdminToken  = () => sessionStorage.getItem('mindpath_admin_token');
const getUserToken   = () => sessionStorage.getItem('mindpath_user_token');
const getCenterToken = () => sessionStorage.getItem('mindpath_center_token');

// ── Setup ──────────────────────────────────────────────────────────────────────
export const checkSetup = () => request('/api/setup/status');
export const runSetup   = (password) => request('/api/setup', { method: 'POST', body: JSON.stringify({ password }) });

// ── Admin auth ─────────────────────────────────────────────────────────────────
export async function adminLogin(password) {
  const data = await request('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) });
  sessionStorage.setItem('mindpath_admin_token', data.token);
  return data;
}
export function adminLogout() { sessionStorage.removeItem('mindpath_admin_token'); }
export const isAdminLoggedIn = () => !!getAdminToken();

// ── Admin: requests ────────────────────────────────────────────────────────────
export const getRequests    = () => request('/api/admin/requests', {}, getAdminToken());
export const approveRequest = (centerId, maxUsers) =>
  request('/api/admin/requests/approve', { method: 'POST', body: JSON.stringify({ centerId, maxUsers }) }, getAdminToken());
export const rejectRequest  = (centerId) =>
  request('/api/admin/requests/reject', { method: 'POST', body: JSON.stringify({ centerId }) }, getAdminToken());

// ── Admin: licenses ────────────────────────────────────────────────────────────
export const getLicenses      = () => request('/api/admin/licenses', {}, getAdminToken());
export const revokeLicense    = (licenseId, revoked) =>
  request('/api/admin/licenses/revoke', { method: 'PATCH', body: JSON.stringify({ licenseId, revoked }) }, getAdminToken());
export const updateMaxUsers   = (licenseId, maxUsers) =>
  request('/api/admin/licenses/max-users', { method: 'PATCH', body: JSON.stringify({ licenseId, maxUsers }) }, getAdminToken());

// ── Admin: users ───────────────────────────────────────────────────────────────
export const getUsers         = () => request('/api/admin/users', {}, getAdminToken());
export const createAdminUser  = (name, email, licenseId) =>
  request('/api/admin/users', { method: 'POST', body: JSON.stringify({ name, email, licenseId }) }, getAdminToken());

// ── License request (public) ───────────────────────────────────────────────────
export const requestLicense = (formData) =>
  request('/api/licenses/request', { method: 'POST', body: JSON.stringify(formData) });

// ── Center auth ────────────────────────────────────────────────────────────────
export async function centerLogin(email, password) {
  const data = await request('/api/center/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  sessionStorage.setItem('mindpath_center_token', data.token);
  sessionStorage.setItem('mindpath_center_name', data.centerName);
  sessionStorage.setItem('mindpath_center_email', email);
  return data;
}
export async function centerChangePassword(currentPassword, newPassword) {
  const email = sessionStorage.getItem('mindpath_center_email') || '';
  const data = await request('/api/center/change-password', {
    method: 'POST',
    body: JSON.stringify({ email, currentPassword, newPassword }),
  });
  // Refresh token after password change
  sessionStorage.setItem('mindpath_center_token', data.token);
  return data;
}
export function centerLogout() {
  sessionStorage.removeItem('mindpath_center_token');
  sessionStorage.removeItem('mindpath_center_name');
  sessionStorage.removeItem('mindpath_center_email');
}
export const isCenterLoggedIn    = () => !!getCenterToken();
export const getStoredCenterName = () => sessionStorage.getItem('mindpath_center_name') || '';
export const getStoredCenterEmail = () => sessionStorage.getItem('mindpath_center_email') || '';

// ── Center: management ─────────────────────────────────────────────────────────
export const getCenterInfo       = () => request('/api/center/info', {}, getCenterToken());
export const getCenterUsers      = () => request('/api/center/users', {}, getCenterToken());
export const createCenterUser    = (name, email) =>
  request('/api/center/users', { method: 'POST', body: JSON.stringify({ name, email }) }, getCenterToken());
export const deactivateUser      = (userId) =>
  request('/api/center/users/deactivate', { method: 'POST', body: JSON.stringify({ userId }) }, getCenterToken());
export const reactivateUser      = (userId) =>
  request('/api/center/users/reactivate', { method: 'POST', body: JSON.stringify({ userId }) }, getCenterToken());

// ── User auth ──────────────────────────────────────────────────────────────────
export async function userLogin(email, password) {
  const data = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  sessionStorage.setItem('mindpath_user_token', data.token);
  sessionStorage.setItem('mindpath_user', JSON.stringify({ name: data.name, email: data.email }));
  return data;
}
export async function userRegister(name, email, password, licenseCode) {
  const data = await request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, licenseCode }) });
  sessionStorage.setItem('mindpath_user_token', data.token);
  sessionStorage.setItem('mindpath_user', JSON.stringify({ name: data.name, email: data.email }));
  return data;
}
export function userLogout() {
  sessionStorage.removeItem('mindpath_user_token');
  sessionStorage.removeItem('mindpath_user');
}
export const getStoredUser  = () => { const s = sessionStorage.getItem('mindpath_user'); return s ? JSON.parse(s) : null; };
export const isUserLoggedIn = () => !!getUserToken();
