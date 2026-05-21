// src/utils/api.js
const BASE = import.meta.env.VITE_API_URL || '';

function getToken() { return localStorage.getItem('vmo_token'); }

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
  return data.data;
}

export async function apiUpload(path, formData) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Upload failed: ${res.status}`);
  return data.data;
}

export async function apiDownload(path) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const cd = res.headers.get('content-disposition') || '';
  const fn = cd.match(/filename=(.+)/)?.[1] || `vmo_export_${Date.now()}.xlsx`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fn; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const api = {
  // Auth
  login:          (body) => apiFetch('/api/auth/login', { method: 'POST', body }),
  logout:         ()     => apiFetch('/api/auth/logout', { method: 'POST' }),
  changePwd:      (body) => apiFetch('/api/auth/change-password', { method: 'POST', body }),

  // Users
  getUsers:       ()     => apiFetch('/api/users'),
  createUser:     (body) => apiFetch('/api/users', { method: 'POST', body }),
  updateUser:     (id,b) => apiFetch(`/api/users/${id}`, { method: 'PATCH', body: b }),
  suspendUser:    (id)   => apiFetch(`/api/users/${id}/suspend`, { method: 'PATCH' }),
  resetPwd:       (id,b) => apiFetch(`/api/users/${id}/reset-password`, { method: 'POST', body: b }),

  // Drivers
  getDrivers:     ()     => apiFetch('/api/drivers'),
  getDriver:      (id)   => apiFetch(`/api/drivers/${id}`),
  createDriver:   (body) => apiFetch('/api/drivers', { method: 'POST', body }),
  updateDriver:   (id,b) => apiFetch(`/api/drivers/${id}`, { method: 'PATCH', body: b }),
  deleteDriver:   (id)   => apiFetch(`/api/drivers/${id}`, { method: 'DELETE' }),
  renewLicence:   (id,b) => apiFetch(`/api/drivers/${id}/renew-licence`, { method: 'POST', body: b }),

  // Vehicles
  getVehicles:    ()     => apiFetch('/api/vehicles'),
  createVehicle:  (body) => apiFetch('/api/vehicles', { method: 'POST', body }),
  updateVehicle:  (id,b) => apiFetch(`/api/vehicles/${id}`, { method: 'PATCH', body: b }),
  uploadVehicleDoc:(id,fd)=> apiUpload(`/api/vehicles/${id}/documents`, fd),

  // Reservations
  getReservations:(q)    => apiFetch(`/api/pool-reservations${q||''}`),
  createReservation:(b)  => apiFetch('/api/pool-reservations', { method: 'POST', body: b }),
  updateReservation:(id,b)=>apiFetch(`/api/pool-reservations/${id}`, { method: 'PATCH', body: b }),

  // Requests
  getRequests:    (q)    => apiFetch(`/api/requests${q||''}`),
  createRequest:  (body) => apiFetch('/api/requests', { method: 'POST', body }),
  approveRequest: (id)   => apiFetch(`/api/requests/${id}/approve`, { method: 'PATCH' }),
  declineRequest: (id,b) => apiFetch(`/api/requests/${id}/decline`, { method: 'PATCH', body: b }),
  payRequest:     (id)   => apiFetch(`/api/requests/${id}/pay`, { method: 'PATCH' }),

  // Fuel
  getFuelRequests:(q)    => apiFetch(`/api/fuel-requests${q||''}`),
  createFuelReq:  (body) => apiFetch('/api/fuel-requests', { method: 'POST', body }),
  approveFuel:    (id)   => apiFetch(`/api/fuel-requests/${id}/approve`, { method: 'PATCH' }),

  // Clients
  getClients:     ()     => apiFetch('/api/clients'),
  createClient:   (body) => apiFetch('/api/clients', { method: 'POST', body }),
  updateClient:   (id,b) => apiFetch(`/api/clients/${id}`, { method: 'PATCH', body: b }),

  // Receivables
  getReceivables: ()     => apiFetch('/api/receivables'),
  createReceivable:(b)   => apiFetch('/api/receivables', { method: 'POST', body: b }),
  confirmReceipt: (id,b) => apiFetch(`/api/receivables/${id}/confirm`, { method: 'PATCH', body: b }),

  // Expected debits
  getDebits:      ()     => apiFetch('/api/expected-debits'),
  createDebit:    (body) => apiFetch('/api/expected-debits', { method: 'POST', body }),

  // Notifications
  getNotifications:()    => apiFetch('/api/notifications'),
  readAllNotifs:  ()     => apiFetch('/api/notifications/read-all', { method: 'PATCH' }),

  // Analytics
  getDashboard:   ()     => apiFetch('/api/analytics/dashboard'),

  // Export
  exportData:     (entity, format, q) => apiDownload(`/api/export/${entity}?format=${format||'xlsx'}${q||''}`),
};

export default api;

// Additional exports for convenience
export { apiFetch, apiUpload, apiDownload };

// Convenience wrappers
export async function exportToFormat(entity, format = 'xlsx', query = '') {
  return apiDownload(`/api/export/${entity}?format=${format}${query}`);
}
