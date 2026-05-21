// src/App.jsx
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { api } from './utils/api.js';

// Lazy-load pages
const LoginPage      = lazy(() => import('./pages/LoginPage.jsx'));
const AdminDash      = lazy(() => import('./pages/AdminDash.jsx'));
const HRDash         = lazy(() => import('./pages/HRDash.jsx'));
const ComplianceDash = lazy(() => import('./pages/ComplianceDash.jsx'));
const DriverPortal   = lazy(() => import('./pages/DriverPortal.jsx'));
const AccountsDash   = lazy(() => import('./pages/AccountsDash.jsx'));
const VehiclesPage   = lazy(() => import('./pages/VehiclesPage.jsx'));
const DriversPage    = lazy(() => import('./pages/DriversPage.jsx'));
const RequestsPage   = lazy(() => import('./pages/RequestsPage.jsx'));
const ReservationsPage = lazy(() => import('./pages/ReservationsPage.jsx'));
const ClientsPage    = lazy(() => import('./pages/ClientsPage.jsx'));
const UsersPage      = lazy(() => import('./pages/UsersPage.jsx'));
const TimingPage     = lazy(() => import('./pages/TimingPage.jsx'));
const FinancePage    = lazy(() => import('./pages/FinancePage.jsx'));
const AuditPage      = lazy(() => import('./pages/AuditPage.jsx'));
const GlobalSearch   = lazy(() => import('./pages/GlobalSearch.jsx'));

function Loader() {
  return <div className="loading-page"><div className="spinner"></div></div>;
}

const NAV = [
  { section: 'Dashboards' },
  { path: '/search', icon: 'ti-search', label: 'Global search', roles: ['owner','real_admin','super_admin','operations_manager','hr_manager','accounts','compliance','driver_manager'] },
  { path: '/admin',      icon: 'ti-layout-dashboard', label: 'Admin overview',   roles: ['owner','real_admin','super_admin','operations_manager'] },
  { path: '/hr',         icon: 'ti-users',            label: 'HR dashboard',      roles: ['hr_manager','super_admin','real_admin','owner'] },
  { path: '/compliance', icon: 'ti-clipboard-check',  label: 'Compliance',        roles: ['compliance','super_admin','real_admin','owner','operations_manager'] },
  { path: '/driver',     icon: 'ti-steering-wheel',   label: 'Driver portal',     roles: ['driver'] },
  { path: '/accounts',   icon: 'ti-cash',             label: 'Accounts',          roles: ['accounts','super_admin','real_admin','owner'] },
  { section: 'Finance' },
  { path: '/finance',    icon: 'ti-chart-bar',        label: 'Finance hub',       roles: ['accounts','super_admin','real_admin','owner','operations_manager'] },
  { path: '/clients',    icon: 'ti-building',         label: 'Clients',           roles: ['accounts','super_admin','real_admin','owner'] },
  { section: 'Operations' },
  { path: '/requests',   icon: 'ti-file-invoice',     label: 'All requests',      roles: ['super_admin','real_admin','owner','accounts','operations_manager','hr_manager'] },
  { path: '/vehicles',   icon: 'ti-car',              label: 'Vehicles & docs',   roles: ['super_admin','real_admin','owner','compliance','operations_manager'] },
  { path: '/drivers',    icon: 'ti-id-badge',         label: 'Driver registry',   roles: ['hr_manager','super_admin','real_admin','owner','driver_manager'] },
  { path: '/reservations',icon:'ti-calendar',         label: 'Pool car bookings', roles: ['super_admin','real_admin','owner','operations_manager','hr_manager','driver','driver_manager'] },
  { section: 'Analytics' },
  { path: '/timing',     icon: 'ti-clock',            label: 'Timing & delays',   roles: ['super_admin','real_admin','owner','operations_manager'] },
  { section: 'Admin' },
  { path: '/users',      icon: 'ti-settings',         label: 'User management',   roles: ['super_admin','real_admin','owner'] },
  { path: '/audit',      icon: 'ti-shield-lock',      label: 'Audit ledger',      roles: ['owner','real_admin'] },
];

