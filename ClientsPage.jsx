/* VMO Global Styles v3.0 */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-base: #0F172A;
  --bg-surface: #1E293B;
  --bg-elevated: #263450;
  --bg-overlay: rgba(15,23,42,0.85);
  --border: rgba(148,163,184,0.12);
  --border-hover: rgba(148,163,184,0.25);
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-tertiary: #64748B;
  --accent: #3B82F6;
  --accent-hover: #2563EB;
  --accent-dim: rgba(59,130,246,0.15);
  --success: #10B981;
  --success-dim: rgba(16,185,129,0.15);
  --warning: #F59E0B;
  --warning-dim: rgba(245,158,11,0.15);
  --danger: #EF4444;
  --danger-dim: rgba(239,68,68,0.15);
  --purple: #8B5CF6;
  --purple-dim: rgba(139,92,246,0.15);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.4);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.5);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.6);
  --sidebar-w: 220px;
  --header-h: 56px;
  --font: 'Inter', system-ui, sans-serif;
  --mono: 'JetBrains Mono', monospace;
  --transition: 0.15s ease;
}

html { font-size: 14px; -webkit-tap-highlight-color: transparent; }
body {
  font-family: var(--font);
  background: var(--bg-base);
  color: var(--text-primary);
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-hover); border-radius: 3px; }

/* Layout */
.layout { display: flex; min-height: 100vh; }
.sidebar {
  width: var(--sidebar-w);
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0; top: 0; bottom: 0;
  z-index: 50;
  overflow-y: auto;
  transition: transform var(--transition);
}
.main-content {
  margin-left: var(--sidebar-w);
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.page-header {
  height: var(--header-h);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 40;
}
.page-content { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 16px; }

/* Sidebar nav */
.sb-brand { padding: 16px; border-bottom: 1px solid var(--border); }
.sb-brand-name { font-size: 14px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.3px; }
.sb-brand-sub { font-size: 10px; color: var(--text-tertiary); margin-top: 2px; }
.sb-section { font-size: 9px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: var(--text-tertiary); padding: 12px 16px 4px; }
.nav-item {
  display: flex; align-items: center; gap: 9px;
  padding: 8px 12px; margin: 1px 8px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition);
  text-decoration: none;
  position: relative;
}
.nav-item:hover { background: var(--bg-elevated); color: var(--text-primary); }
.nav-item.active { background: var(--accent-dim); color: var(--accent); font-weight: 500; }
.nav-item.active::before { content: ''; position: absolute; left: -8px; top: 50%; transform: translateY(-50%); width: 3px; height: 16px; background: var(--accent); border-radius: 2px; }
.nav-item i { font-size: 15px; width: 16px; text-align: center; flex-shrink: 0; }
.nav-badge { margin-left: auto; font-size: 9px; font-weight: 600; padding: 1px 6px; border-radius: 10px; color: #fff; }
.nav-badge.red { background: var(--danger); animation: pulse-badge 2s infinite; }
.nav-badge.amber { background: var(--warning); }
.nav-badge.green { background: var(--success); }
@keyframes pulse-badge { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }

/* Cards */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: rgba(255,255,255,0.02);
}
.card-title { font-size: 12px; font-weight: 600; color: var(--text-primary); }
.card-body { padding: 16px; }
.card-actions { display: flex; gap: 6px; align-items: center; }

