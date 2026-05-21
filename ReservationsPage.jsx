// src/pages/DriversPage.jsx
import React, { useState } from 'react';
import { api } from '../utils/api.js';
import { fmt, fmtDate, DaysBadge, StatusBadge, Modal, FG, Alert, useData } from '../components/UI.jsx';

const BANKS = ['Opay','GTBank','Zenith Bank','Access Bank','UBA','FirstBank','Union Bank','Moniepoint','Wema Bank','Stanbic IBTC','Polaris Bank'];
const DEPOTS = ['Lagos','Benin','Onitsha','Abuja','Port Harcourt'];

export default function DriversPage() {
  const { data: drivers, loading, reload } = useData(() => api.getDrivers());
  const { data: users } = useData(() => api.getUsers());
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [showRenew, setShowRenew] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [search, setSearch] = useState('');
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const managers = (users||[]).filter(u => ['hr_manager','driver_manager','operations_manager'].includes(u.role));

  const submitDriver = async () => {
    if (!form.full_name || !form.plate || !form.licence_expiry || !form.bank_name || !form.account_number) {
      setErr('Fill all required fields.'); return;
    }
    setSaving(true); setErr('');
    try {
      await api.createDriver(form);
      setShowAdd(false); setForm({}); reload();
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  const submitRenew = async () => {
    if (!form.new_expiry) { setErr('New expiry date required.'); return; }
    setSaving(true); setErr('');
    try {
      await api.renewLicence(showRenew.id, { licence_expiry: form.new_expiry, licence_number: form.licence_number });
      setShowRenew(null); setForm({}); reload();
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  const deleteDriver = async (id) => {
    if (!confirm('Soft-delete this driver? Data is retained. Profile will be marked inactive.')) return;
    try { await api.deleteDriver(id); reload(); setShowDetail(null); } catch (e) { alert(e.message); }
  };

  const filtered = (drivers||[]).filter(d =>
    !search || [d.full_name, d.plate, d.depot, d.licence_number, d.bank_name, d.account_number].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div className="page-content">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize:18,fontWeight:700 }}>Driver registry</h1>
          <p style={{ fontSize:11,color:'var(--text-secondary)',marginTop:2 }}>Full profiles with bank accounts, licence tracking, trip history, manager assignments</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-sm" onClick={() => api.exportData('drivers','xlsx')}><i className="ti ti-download"></i> Export</button>
          <button className="btn btn-primary" onClick={() => { setShowAdd(true); setForm({}); setErr(''); }}>
            <i className="ti ti-plus"></i> Add driver
          </button>
        </div>
      </div>

      <div className="search-bar" style={{ maxWidth:280,marginBottom:12 }}>
        <i className="ti ti-search"></i>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, plate, licence, bank…" />
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th style={{width:110}}>Name</th>
              <th style={{width:90}}>Plate</th>
              <th style={{width:78}}>Depot</th>
              <th style={{width:100}}>Licence expiry</th>
              <th style={{width:110}}>Bank / Account</th>
              <th style={{width:70}}>Manager</th>
              <th style={{width:60}}>Trips</th>
              <th style={{width:60}}>Status</th>
              <th style={{width:36}}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} className="clickable" onClick={() => setShowDetail(d)}>
                <td style={{ fontWeight:500 }}>{d.full_name}</td>
                <td style={{ fontFamily:'var(--mono)',fontSize:10 }}>{d.plate}</td>
                <td style={{ fontSize:10 }}>{d.depot}</td>
                <td><DaysBadge date={d.licence_expiry} /></td>
                <td style={{ fontFamily:'var(--mono)',fontSize:10 }}>{d.account_number} {d.bank_name}</td>
                <td style={{ fontSize:10,color:'var(--text-secondary)' }}>{d.manager_name || '—'}</td>
                <td style={{ fontWeight:500 }}>{d.trip_count || 0}</td>
                <td><StatusBadge status={d.status || 'Active'} /></td>
                <td><button className="btn btn-sm" onClick={e=>{e.stopPropagation();setShowDetail(d)}}>View</button></td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={9} style={{ textAlign:'center',color:'var(--text-tertiary)',padding:20 }}>No drivers found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add Driver Modal */}
      {showAdd && (
        <Modal title="Add new driver" onClose={() => setShowAdd(false)} width={560}
          footer={<><button className="btn" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={submitDriver} disabled={saving}>{saving?'Saving…':'Create driver profile'}</button></>}>
          {err && <Alert type="danger">{err}</Alert>}
          <div className="form-grid-2">
            <FG label="Full name" required><input value={form.full_name||''} onChange={e=>f('full_name',e.target.value)} placeholder="e.g. John Paul Uche" /></FG>
            <FG label="Email"><input type="email" value={form.email||''} onChange={e=>f('email',e.target.value)} placeholder="driver@email.com" /></FG>
            <FG label="Phone"><input value={form.phone||''} onChange={e=>f('phone',e.target.value)} placeholder="+234…" /></FG>
            <FG label="Assigned vehicle plate" required><input value={form.plate||''} onChange={e=>f('plate',e.target.value)} placeholder="e.g. APP131JC" /></FG>
            <FG label="Depot" required>
              <select value={form.depot||'Lagos'} onChange={e=>f('depot',e.target.value)}>
                {DEPOTS.map(d=><option key={d}>{d}</option>)}
              </select>
            </FG>
            <FG label="Date hired"><input type="date" value={form.date_hired||''} onChange={e=>f('date_hired',e.target.value)} /></FG>
            <FG label="Licence number"><input value={form.licence_number||''} onChange={e=>f('licence_number',e.target.value)} /></FG>
            <FG label="Licence expiry" required><input type="date" value={form.licence_expiry||''} onChange={e=>f('licence_expiry',e.target.value)} /></FG>
          </div>
          <div style={{ border:'1px solid var(--border)',borderRadius:8,padding:'10px 12px',marginTop:8 }}>
            <div style={{ fontSize:11,fontWeight:500,color:'var(--text-secondary)',marginBottom:8 }}>Bank account (auto-pools on dispatch/accommodation requests)</div>
            <div className="form-grid-2">
              <FG label="Bank name" required>
                <select value={form.bank_name||''} onChange={e=>f('bank_name',e.target.value)}>
                  <option value="">Select bank…</option>
                  {BANKS.map(b=><option key={b}>{b}</option>)}
                </select>
              </FG>
              <FG label="Account number" required><input value={form.account_number||''} onChange={e=>f('account_number',e.target.value)} placeholder="e.g. 7082428223" /></FG>
            </div>
            <FG label="Account name"><input value={form.account_name||''} onChange={e=>f('account_name',e.target.value)} placeholder="e.g. John Paul Uche" /></FG>
          </div>
          <FG label="Assigned manager" hint="Optional — for driver_manager role assignments">
            <select value={form.manager_id||''} onChange={e=>f('manager_id',e.target.value)}>
              <option value="">None (default HR management)</option>
              {managers.map(m=><option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
            </select>
          </FG>
          <FG label="Photo / ID upload"><input type="file" accept="image/*,.pdf" /></FG>
        </Modal>
      )}

      {/* Driver Detail Modal */}
      {showDetail && (
        <Modal title={showDetail.full_name} onClose={() => setShowDetail(null)} width={520}
          footer={<>
            <button className="btn" onClick={() => setShowDetail(null)}>Close</button>
            <button className="btn btn-primary" onClick={() => { setShowRenew(showDetail); setShowDetail(null); setForm({}); setErr(''); }}>Renew licence</button>
            <button className="btn btn-danger" onClick={() => deleteDriver(showDetail.id)}>Delete driver</button>
          </>}>
          <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:14 }}>
            <div style={{ width:44,height:44,borderRadius:'50%',background:'var(--bg-secondary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700 }}>
              {showDetail.full_name.split(' ').map(w=>w[0]).join('').slice(0,2)}
            </div>
            <div>
              <div style={{ fontWeight:700,fontSize:14 }}>{showDetail.full_name}</div>
              <div style={{ fontSize:11,color:'var(--text-secondary)' }}>{showDetail.plate} · {showDetail.depot} · {showDetail.email}</div>
            </div>
          </div>
          <div style={{ border:'1px solid var(--border)',borderRadius:8,overflow:'hidden' }}>
            {[
              ['Bank', showDetail.bank_name],
              ['Account number', showDetail.account_number],
              ['Account name', showDetail.account_name || '—'],
              ['Licence expiry', fmtDate(showDetail.licence_expiry)],
              ['Manager', showDetail.manager_name || 'HR (default)'],
              ['Total trips', showDetail.trip_count || 0],
              ['Total allowances', fmt(showDetail.total_allowances || 0)],
              ['Total fuel drawn', fmt(showDetail.total_fuel_value || 0)],
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

      {/* Renew Licence Modal */}
      {showRenew && (
        <Modal title={`Renew licence — ${showRenew.full_name}`} onClose={() => setShowRenew(null)}
          footer={<><button className="btn" onClick={() => setShowRenew(null)}>Cancel</button><button className="btn btn-primary" onClick={submitRenew} disabled={saving}>{saving?'Updating…':'Update & clear flag'}</button></>}>
          {err && <Alert type="danger">{err}</Alert>}
          <div style={{ fontSize:11,color:'var(--text-secondary)',marginBottom:10 }}>
            Current expiry: <strong>{fmtDate(showRenew.licence_expiry)}</strong> — <DaysBadge date={showRenew.licence_expiry} />
            <br />Updating instantly clears the flag on Admin, HR, and driver dashboards.
          </div>
          <FG label="New expiry date" required><input type="date" value={form.new_expiry||''} onChange={e=>f('new_expiry',e.target.value)} /></FG>
          <FG label="New licence number (if changed)"><input value={form.licence_number||''} onChange={e=>f('licence_number',e.target.value)} /></FG>
          <FG label="Upload scanned licence"><input type="file" accept="image/*,.pdf" /></FG>
        </Modal>
      )}
    </div>
  );
}
