// src/pages/AdminDash.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { fmt, fmtDateTime, DaysBadge, StatusBadge, KPI, Alert, ExportBtn, useData } from '../components/UI.jsx';

export default function AdminDash() {
  const { data: dash, loading, reload } = useData(() => api.getDashboard());
  const { data: requests } = useData(() => api.getRequests('?status=Pending'));
  const { data: overdue  } = useData(() => api.getRequests('?status=Overdue'));

  const qApprove = async (id) => {
    try { await api.approveRequest(id); reload(); } catch(e) { alert(e.message); }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;
  const d = dash || {};

  return (
    <div className="page-content">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize:18, fontWeight:700 }}>Admin dashboard</h1>
          <p style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2 }}>Full operational overview — all flags, approvals, and live position</p>
        </div>
        <div className="flex gap-2">
          <ExportBtn entity="requests" />
          <button className="btn btn-primary btn-sm" onClick={() => window.location.href = '/requests'}>
            <i className="ti ti-plus"></i> New request
          </button>
        </div>
      </div>

      {/* Alert banners */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {overdue?.length > 0 && (
          <Alert type="danger" blink>
            <strong>{overdue.length} overdue payment{overdue.length > 1 ? 's' : ''}</strong> — {overdue.map(r => `${r.ref_number} ${fmt(r.amount_to_pay)}`).join(' · ')} — flagged continuously until confirmed paid
          </Alert>
        )}
        {d.licAlerts?.length > 0 && (
          <Alert type="warning" blink>
            <strong>{d.licAlerts.length} driver licence{d.licAlerts.length > 1 ? 's' : ''} expiring within 30 days</strong> — {d.licAlerts.map(l => `${l.full_name} (${l.days_remaining}d)`).join(' · ')}
          </Alert>
        )}
        {d.docAlerts?.length > 0 && (
          <Alert type="warning" blink>
            <strong>{d.docAlerts.length} vehicle document{d.docAlerts.length > 1 ? 's' : ''} expiring within 30 days</strong> — {[...new Set(d.docAlerts.map(a => a.plate))].join(', ')}
          </Alert>
        )}
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <KPI label="Active fleet"        value={d.kpis?.active_vehicles || '—'} sub="Across all depots" />
        <KPI label="Pending approvals"   value={requests?.length || 0} sub="Need action" color="var(--warning)" onClick={() => window.location.href='/requests'} />
        <KPI label="Overdue payments"    value={overdue?.length || 0} sub="Flag until paid" color="var(--danger)" />
        <KPI label="Cash position"       value={fmt(d.kpis?.recv_confirmed || 0)} sub="Confirmed receivables" color="var(--success)" />
        <KPI label="Outstanding receivables" value={fmt(d.kpis?.recv_outstanding || 0)} sub="Not yet confirmed" />
        <KPI label="Pending payables"    value={fmt(d.kpis?.pending_payments || 0)} sub="Approved, not paid" />
        <KPI label="Active drivers"      value={d.kpis?.active_drivers || '—'} sub="All depots" />
        <KPI label="Delay alerts"        value={(d.licAlerts?.length || 0) + (d.docAlerts?.length || 0)} sub="Lic + doc expiry risks" color="var(--warning)" />
      </div>

      <div className="grid-2">
        {/* Pending approvals */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Pending — action required</span>
            <button className="btn btn-sm" onClick={() => window.location.href='/requests'}>View all ↗</button>
          </div>
          {requests?.slice(0,6).map(r => (
            <div key={r.id} style={{ display:'flex',alignItems:'center',gap:8,padding:'9px 14px',borderBottom:'1px solid var(--border)' }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:11,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                  {r.ref_number} — {r.description}
                </div>
                <div style={{ fontSize:10,color:'var(--text-secondary)' }}>
                  {r.requester_name} · {fmt(r.amount_to_pay)} · Hrs: {Number(r.hours_to_approve||0).toFixed(1)}h
                </div>
              </div>
              <StatusBadge status={r.status} />
              <button className="btn btn-success btn-sm" onClick={() => qApprove(r.id)}>Approve ✓</button>
            </div>
          ))}
          {!requests?.length && <div style={{ padding:20,textAlign:'center',color:'var(--text-tertiary)',fontSize:11 }}>No pending requests</div>}
        </div>

        {/* Payment delay tracker */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Payment pipeline — stall tracker</span>
            <span style={{ fontSize:10,color:'var(--text-secondary)' }}>
              Avg approve: {d.delayStats?.avg_approve || '—'}h · Avg pay: {d.delayStats?.avg_pay || '—'}h
            </span>
          </div>
          {requests?.concat(overdue||[]).slice(0,8).map(r => {
            const hrs = Number(r.hours_to_approve || 0);
            return (
              <div key={r.id} style={{ display:'flex',alignItems:'center',gap:8,padding:'7px 14px',borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontFamily:'var(--mono)',fontSize:10,color:'var(--text-tertiary)',width:68 }}>{r.ref_number}</span>
                <span style={{ flex:1,fontSize:11,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{r.description?.slice(0,38)}</span>
                <span style={{ fontSize:10,color:'var(--text-secondary)' }}>{r.requester_name}</span>
                <span className={`badge ${hrs > 24 ? 'badge-danger badge-blink' : hrs > 8 ? 'badge-warn' : 'badge-ok'}`}>
                  {hrs.toFixed(1)}h {hrs > 24 ? '⚠ STALLED' : hrs > 8 ? 'slow' : ''}
                </span>
                <StatusBadge status={r.status} />
              </div>
            );
          })}
          {!requests?.length && !overdue?.length && <div style={{ padding:20,textAlign:'center',color:'var(--text-tertiary)',fontSize:11 }}>No active requests</div>}
        </div>
      </div>

      <div className="grid-2">
        {/* Vehicle doc alerts */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><i className="ti ti-alert-triangle" style={{ color:'var(--warning)',marginRight:5 }}></i>Vehicle doc expiry — 30d alerts</span>
            <button className="btn btn-sm" onClick={() => window.location.href='/vehicles'}>Manage ↗</button>
          </div>
          {d.docAlerts?.length ? d.docAlerts.map((a,i) => (
            <div key={i} style={{ display:'flex',alignItems:'center',gap:10,padding:'7px 14px',borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontFamily:'var(--mono)',fontSize:10,fontWeight:600 }}>{a.plate}</span>
              <span style={{ flex:1,fontSize:10,color:'var(--text-secondary)' }}>{a.doc_type}</span>
              <DaysBadge date={a.expiry_date} />
            </div>
          )) : <div style={{ padding:16,textAlign:'center',color:'var(--text-tertiary)',fontSize:11 }}>No documents expiring within 30 days ✓</div>}
        </div>

        {/* Licence alerts */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><i className="ti ti-alert-triangle" style={{ color:'var(--warning)',marginRight:5 }}></i>Driver licence expiry — 30d alerts</span>
            <button className="btn btn-sm" onClick={() => window.location.href='/hr'}>HR view ↗</button>
          </div>
          {d.licAlerts?.length ? d.licAlerts.map((a,i) => (
            <div key={i} style={{ display:'flex',alignItems:'center',gap:10,padding:'7px 14px',borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:11,fontWeight:500 }}>{a.full_name}</span>
              <span style={{ fontFamily:'var(--mono)',fontSize:10,color:'var(--text-secondary)' }}>{a.plate}</span>
              <DaysBadge date={a.licence_expiry} />
            </div>
          )) : <div style={{ padding:16,textAlign:'center',color:'var(--text-tertiary)',fontSize:11 }}>No licences expiring within 30 days ✓</div>}
        </div>
      </div>
    </div>
  );
}
