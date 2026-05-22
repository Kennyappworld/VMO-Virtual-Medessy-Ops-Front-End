// src/utils/api.js — FIXED: backend returns data directly, not wrapped in data.data
const BASE = import.meta.env.VITE_API_URL || 'https://vmo-virtual-medessy-opps-backend-production.up.railway.app';

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
  if (!res.ok) throw new Error(data.error || data.message || `Request failed: ${res.status}`);
  // Backend returns data directly (not wrapped in data.data)
  return data;
}

export async function apiUpload(path, formData) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `Upload failed: ${res.status}`);
  return data;
}

export async function apiDownload(path) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const cd = res.headers.get('content-disposition') || '';
  const fn = cd.match(/filename=(.+)/)?.[1] || `vmo_export_${Date.now()}.csv`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fn; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const api = {
  // Auth
  login:            (body) => apiFetch('/api/auth/login', { method: 'POST', body }),
  logout:           ()     => apiFetch('/api/auth/logout', { method: 'POST' }),
  me:               ()     => apiFetch('/api/auth/me'),

  // Users
  getUsers:         ()     => apiFetch('/api/users'),
  createUser:       (body) => apiFetch('/api/users', { method: 'POST', body }),
  updateUser:       (id,b) => apiFetch(`/api/users/${id}`, { method: 'PUT', body: b }),
  deleteUser:       (id)   => apiFetch(`/api/users/${id}`, { method: 'DELETE' }),
  resetPwd:         (id,b) => apiFetch(`/api/users/${id}/password`, { method: 'PATCH', body: b }),

  // Drivers
  getDrivers:       ()     => apiFetch('/api/drivers'),
  getDriverProfile: (id)   => apiFetch(`/api/drivers/${id}/profile`),
  createDriver:     (body) => apiFetch('/api/drivers', { method: 'POST', body }),
  updateDriver:     (id,b) => apiFetch(`/api/drivers/${id}`, { method: 'PUT', body: b }),
  deleteDriver:     (id)   => apiFetch(`/api/drivers/${id}`, { method: 'DELETE' }),

  // Vehicles
  getVehicles:      ()     => apiFetch('/api/vehicles'),
  createVehicle:    (body) => apiFetch('/api/vehicles', { method: 'POST', body }),
  updateVehicle:    (id,b) => apiFetch(`/api/vehicles/${id}`, { method: 'PUT', body: b }),

  // Clients
  getClients:       ()     => apiFetch('/api/clients'),
  createClient:     (body) => apiFetch('/api/clients', { method: 'POST', body }),
  updateClient:     (id,b) => apiFetch(`/api/clients/${id}`, { method: 'PUT', body: b }),
  deleteClient:     (id)   => apiFetch(`/api/clients/${id}`, { method: 'DELETE' }),

  // Payment Requests
  getRequests:      (q)    => apiFetch(`/api/requests${q||''}`),
  createRequest:    (body) => apiFetch('/api/requests', { method: 'POST', body }),
  approveRequest:   (id)   => apiFetch(`/api/requests/${id}/approve`, { method: 'PATCH' }),
  declineRequest:   (id,b) => apiFetch(`/api/requests/${id}/decline`, { method: 'PATCH', body: b }),
  payRequest:       (id,b) => apiFetch(`/api/requests/${id}/pay`, { method: 'PATCH', body: b }),
  getTimeline:      (id)   => apiFetch(`/api/requests/${id}/timeline`),

  // Fuel
  getFuelRequests:  (q)    => apiFetch(`/api/fuel${q||''}`),
  createFuelReq:    (body) => apiFetch('/api/fuel', { method: 'POST', body }),
  approveFuel:      (id)   => apiFetch(`/api/fuel/${id}/approve`, { method: 'PATCH' }),
  declineFuel:      (id,b) => apiFetch(`/api/fuel/${id}/decline`, { method: 'PATCH', body: b }),

  // Receivables
  getReceivables:   ()     => apiFetch('/api/receivables'),
  createReceivable: (b)    => apiFetch('/api/receivables', { method: 'POST', body: b }),
  confirmReceipt:   (id)   => apiFetch(`/api/receivables/${id}/confirm`, { method: 'PATCH' }),

  // Expected Debits
  getDebits:        ()     => apiFetch('/api/expected-debits'),
  createDebit:      (body) => apiFetch('/api/expected-debits', { method: 'POST', body }),
  confirmDebit:     (id)   => apiFetch(`/api/expected-debits/${id}/confirm`, { method: 'PATCH' }),

  // Imprest
  getImprest:       ()     => apiFetch('/api/imprest'),
  createImprest:    (body) => apiFetch('/api/imprest', { method: 'POST', body }),
  updateImprest:    (id,b) => apiFetch(`/api/imprest/${id}`, { method: 'PUT', body: b }),
  fundImprest:      (id,b) => apiFetch(`/api/imprest/${id}/fund`, { method: 'PATCH', body: b }),
  getImprestTx:     (id)   => apiFetch(`/api/imprest/${id}/transactions`),

  // Pool Vehicles
  getPoolVehicles:  ()     => apiFetch('/api/pool-vehicles'),
  createPoolVehicle:(body) => apiFetch('/api/pool-vehicles', { method: 'POST', body }),
  updatePoolVehicle:(id,b) => apiFetch(`/api/pool-vehicles/${id}`, { method: 'PUT', body: b }),

  // Reservations
  getReservations:  ()     => apiFetch('/api/reservations'),
  createReservation:(b)    => apiFetch('/api/reservations', { method: 'POST', body: b }),
  approveReservation:(id)  => apiFetch(`/api/reservations/${id}/approve`, { method: 'PATCH' }),
  declineReservation:(id)  => apiFetch(`/api/reservations/${id}/decline`, { method: 'PATCH' }),

  // Inventory
  getInventory:     ()     => apiFetch('/api/inventory'),
  createInventory:  (body) => apiFetch('/api/inventory', { method: 'POST', body }),
  restockItem:      (id,b) => apiFetch(`/api/inventory/${id}/restock`, { method: 'PATCH', body: b }),
  issueItem:        (id,b) => apiFetch(`/api/inventory/${id}/issue`, { method: 'POST', body: b }),
  getIssuances:     (id)   => apiFetch(`/api/inventory/${id}/issuances`),

  // Notifications
  getNotifications: ()     => apiFetch('/api/notifications'),
  markRead:         (id)   => apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  readAllNotifs:    ()     => apiFetch('/api/notifications/read-all', { method: 'PATCH' }),

  // Chat
  getChatGroups:    ()     => apiFetch('/api/chat/groups'),
  createChatGroup:  (body) => apiFetch('/api/chat/groups', { method: 'POST', body }),
  closeChatGroup:   (id)   => apiFetch(`/api/chat/groups/${id}/close`, { method: 'PATCH' }),
  getMessages:      (id)   => apiFetch(`/api/chat/groups/${id}/messages`),
  sendMessage:      (id,b) => apiFetch(`/api/chat/groups/${id}/messages`, { method: 'POST', body: b }),

  // Analytics
  getDashboard:     ()     => apiFetch('/api/analytics/dashboard'),
  getCashflow:      ()     => apiFetch('/api/analytics/cashflow'),
  getByCategory:    (q)    => apiFetch(`/api/analytics/by-category${q||''}`),

  // Compliance
  getAlerts:        ()     => apiFetch('/api/compliance/alerts'),

  // Search
  search:           (q)    => apiFetch(`/api/search?q=${encodeURIComponent(q)}`),

  // Audit
  getAudit:         ()     => apiFetch('/api/audit'),

  // Export
  exportData:       (entity, q) => apiDownload(`/api/export/${entity}${q||''}`),
};

export default api;
