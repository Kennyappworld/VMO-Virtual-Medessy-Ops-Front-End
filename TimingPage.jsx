// src/pages/FinancePage.jsx — Finance hub (balance sheet, receivables, forecasting)
import React, { useState } from 'react';
import { api } from '../utils/api.js';
import { fmt, fmtDate, StatusBadge, DaysBadge, Modal, FG, Alert, useData } from '../components/UI.jsx';

export default function FinancePage() {
  const { data: dash } = useData(() => api.getDashboard());
  const { data: receivables, reload } = useData(() => api.getReceivables());
  const [tab, setTab] = useState('balance');

  const confirmed = (receivables||[]).filter(r=>r.status==='Received').reduce((a,r)=>a+Number(r.amount),0);
  const outstanding = (receivables||[]).filter(r=>r.status!=='Received').reduce((a,r)=>a+Number(r.amount),0);
  const d = dash || {};

  const confirmReceipt = async (id) => {
    const ref = prompt('Bank reference number:');
    if (!ref) return;
    try { await api.confirmReceipt(id, { bank_reference: ref, received_date: new Date().toISOString().slice(0,10) }); reload(); } catch (e) { alert(e.message); }
  };

  return (
    <div className="page-content">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize:18,fontWeight:700 }}>Finance hub</h1>
          <p style={{ fontSize:11,color:'var(--text-secondary)',marginTop:2 }}>Balance sheet, receivables ledger, cash position, forecasting</p>
        </div>
        <button className="btn btn-sm" onClick={() => api.exportData('receivables','xlsx')}><i className="ti ti-download"></i> Export</button>
      </div>

      <div className="kpi-grid-4">
        {[
          ['Cash position (est.)', fmt(d.kpis?.recv_confirmed || 0), 'Confirmed receivables'],
          ['Outstanding receivables', fmt(outstanding), `${(receivables||[]).filter(r=>r.status!=='Received').length} pending`],
          ['Pending payables', fmt(d.kpis?.pending_payments || 0), 'Approved, not paid'],
          ['Net position', fmt((d.kpis?.recv_confirmed||0) - (d.kpis?.pending_payments||0)), 'Confirmed − Payables'],
        ].map(([l,v,s]) => (
          <div key={l} className="kpi-card"><div className="kpi-label">{l}</div><div className="kpi-value">{v}</div><div className="kpi-sub">{s}</div></div>
        ))}
      </div>

      <div className="tabs">
        {['balance','receivables','forecast'].map(t=>(
          <button key={t} className={`tab${tab===t?' active':''}`} onClick={()=>setTab(t)}>
            {t==='balance'?'Balance sheet':t==='receivables'?'Receivables':t==='forecast'?'Forecast':''}
          </button>
        ))}
      </div>

      {tab==='balance' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><span className="card-title">Assets</span></div>
            <div style={{ padding:'12px 14px' }}>
              <div style={{ fontSize:10,fontWeight:600,color:'var(--text-tertiary)',textTransform:'uppercase',letterSpacing:1,marginBottom:8 }}>Current assets</div>
              {[
                ['Cash & bank balance', fmt(d.kpis?.recv_confirmed || 0)],
                ['Receivables outstanding', fmt(outstanding)],
                ['Fleet (book value)', fmt(45000000)],
                ['Inventory value', fmt(1850000)],
              ].map(([l,v]) => (
                <div key={l} style={{ display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid var(--border)',fontSize:11 }}>
                  <span style={{ color:'var(--text-secondary)' }}>{l}</span>
                  <span style={{ fontWeight:500 }}>{v}</span>
                </div>
              ))}
              <div style={{ display:'flex',justifyContent:'space-between',padding:'8px 0',fontWeight:700,fontSize:12,marginTop:4 }}>
                <span>Total assets</span>
                <span style={{ color:'var(--success)' }}>{fmt((d.kpis?.recv_confirmed||0)+outstanding+45000000+1850000)}</span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Liabilities & obligations</span></div>
            <div style={{ padding:'12px 14px' }}>
              <div style={{ fontSize:10,fontWeight:600,color:'var(--text-tertiary)',textTransform:'uppercase',letterSpacing:1,marginBottom:8 }}>Current liabilities</div>
              {[
                ['Pending payables', fmt(d.kpis?.pending_payments || 0)],
                ['Credit obligations', fmt(d.kpis?.credit_obligations || 0)],
                ['Overdue payments', fmt(d.kpis?.overdue_amount || 0)],
              ].map(([l,v]) => (
                <div key={l} style={{ display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid var(--border)',fontSize:11 }}>
                  <span style={{ color:'var(--text-secondary)' }}>{l}</span>
                  <span style={{ fontWeight:500 }}>{v}</span>
                </div>
              ))}
              <div style={{ display:'flex',justifyContent:'space-between',padding:'8px 0',fontWeight:700,fontSize:12,marginTop:4 }}>
                <span>Net equity / surplus</span>
                <span style={{ color:'var(--success)' }}>{fmt(((d.kpis?.recv_confirmed||0)+outstanding) - ((d.kpis?.pending_payments||0)+(d.kpis?.credit_obligations||0)))}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab==='receivables' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Client receivables ledger</span>
          </div>
          <table className="table">
            <thead><tr><th>Invoice ref</th><th>Client</th><th>Service</th><th>Amount</th><th>Invoice date</th><th>Due date</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {(receivables||[]).map(r => (
                <tr key={r.id}>
                  <td style={{ fontFamily:'var(--mono)',fontSize:10 }}>{r.ref_number || r.id}</td>
                  <td style={{ fontWeight:500 }}>{r.client_name || r.company_name}</td>
                  <td style={{ fontSize:10 }}>{r.service_description || '—'}</td>
                  <td style={{ fontWeight:500 }}>{fmt(r.amount)}</td>
                  <td style={{ fontSize:10 }}>{fmtDate(r.invoice_date)}</td>
                  <td style={{ fontSize:10 }}>{fmtDate(r.due_date)}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{r.status !== 'Received' && <button className="btn btn-success btn-sm" onClick={() => confirmReceipt(r.id)}>Confirm ✓</button>}</td>
                </tr>
              ))}
              {!(receivables||[]).length && <tr><td colSpan={8} style={{ textAlign:'center',color:'var(--text-tertiary)',padding:20 }}>No receivables</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab==='forecast' && (
        <div className="card">
          <div className="card-header"><span className="card-title">30-day cash forecast</span></div>
          <div style={{ padding:20,textAlign:'center',color:'var(--text-secondary)',fontSize:13 }}>
            <i className="ti ti-chart-line" style={{ fontSize:32,display:'block',marginBottom:8 }}></i>
            Forecast charts generate from real payment data. Connect to a full data period to see projections.
          </div>
        </div>
      )}
    </div>
  );
}
