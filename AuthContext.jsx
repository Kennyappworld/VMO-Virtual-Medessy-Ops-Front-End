// src/components/UI.jsx — shared across all pages
import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';

// ── fmt helpers ──────────────────────────────────────────────
export const fmt = n => '₦' + Number(n||0).toLocaleString('en-NG');
export const fmtDate = d => d ? new Date(d).toLocaleDateString('en-NG') : '—';
export const fmtDateTime = d => d ? new Date(d).toLocaleString('en-NG') : '—';
export const daysTo = d => {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
};

export function DaysBadge({ date }) {
  const d = daysTo(date);
  if (d === null) return <span className="badge badge-muted">—</span>;
  if (d < 0)   return <span className="badge badge-danger badge-blink"><i className="ti ti-x" style={{fontSize:9}}></i> Expired</span>;
  if (d <= 7)  return <span className="badge badge-danger badge-blink"><i className="ti ti-bell" style={{fontSize:9}}></i> {d}d</span>;
  if (d <= 30) return <span className="badge badge-warn badge-blink"><i className="ti ti-bell" style={{fontSize:9}}></i> {d}d</span>;
  return <span className="badge badge-ok">{d}d</span>;
}

export function StatusBadge({ status }) {
  const map = {
    Paid:'ok', Approved:'info', Pending:'warn', Overdue:'danger', Declined:'danger',
    Duplicate_Flagged:'danger', Cancelled:'muted', Active:'ok', Confirmed:'ok',
    In_Transit:'info', Delivered:'ok', Received:'ok', Expected:'warn', Missed:'danger',
  };
  const cls = map[status] || 'muted';
  const blink = ['Overdue','Duplicate_Flagged','Missed'].includes(status);
  return <span className={`badge badge-${cls}${blink?' badge-blink':''}`}>{status?.replace(/_/g,' ')}</span>;
}

// ── Modal ────────────────────────────────────────────────────
export function Modal({ title, onClose, children, footer, width=520 }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: width }}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn btn-icon" onClick={onClose} aria-label="Close"><i className="ti ti-x"></i></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── FormGroup ────────────────────────────────────────────────
export function FG({ label, required, children, hint }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span className="req"> *</span>}</label>
      {children}
      {hint && <div style={{fontSize:10,color:'var(--text-tertiary)',marginTop:2}}>{hint}</div>}
    </div>
  );
}

// ── Alert banner ─────────────────────────────────────────────
export function Alert({ type='warning', children, blink }) {
  const icons = { danger:'ti-alert-circle', warning:'ti-alert-triangle', success:'ti-circle-check', info:'ti-info-circle' };
  return (
    <div className={`alert alert-${type}`}>
      <i className={`ti ${icons[type]}${blink?' badge-blink':''}`}></i>
      <span>{children}</span>
    </div>
  );
}

// ── Search + chips bar ───────────────────────────────────────
export function FilterBar({ search, onSearch, chips, activeChip, onChip, actions }) {
  return (
    <div className="flex items-center gap-2" style={{ flexWrap:'wrap' }}>
      {onSearch && (
        <div className="search-bar" style={{ flex:1, maxWidth:260 }}>
          <i className="ti ti-search"></i>
          <input value={search} onChange={e=>onSearch(e.target.value)} placeholder="Search all fields…" />
        </div>
      )}
      {chips && (
        <div className="chips">
          {chips.map(c => (
            <span key={c} className={`chip${activeChip===c?' active':''}`} onClick={()=>onChip(c)}>{c}</span>
          ))}
        </div>
      )}
      <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>{actions}</div>
    </div>
  );
}

// ── Timeline (request stages) ────────────────────────────────
export function RequestTimeline({ request }) {
  const stages = [
    { label: 'Submitted', sub: `${request.requester_name || 'Requester'} · ${fmtDateTime(request.created_at)}`, done: true },
    { label: 'Tagged approval', sub: `Any one of tagged approvers can approve to advance`, done: !!request.approved_by, active: !request.approved_by && request.status === 'Pending' },
    { label: 'Accounts processing', sub: request.approved_by ? `Approved by ${request.approver_name || request.approved_by}` : 'Waiting on approval', done: request.status === 'Paid', active: request.status === 'Approved' },
    { label: 'Payment confirmed & all parties notified', sub: request.paid_at ? fmtDateTime(request.paid_at) : 'Pending', done: request.status === 'Paid' },
  ];
  return (
    <div className="timeline">
      {stages.map((s, i) => (
        <div key={i} className="tl-step">
          <div className={`tl-dot${s.done?' done':s.active?' active':' wait'}`}>
            {s.done ? <i className="ti ti-check" style={{fontSize:11}}></i> : s.active ? '→' : '·'}
          </div>
          <div className="tl-content">
            <div className="tl-label">{s.label}</div>
            <div className="tl-sub">{s.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Confirm dialog ───────────────────────────────────────────
export function Confirm({ message, onConfirm, onCancel }) {
  return (
    <Modal title="Confirm action" onClose={onCancel}
      footer={<><button className="btn" onClick={onCancel}>Cancel</button><button className="btn btn-primary" onClick={onConfirm}>Confirm</button></>}>
      <p style={{fontSize:13}}>{message}</p>
    </Modal>
  );
}

// ── KPI card ─────────────────────────────────────────────────
export function KPI({ label, value, sub, color, onClick }) {
  return (
    <div className="kpi-card" onClick={onClick}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color: color || 'var(--text-primary)' }}>{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

// ── ExportBtn ────────────────────────────────────────────────
export function ExportBtn({ entity, query }) {
  const [loading, setLoading] = useState(false);
  const doExport = async (format) => {
    setLoading(true);
    try { await api.exportData(entity, format, query); }
    catch(e) { alert(e.message); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ display:'flex', gap:4 }}>
      <button className="btn btn-sm" onClick={() => doExport('xlsx')} disabled={loading}>
        <i className="ti ti-file-spreadsheet"></i> Excel
      </button>
      <button className="btn btn-sm" onClick={() => doExport('csv')} disabled={loading}>
        <i className="ti ti-file-text"></i> CSV
      </button>
    </div>
  );
}

// ── useData hook ─────────────────────────────────────────────
export function useData(fetcher, deps=[]) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setData(await fetcher()); }
    catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, deps);
  return { data, loading, error, reload: load };
}