function Sidebar({ notifCount, onClose }) {
  const { user, logout } = useAuth();
  const loc = useLocation();

  const visible = NAV.filter(n => {
    if (n.section) return true;
    return n.roles.includes(user?.role);
  });

  return (
    <nav className="sidebar">
      <div className="sb-brand">
        <div className="sb-brand-name">VMO Suite</div>
        <div className="sb-brand-sub">Medessy Enterprises · FGT v3.0</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
        {visible.map((n, i) => {
          if (n.section) return <div key={i} className="sb-section">{n.section}</div>;
          return (
            <NavLink key={n.path} to={n.path} className={({isActive}) => `nav-item${isActive?' active':''}`} onClick={onClose}>
              <i className={`ti ${n.icon}`} aria-hidden="true"></i>
              {n.label}
              {n.path === '/admin' && notifCount > 0 &&
                <span className="nav-badge red">{notifCount}</span>}
            </NavLink>
          );
        })}
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
          {user?.name}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 10, textTransform: 'capitalize' }}>
          {user?.role?.replace(/_/g,' ')}
        </div>
        <button className="btn btn-sm w-full" style={{ justifyContent: 'center' }} onClick={logout}>
          <i className="ti ti-logout" aria-hidden="true"></i> Sign out
        </button>
      </div>
    </nav>
  );
}

function Layout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const load = () => api.getNotifications().then(d => setNotifs(d || [])).catch(() => {});
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  const unread = notifs.filter(n => !n.is_read).length;

  const defaultPath = {
    owner: '/admin', real_admin: '/admin', super_admin: '/admin',
    operations_manager: '/admin', hr_manager: '/hr', accounts: '/accounts',
    compliance: '/compliance', driver: '/driver', driver_manager: '/drivers',
  }[user?.role] || '/admin';

  return (
    <div className="layout">
      {sidebarOpen && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:49 }} onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`sidebar${sidebarOpen?' open':''}`}>
        <Sidebar notifCount={unread} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="main-content">
        <header className="page-header">
          <button className="btn btn-icon" onClick={() => setSidebarOpen(o => !o)} style={{ display: 'none' }}
            id="menu-btn" aria-label="Open menu">
            <i className="ti ti-menu-2" aria-hidden="true"></i>
          </button>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)', letterSpacing: '-0.2px' }}>
            Virtual Medessy Operations
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <button className="btn btn-icon" onClick={() => setNotifOpen(o => !o)} aria-label="Notifications">
                <i className="ti ti-bell" aria-hidden="true"></i>
                {unread > 0 && (
                  <span style={{ position:'absolute',top:2,right:2,width:8,height:8,background:'var(--danger)',borderRadius:'50%' }}></span>
                )}
              </button>
              {notifOpen && (
                <div style={{ position:'absolute',right:0,top:'calc(100% + 6px)',width:320,background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',boxShadow:'var(--shadow-lg)',zIndex:100,maxHeight:400,overflow:'auto' }}>
                  <div style={{ padding:'10px 14px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                    <span style={{ fontWeight:600,fontSize:12 }}>Notifications</span>
                    {unread > 0 && (
                      <button className="btn btn-sm" onClick={() => { api.readAllNotifs(); setNotifs(p => p.map(n=>({...n,is_read:true}))); }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifs.slice(0,20).map(n => (
                    <div key={n.id} className={`notif-item${!n.is_read?' unread':''}`}>
                      <div className="notif-icon" style={{ background:'var(--accent-dim)',color:'var(--accent)' }}>
                        <i className="ti ti-bell" aria-hidden="true"></i>
                      </div>
                      <div>
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-body">{n.body}</div>
                        <div className="notif-time">{new Date(n.created_at).toLocaleString()}</div>
                      </div>
                      {!n.is_read && <div className="notif-dot"></div>}
                    </div>
                  ))}
                  {!notifs.length && (
                    <div style={{ padding:20,textAlign:'center',color:'var(--text-tertiary)',fontSize:12 }}>No notifications</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={{ flex: 1 }}>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Navigate to={defaultPath} replace />} />
              <Route path="/admin"        element={<AdminDash />} />
              <Route path="/hr"           element={<HRDash />} />
              <Route path="/compliance"   element={<ComplianceDash />} />
              <Route path="/driver"       element={<DriverPortal />} />
              <Route path="/accounts"     element={<AccountsDash />} />
              <Route path="/finance"      element={<FinancePage />} />
              <Route path="/vehicles"     element={<VehiclesPage />} />
              <Route path="/drivers"      element={<DriversPage />} />
              <Route path="/requests"     element={<RequestsPage />} />
              <Route path="/reservations" element={<ReservationsPage />} />
              <Route path="/clients"      element={<ClientsPage />} />
              <Route path="/users"        element={<UsersPage />} />
              <Route path="/timing"       element={<TimingPage />} />
              <Route path="/search" element={<GlobalSearch />} />
              <Route path="/audit"        element={<AuditPage />} />
              <Route path="*"             element={<Navigate to={defaultPath} replace />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function ProtectedApp() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user)   return <Suspense fallback={<Loader />}><LoginPage /></Suspense>;
  return <Layout />;
}

export default function App() {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  );
}
