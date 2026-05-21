// src/pages/UsersPage.jsx
import React, { useState } from 'react';
import { api } from '../utils/api.js';
import { fmtDate, StatusBadge, Modal, FG, Alert, useData } from '../components/UI.jsx';

const ROLES = [
  { value:'operations_manager', label:'Operations Manager' },
  { value:'hr_manager', label:'HR Manager' },
  { value:'driver_manager', label:'Driver Manager' },
  { value:'accounts', label:'Accounts' },
  { value:'compliance', label:'Compliance' },
  { value:'inventory_manager', label:'Inventory Manager' },
  { value:'depot_clerk', label:'Depot Clerk' },
  { value:'driver', label:'Driver' },
  { value:'subcontractor', label:'Subcontractor' },
];

const REPORT_TYPES = [
  { value:'weekly', label:'Weekly (every Monday 06:00)' },
  { value:'monthly', label:'Monthly (1st of month)' },
  { value:'both', label:'Both weekly and monthly' },
  { value:'none', label:'No automated reports' },
];

export default function UsersPage() {
  const { data: users, loading, reload } = useData(() => api.getUsers());
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [showReset, setShowReset] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [search, setSearch] = useState('');
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.email || !form.role || !form.password) { setErr('All required fields must be filled.'); return; }
    setSaving(true); setErr('');
    try { await api.createUser(form); setShowAdd(false); setForm({}); reload(); } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  const resetPwd = async () => {
    if (!form.new_password || form.new_password.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    setSaving(true); setErr('');
    try { await api.resetPwd(showReset.id, { new_password: form.new_password }); setShowReset(null); setForm({}); } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  const suspendUser = async (u) => {
    if (!confirm(`Suspend ${u.name}? They will be locked out immediately.`)) return;
    try { await api.suspendUser(u.id); reload(); setShowDetail(null); } catch (e) { alert(e.message); }
  };

  const filtered = (users||[]).filter(u =>
    !search || [u.name, u.email, u.role].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div className="page-content">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize:18,fontWeight:700 }}>User management</h1>
          <p style={{ fontSize:11,color:'var(--text-secondary)',marginTop:2 }}>Super admin creates all users with password, email, and report subscriptions. Max 2 concurrent sessions per user.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowAdd(true); setForm({ report_subscription:'none' }); setErr(''); }}>
          <i className="ti ti-plus"></i> Create user
        </button>
      </div>

      <div className="search-bar" style={{ maxWidth:280,marginBottom:12 }}>
        <i className="ti ti-search"></i>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, email, role…" />
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Report subscription</th><th>Last login</th><th>Sessions</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="clickable" onClick={() => setShowDetail(u)}>
                <td style={{ fontWeight:500 }}>{u.name}</td>
                <td style={{ fontFamily:'var(--mono)',fontSize:10 }}>{u.email}</td>
                <td><span className="badge badge-info" style={{fontSize:9}}>{u.role}</span></td>
                <td style={{ fontSize:10 }}>{u.report_subscription || 'none'}</td>
                <td style={{ fontSize:10 }}>{fmtDate(u.last_login) || '—'}</td>
                <td><span className={`badge ${u.active_sessions>0?'badge-ok':'badge-muted'}`}>{u.active_sessions || 0}/2</span></td>
                <td><StatusBadge status={u.status || 'Active'} /></td>
                <td><button className="btn btn-sm" onClick={e=>{e.stopPropagation();setShowDetail(u)}}>View</button></td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={8} style={{ textAlign:'center',color:'var(--text-tertiary)',padding:20 }}>No users found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showAdd && (
        <Modal title="Create new user" onClose={() => setShowAdd(false)} width={520}
          footer={<><button className="btn" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={submit} disabled={saving}>{saving?'Creating…':'Create user'}</button></>}>
          {err && <Alert type="danger">{err}</Alert>}
          <div style={{ fontSize:11,color:'var(--text-secondary)',marginBottom:10 }}>
            Super admin sets the initial password. User can change it after first login. Max 2 concurrent sessions enforced — oldest session is booted on 3rd login.
          </div>
          <div className="form-grid-2">
            <FG label="Full name" required><input value={form.name||''} onChange={e=>f('name',e.target.value)} placeholder="e.g. Amaka Okonkwo" /></FG>
            <FG label="Email address" required><input type="email" value={form.email||''} onChange={e=>f('email',e.target.value)} placeholder="user@medessy.ng" /></FG>
            <FG label="Role" required>
              <select value={form.role||''} onChange={e=>f('role',e.target.value)}>
                <option value="">Select role…</option>
                {ROLES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </FG>
            <FG label="Initial password" required hint="Min 8 chars, include uppercase, number and symbol">
              <input type="password" value={form.password||''} onChange={e=>f('password',e.target.value)} placeholder="Min 8 characters" />
            </FG>
          </div>
          <FG label="Report subscription" hint="Automated reports delivered by email">
            <select value={form.report_subscription||'none'} onChange={e=>f('report_subscription',e.target.value)}>
              {REPORT_TYPES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </FG>
          <div className="form-grid-2" style={{ marginTop:8 }}>
            <FG label="Depot (for depot-specific roles)">
              <select value={form.depot||''} onChange={e=>f('depot',e.target.value)}>
                <option value="">Any depot</option>
                {['Lagos','Benin','Onitsha','Abuja','Port Harcourt'].map(d=><option key={d}>{d}</option>)}
              </select>
            </FG>
            <FG label="Department / team"><input value={form.department||''} onChange={e=>f('department',e.target.value)} placeholder="e.g. Operations" /></FG>
          </div>
        </Modal>
      )}

      {/* User Detail Modal */}
      {showDetail && (
        <Modal title={showDetail.name} onClose={() => setShowDetail(null)}
          footer={<>
            <button className="btn" onClick={() => setShowDetail(null)}>Close</button>
            <button className="btn" onClick={() => { setShowReset(showDetail); setShowDetail(null); setForm({}); setErr(''); }}>Reset password</button>
            <button className="btn btn-danger" onClick={() => suspendUser(showDetail)}>Suspend user</button>
          </>}>
          <div style={{ border:'1px solid var(--border)',borderRadius:8,overflow:'hidden' }}>
            {[
              ['Name', showDetail.name],
              ['Email', showDetail.email],
              ['Role', showDetail.role],
              ['Report subscription', showDetail.report_subscription || 'none'],
              ['Depot', showDetail.depot || 'Any'],
              ['Last login', fmtDate(showDetail.last_login) || '—'],
              ['Active sessions', `${showDetail.active_sessions || 0} / 2 (max)`],
              ['Status', showDetail.status || 'Active'],
            ].map(([l,v]) => (
              <div key={l} style={{ display:'flex',justifyContent:'space-between',padding:'5px 12px',borderBottom:'1px solid var(--border)',fontSize:11 }}>
                <span style={{ color:'var(--text-secondary)' }}>{l}</span>
                <span style={{ fontWeight:500 }}>{v}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {showReset && (
        <Modal title={`Reset password — ${showReset.name}`} onClose={() => setShowReset(null)}
          footer={<><button className="btn" onClick={() => setShowReset(null)}>Cancel</button><button className="btn btn-primary" onClick={resetPwd} disabled={saving}>{saving?'Updating…':'Set new password'}</button></>}>
          {err && <Alert type="danger">{err}</Alert>}
          <div style={{ fontSize:11,color:'var(--text-secondary)',marginBottom:10 }}>The user will need to use this password on their next login.</div>
          <FG label="New password" required hint="Min 8 characters — include uppercase, number, and symbol">
            <input type="password" value={form.new_password||''} onChange={e=>f('new_password',e.target.value)} />
          </FG>
        </Modal>
      )}
    </div>
  );
}