/* KPI Cards */
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap: 10px; }
.kpi-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
  cursor: pointer;
  transition: border-color var(--transition);
}
.kpi-card:hover { border-color: var(--border-hover); }
.kpi-label { font-size: 10px; font-weight: 500; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
.kpi-value { font-size: 22px; font-weight: 700; line-height: 1; }
.kpi-sub { font-size: 10px; color: var(--text-secondary); margin-top: 4px; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
  font-family: var(--font);
  text-decoration: none;
}
.btn:hover { background: var(--bg-elevated); border-color: var(--border-hover); }
.btn:active { transform: scale(0.98); }
.btn i { font-size: 14px; }
.btn-primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); }
.btn-success { background: var(--success); border-color: var(--success); color: #fff; }
.btn-success:hover { background: #059669; }
.btn-danger { background: var(--danger-dim); border-color: rgba(239,68,68,0.3); color: #FCA5A5; }
.btn-danger:hover { background: rgba(239,68,68,0.25); }
.btn-sm { padding: 4px 8px; font-size: 10px; }
.btn-sm i { font-size: 12px; }
.btn-icon { padding: 6px; width: 30px; height: 30px; justify-content: center; }

/* Badges */
.badge { display: inline-flex; align-items: center; gap: 3px; font-size: 9px; font-weight: 600; padding: 2px 7px; border-radius: 20px; white-space: nowrap; letter-spacing: 0.3px; }
.badge-ok { background: var(--success-dim); color: #6EE7B7; }
.badge-warn { background: var(--warning-dim); color: #FCD34D; }
.badge-danger { background: var(--danger-dim); color: #FCA5A5; }
.badge-info { background: var(--accent-dim); color: #93C5FD; }
.badge-purple { background: var(--purple-dim); color: #C4B5FD; }
.badge-muted { background: rgba(148,163,184,0.1); color: var(--text-secondary); }
.badge-blink { animation: blink-badge 1.2s step-start infinite; }
@keyframes blink-badge { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }

/* Table */
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 11px; }
th { font-size: 10px; font-weight: 600; color: var(--text-tertiary); padding: 8px 12px; border-bottom: 1px solid var(--border); text-align: left; text-transform: uppercase; letter-spacing: 0.4px; white-space: nowrap; background: rgba(255,255,255,0.02); }
td { padding: 9px 12px; border-bottom: 1px solid var(--border); color: var(--text-primary); vertical-align: middle; }
tr:last-child td { border-bottom: none; }
tr.clickable { cursor: pointer; }
tr.clickable:hover td { background: var(--bg-elevated); }

/* Form Elements */
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-label { font-size: 10px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.4px; }
.form-label .req { color: var(--warning); margin-left: 2px; }
.form-input, .form-select, .form-textarea {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 12px;
  padding: 8px 10px;
  width: 100%;
  font-family: var(--font);
  transition: border-color var(--transition);
  outline: none;
}
.form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
.form-input::placeholder { color: var(--text-tertiary); }
.form-select option { background: var(--bg-surface); }
.form-textarea { resize: vertical; min-height: 70px; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.form-section { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px; }
.form-section-title { font-size: 10px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 10px; }

/* Alerts */
.alert { display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; border-radius: var(--radius-md); font-size: 11px; line-height: 1.5; }
.alert i { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
.alert-danger { background: var(--danger-dim); border: 1px solid rgba(239,68,68,0.3); color: #FCA5A5; }
.alert-warning { background: var(--warning-dim); border: 1px solid rgba(245,158,11,0.3); color: #FCD34D; }
.alert-success { background: var(--success-dim); border: 1px solid rgba(16,185,129,0.3); color: #6EE7B7; }
.alert-info { background: var(--accent-dim); border: 1px solid rgba(59,130,246,0.3); color: #93C5FD; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; align-items: flex-start; justify-content: center;
  padding: 40px 16px; z-index: 1000; overflow-y: auto;
  backdrop-filter: blur(4px);
}
.modal {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  width: 100%; max-width: 520px;
  box-shadow: var(--shadow-lg);
  position: relative;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; background: var(--bg-surface);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  z-index: 1;
}
.modal-title { font-size: 14px; font-weight: 600; }
.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.modal-footer { display: flex; gap: 8px; padding: 16px 20px; border-top: 1px solid var(--border); }

/* Timeline */
.timeline { display: flex; flex-direction: column; gap: 0; }
.tl-step { display: flex; gap: 10px; padding: 10px 0; position: relative; }
.tl-step:not(:last-child)::before { content: ''; position: absolute; left: 10px; top: 28px; bottom: -10px; width: 1px; background: var(--border); }
.tl-dot { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; border: 1px solid var(--border); }
.tl-dot.done { background: var(--success-dim); border-color: var(--success); color: var(--success); }
.tl-dot.active { background: var(--accent); border-color: var(--accent); color: #fff; }
.tl-dot.wait { background: var(--bg-elevated); color: var(--text-tertiary); }
.tl-content { flex: 1; padding-top: 2px; }
.tl-label { font-size: 12px; font-weight: 500; }
.tl-sub { font-size: 10px; color: var(--text-secondary); margin-top: 2px; }

/* Notifications */
.notif-item { display: flex; gap: 10px; padding: 10px 14px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background var(--transition); }
.notif-item:hover { background: var(--bg-elevated); }
.notif-item:last-child { border-bottom: none; }
.notif-item.unread { background: rgba(59,130,246,0.04); }
.notif-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.notif-title { font-size: 11px; font-weight: 500; color: var(--text-primary); }
.notif-body { font-size: 10px; color: var(--text-secondary); margin-top: 2px; line-height: 1.4; }
.notif-time { font-size: 9px; color: var(--text-tertiary); margin-top: 3px; }
.notif-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); flex-shrink: 0; margin-top: 5px; }

/* Search */
.search-bar { display: flex; align-items: center; gap: 8px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 0 12px; transition: border-color var(--transition); }
.search-bar:focus-within { border-color: var(--accent); }
.search-bar i { color: var(--text-tertiary); font-size: 14px; }
.search-bar input { background: transparent; border: none; outline: none; font-size: 12px; color: var(--text-primary); padding: 7px 0; width: 100%; font-family: var(--font); }
.search-bar input::placeholder { color: var(--text-tertiary); }

/* Filter chips */
.chips { display: flex; gap: 5px; flex-wrap: wrap; }
.chip { font-size: 10px; padding: 4px 10px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text-secondary); cursor: pointer; transition: all var(--transition); font-weight: 500; }
.chip.active { background: var(--accent-dim); border-color: rgba(59,130,246,0.4); color: var(--accent); }

/* Progress bar */
.prog-bar { background: var(--bg-elevated); border-radius: 4px; height: 6px; overflow: hidden; }
.prog-fill { height: 6px; border-radius: 4px; transition: width 0.5s ease; }
.prog-ok { background: var(--success); }
.prog-warn { background: var(--warning); }
.prog-danger { background: var(--danger); }

/* Login page */
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-base); padding: 20px; }
.login-box { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 40px; width: 100%; max-width: 380px; box-shadow: var(--shadow-lg); }
.login-logo { font-size: 28px; font-weight: 800; color: var(--accent); letter-spacing: -1px; margin-bottom: 6px; }
.login-sub { font-size: 12px; color: var(--text-secondary); margin-bottom: 28px; }

/* Utility */
.text-muted { color: var(--text-secondary); }
.text-danger { color: #FCA5A5; }
.text-success { color: #6EE7B7; }
.text-warning { color: #FCD34D; }
.text-accent { color: #93C5FD; }
.mono { font-family: var(--mono); }
.bold { font-weight: 600; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.w-full { width: 100%; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mb-2 { margin-bottom: 8px; }
.p-0 { padding: 0; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
.grid-4 { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 10px; }

/* Loading */
.spinner { width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-page { display: flex; align-items: center; justify-content: center; min-height: 200px; }

/* Responsive */
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
  .main-content { margin-left: 0; }
  .grid-4 { grid-template-columns: repeat(2,1fr); }
  .grid-3 { grid-template-columns: 1fr 1fr; }
  .form-grid-2 { grid-template-columns: 1fr; }
  .form-grid-3 { grid-template-columns: 1fr; }
}

/* Print */
@media print {
  .sidebar, .page-header, .btn, .modal-overlay { display: none !important; }
  .main-content { margin-left: 0; }
}

/* ── Additional utility classes for page components ── */
.kpi-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.kpi-grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.kpi-card { background: var(--bg-surface); border-radius: var(--radius-md); padding: 10px 14px; }
.kpi-label { font-size: 10px; color: var(--text-tertiary); margin-bottom: 3px; }
.kpi-value { font-size: 20px; font-weight: 700; }
.kpi-sub { font-size: 10px; color: var(--text-secondary); margin-top: 2px; }

.tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); margin-bottom: 4px; }
.tab { background: none; border: none; color: var(--text-secondary); font-size: 12px; padding: 8px 16px; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; }
.tab:hover { color: var(--text-primary); }
.tab.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 500; }

.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

.bg-secondary { background: var(--bg-surface); }
.bg-highlight { background: rgba(59,130,246,0.05); }

.success-bg { background: var(--success-dim); }
.danger-bg { background: var(--danger-dim); }

.badge-blink { animation: blink 1.1s step-start infinite; }
