// src/pages/ClientsPage.jsx
import React, { useState } from 'react';
import { api } from '../utils/api.js';
import { fmt, fmtDate, StatusBadge, Modal, FG, Alert, useData } from '../components/UI.jsx';

export default function ClientsPage() {
  const { data: clients, loading, reload } = useData(() => api.getClients());
  const { data: receivables } = useData(() => api.getReceivables());
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [search, setSearch] = useState('');
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.company_name) { setErr('Company name required.'); return; }
    setSaving(true); setErr('');
    try { await api.createClient(form); setShowAdd(false); setForm({}); reload(); } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  const filtered = (clients||[]).filter(c =>
    !search || [c.company_name, c.contact_name, c.phone, c.email].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div className="page-content">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize:18,fontWeight:700 }}>Client registry</h1>
          <p style={{ fontSize:11,color:'var(--text-secondary)',marginTop:2 }}>All clients — created by Accounts, Operations, or Admin. Linked to receivables.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-sm" onClick={() => api.exportData('clients','xlsx')}><i className="ti ti-download"></i> Export</button>
          <button className="btn btn-primary" onClick={() => { setShowAdd(true); setForm({}); setErr(''); }}>
            <i className="ti ti-plus"></i> Add client
          </button>
        </div>
      </div>

      <div className="search-bar" style={{ maxWidth:280,marginBottom:12 }}>
        <i className="ti ti-search"></i>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Company, contact, phone…" />
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Company</th><th>Contact</th><th>Phone</th><th>Email</th><th>Industry</th><th>Outstanding</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const outstanding = (receivables||[]).filter(r=>r.client_id===c.id&&r.status!=='Received').reduce((a,r)=>a+Number(r.amount),0);
              return (
                <tr key={c.id} className="clickable" onClick={() => setShowDetail(c)}>
                  <td style={{ fontWeight:500 }}>{c.company_name}</td>
                  <td style={{ fontSize:11 }}>{c.contact_name || '—'}</td>
                  <td style={{ fontFamily:'var(--mono)',fontSize:10 }}>{c.phone || '—'}</td>
                  <td style={{ fontSize:10 }}>{c.email || '—'}</td>
                  <td style={{ fontSize:10 }}>{c.industry || '—'}</td>
                  <td style={{ fontWeight:500,color:outstanding>0?'var(--danger)':'inherit' }}>{outstanding > 0 ? fmt(outstanding) : '—'}</td>
                  <td><StatusBadge status={c.status || 'Active'} /></td>
                </tr>
              );
            })}
            {!filtered.length && <tr><td colSpan={7} style={{ textAlign:'center',color:'var(--text-tertiary)',padding:20 }}>No clients found</td></tr>}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title="Add new client" onClose={() => setShowAdd(false)}
          footer={<><button className="btn" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={submit} disabled={saving}>{saving?'Saving…':'Create client'}</button></>}>
          {err && <Alert type="danger">{err}</Alert>}
          <FG label="Company name" required><input value={form.company_name||''} onChange={e=>f('company_name',e.target.value)} /></FG>
          <div className="form-grid-2">
            <FG label="Contact name"><input value={form.contact_name||''} onChange={e=>f('contact_name',e.target.value)} /></FG>
            <FG label="Phone"><input value={form.phone||''} onChange={e=>f('phone',e.target.value)} /></FG>
            <FG label="Email"><input type="email" value={form.email||''} onChange={e=>f('email',e.target.value)} /></FG>
            <FG label="Industry"><input value={form.industry||''} onChange={e=>f('industry',e.target.value)} placeholder="e.g. FMCG, Logistics" /></FG>
          </div>
          <FG label="Address"><textarea value={form.address||''} onChange={e=>f('address',e.target.value)} rows={2} /></FG>
          <FG label="Notes"><textarea value={form.notes||''} onChange={e=>f('notes',e.target.value)} rows={2} /></FG>
        </Modal>
      )}

      {showDetail && (
        <Modal title={showDetail.company_name} onClose={() => setShowDetail(null)}
          footer={<button className="btn" onClick={() => setShowDetail(null)}>Close</button>}>
          <div style={{ border:'1px solid var(--border)',borderRadius:8,overflow:'hidden' }}>
            {[
              ['Company', showDetail.company_name],
              ['Contact', showDetail.contact_name || '—'],
              ['Phone', showDetail.phone || '—'],
              ['Email', showDetail.email || '—'],
              ['Industry', showDetail.industry || '—'],
              ['Address', showDetail.address || '—'],
              ['Total receivables', fmt((receivables||[]).filter(r=>r.client_id===showDetail.id).reduce((a,r)=>a+Number(r.amount),0))],
              ['Outstanding', fmt((receivables||[]).filter(r=>r.client_id===showDetail.id&&r.status!=='Received').reduce((a,r)=>a+Number(r.amount),0))],
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
    </div>
  );
}
