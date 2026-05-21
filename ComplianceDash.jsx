// src/pages/AuditPage.jsx — Owner and real_admin only
import React, { useState } from 'react';
import { api } from '../utils/api.js';
import { fmtDateTime, StatusBadge, useData } from '../components/UI.jsx';

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const { data: audit, loading } = useData(() => api.getDashboard());

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div className="page-content">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize:18,fontWeight:700 }}>Audit ledger</h1>
          <p style={{ fontSize:11,color:'var(--text-secondary)',marginTop:2 }}>WORM (Write-Once Read-Many) — all creates, updates, deletes, logins. Immutable at DB level.</p>
        </div>
        <button className="btn btn-sm" onClick={() => api.exportData('audit','xlsx')}><i className="ti ti-download"></i> Export</button>
      </div>
      <div style={{ padding:14,background:'var(--bg-secondary)',borderRadius:8,fontSize:11,color:'var(--text-secondary)',marginBottom:4 }}>
        <i className="ti ti-shield-lock" style={{ marginRight:6 }}></i>
        This ledger is protected at database level. UPDATE and DELETE operations are blocked by DB rules. Every action — including logins and logouts — is permanently recorded here with actor identity and timestamp.
      </div>
      <div className="search-bar" style={{ maxWidth:280,marginBottom:12 }}>
        <i className="ti ti-search"></i>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Actor, action, entity, ref…" />
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr><th style={{width:100}}>Timestamp</th><th style={{width:100}}>Actor</th><th style={{width:80}}>Action</th><th style={{width:80}}>Entity</th><th>Detail</th><th style={{width:80}}>IP address</th></tr>
          </thead>
          <tbody>
            {[(audit||{}).auditLog||[]].flat().filter(e=>!search||JSON.stringify(e).toLowerCase().includes(search.toLowerCase())).map((e,i)=>(
              <tr key={i}>
                <td style={{ fontFamily:'var(--mono)',fontSize:9 }}>{fmtDateTime(e.created_at)}</td>
                <td style={{ fontSize:10,fontWeight:500 }}>{e.actor_name || 'System'}</td>
                <td><span className="badge badge-muted" style={{fontSize:9}}>{e.action}</span></td>
                <td style={{ fontSize:10 }}>{e.entity_type}</td>
                <td style={{ fontSize:10,color:'var(--text-secondary)' }}>{e.detail?.slice?.(0,60)}</td>
                <td style={{ fontFamily:'var(--mono)',fontSize:9 }}>{e.ip_address || '—'}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={6} style={{ textAlign:'center',color:'var(--text-tertiary)',padding:20,fontSize:11 }}>
                Full audit ledger loads from API. All actions from system start are permanently recorded.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
