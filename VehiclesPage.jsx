// src/pages/GlobalSearch.jsx — searches across every entity in VMO
import React, { useState, useCallback, useRef } from 'react';
import { api } from '../utils/api.js';
import { fmt, fmtDate, fmtDateTime, StatusBadge, DaysBadge, useData } from '../components/UI.jsx';

const ENTITY_TYPES = ['All','Requests','Drivers','Vehicles','Clients','Receivables','Reservations'];

const TYPE_ICON = {
  request:    'ti-file-invoice',
  driver:     'ti-id-badge',
  vehicle:    'ti-car',
  client:     'ti-building',
  receivable: 'ti-cash',
  reservation:'ti-calendar',
};

const TYPE_COLOR = {
  request:    { bg:'#1d3a5c', color:'#60a5fa' },
  driver:     { bg:'#1a3828', color:'#4ade80' },
  vehicle:    { bg:'#3b2a1a', color:'#f59e0b' },
  client:     { bg:'#2d1a3b', color:'#c084fc' },
  receivable: { bg:'#1a3535', color:'#2dd4bf' },
  reservation:{ bg:'#3b1a2b', color:'#f472b6' },
};

export default function GlobalSearch() {
  const [query, setQuery]         = useState('');
  const [filter, setFilter]       = useState('All');
  const [results, setResults]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const debounceRef = useRef(null);

  // Fetch all data sources in parallel
  const runSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults(null); setSearched(false); return; }
    setLoading(true);
    try {
      const [reqs, drivers, vehicles, clients, receivables, reservations] = await Promise.allSettled([
        api.getRequests('?limit=500'),
        api.getDrivers(),
        api.getVehicles(),
        api.getClients(),
        api.getReceivables(),
        api.getReservations(),
      ]);

      const ql = q.toLowerCase();
      const match = (obj) =>
        Object.values(obj).some(v => String(v||'').toLowerCase().includes(ql));

      const hits = [];

      // Requests
      (reqs.value||[]).filter(match).forEach(r => hits.push({
        type: 'request',
        id: r.id,
        title: `${r.ref_number} — ${r.description}`,
        sub1: `${r.category} · ${fmt(r.amount_to_pay)} · ${r.requester_name}`,
        sub2: `Status: ${r.status} · ${fmtDate(r.created_at)}`,
        badge: r.status,
        raw: r,
      }));

      // Drivers
      (drivers.value||[]).filter(match).forEach(d => hits.push({
        type: 'driver',
        id: d.id,
        title: d.full_name,
        sub1: `${d.plate} · ${d.depot} · ${d.bank_name} ${d.account_number}`,
        sub2: `Licence expiry: ${fmtDate(d.licence_expiry)} · ${d.status}`,
        badge: d.status,
        dateVal: d.licence_expiry,
        raw: d,
      }));

      // Vehicles
      (vehicles.value||[]).filter(match).forEach(v => hits.push({
        type: 'vehicle',
        id: v.id,
        title: `${v.plate} — ${v.make_model}`,
        sub1: `${v.category} · ${v.fuel_type} · ${v.depot}`,
        sub2: `Insurance: ${fmtDate(v.insurance_expiry)} · ${v.status}`,
        badge: v.status,
        raw: v,
      }));

      // Clients
      (clients.value||[]).filter(match).forEach(c => hits.push({
        type: 'client',
        id: c.id,
        title: c.company_name,
        sub1: `${c.contact_name||'—'} · ${c.phone||'—'} · ${c.email||'—'}`,
        sub2: `Industry: ${c.industry||'—'}`,
        badge: c.status || 'Active',
        raw: c,
      }));

      // Receivables
      (receivables.value||[]).filter(match).forEach(r => hits.push({
        type: 'receivable',
        id: r.id,
        title: `${r.ref_number||r.id} — ${r.client_name||r.company_name}`,
        sub1: `${r.service_description||'—'} · ${fmt(r.amount)}`,
        sub2: `Due: ${fmtDate(r.due_date)} · ${r.status}`,
        badge: r.status,
        raw: r,
      }));

      // Reservations
      (reservations.value||[]).filter(match).forEach(r => hits.push({
        type: 'reservation',
        id: r.id,
        title: `${r.ref_number||r.id} — ${r.client_name||'Continuation'}`,
        sub1: `Driver: ${r.driver_name} · Vehicle: ${r.plate}`,
        sub2: `${fmtDate(r.start_date)} → ${fmtDate(r.end_date)} · ${r.status}`,
        badge: r.status,
        raw: r,
      }));

      setResults(hits);
    } catch (e) {
      setResults([]);
    }
    setLoading(false);
    setSearched(true);
  }, []);

  const handleInput = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val), 350);
  };

  const visible = (results||[]).filter(r =>
    filter === 'All' || r.type === filter.toLowerCase().replace(/s$/, '')
  );

  // Count by type
  const counts = {};
  (results||[]).forEach(r => { counts[r.type] = (counts[r.type]||0) + 1; });

  return (
    <div className="page-content">
      <div>
        <h1 style={{ fontSize:18, fontWeight:700 }}>Global search</h1>
        <p style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2 }}>
          Search across every record in VMO — requests, drivers, vehicles, clients, receivables, reservations
        </p>
      </div>

      {/* Search input */}
      <div style={{ position:'relative' }}>
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          background:'var(--bg-surface)', border:'2px solid var(--accent)',
          borderRadius:12, padding:'0 16px', boxShadow:'0 0 0 4px rgba(59,130,246,0.12)'
        }}>
          <i className="ti ti-search" style={{ fontSize:18, color:'var(--accent)', flexShrink:0 }}></i>
          <input
            autoFocus
            value={query}
            onChange={e => handleInput(e.target.value)}
            placeholder="Type anything — ref number, name, plate, account, phone, email, description…"
            style={{
              flex:1, border:'none', background:'transparent', fontSize:14,
              color:'var(--text-primary)', padding:'14px 0', outline:'none'
            }}
          />
          {loading && <i className="ti ti-loader-2" style={{ fontSize:16, color:'var(--text-tertiary)', animation:'spin 1s linear infinite' }}></i>}
          {query && !loading && (
            <button onClick={() => { setQuery(''); setResults(null); setSearched(false); }}
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-tertiary)', padding:'0 4px' }}>
              <i className="ti ti-x" style={{ fontSize:16 }}></i>
            </button>
          )}
        </div>
      </div>

      {/* Type filter tabs */}
      {results !== null && (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {ENTITY_TYPES.map(t => {
            const typeKey = t.toLowerCase().replace(/s$/, '');
            const cnt = t === 'All' ? (results||[]).length : (counts[typeKey]||0);
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                style={{
                  fontSize:11, padding:'5px 12px', borderRadius:20,
                  border:`1px solid ${filter===t ? 'var(--accent)' : 'var(--border)'}`,
                  background: filter===t ? 'var(--accent)' : 'transparent',
                  color: filter===t ? '#fff' : cnt===0 ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                  cursor:'pointer', fontWeight: filter===t ? 600 : 400,
                  display:'flex', alignItems:'center', gap:5
                }}
              >
                {t}
                <span style={{
                  background: filter===t ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface)',
                  borderRadius:10, fontSize:10, padding:'1px 6px', fontWeight:700
                }}>{cnt}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Results */}
      {!searched && !query && (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-tertiary)' }}>
          <i className="ti ti-search" style={{ fontSize:48, display:'block', marginBottom:12, opacity:0.3 }}></i>
          <div style={{ fontSize:14, marginBottom:6 }}>Start typing to search VMO</div>
          <div style={{ fontSize:12, lineHeight:1.8 }}>
            Searches across: payment requests · driver profiles · vehicles · clients · receivables · pool reservations
          </div>
          <div style={{ marginTop:20, display:'flex', justifyContent:'center', gap:8, flexWrap:'wrap' }}>
            {['PR-001','APP131JC','George Obi','NBC','0226656835','Zenith Bank','Anambra'].map(example => (
              <button key={example}
                onClick={() => handleInput(example)}
                style={{ fontSize:11, padding:'4px 12px', borderRadius:20, border:'1px solid var(--border)', background:'transparent', color:'var(--text-secondary)', cursor:'pointer' }}>
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {searched && visible.length === 0 && (
        <div style={{ textAlign:'center', padding:'48px 20px', color:'var(--text-tertiary)' }}>
          <i className="ti ti-mood-empty" style={{ fontSize:40, display:'block', marginBottom:10, opacity:0.3 }}></i>
          <div style={{ fontSize:13 }}>No results for "<strong style={{ color:'var(--text-secondary)' }}>{query}</strong>"</div>
          <div style={{ fontSize:11, marginTop:6 }}>Try different keywords — plate number, ref number, name, phone, or amount</div>
        </div>
      )}

      {visible.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {visible.map((hit, i) => {
            const col = TYPE_COLOR[hit.type] || TYPE_COLOR.request;
            return (
              <div key={`${hit.type}-${hit.id}-${i}`}
                style={{
                  display:'flex', alignItems:'flex-start', gap:12, padding:'12px 14px',
                  background:'var(--bg-surface)', border:'1px solid var(--border)',
                  borderRadius:10, cursor:'pointer', transition:'border-color 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
              >
                {/* Type icon */}
                <div style={{
                  width:36, height:36, borderRadius:8, flexShrink:0,
                  background: col.bg, display:'flex', alignItems:'center', justifyContent:'center'
                }}>
                  <i className={`ti ${TYPE_ICON[hit.type]}`} style={{ fontSize:16, color: col.color }}></i>
                </div>

                {/* Content */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:700, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {hit.title}
                  </div>
                  <div style={{ fontSize:11, color:'var(--text-secondary)', marginBottom:2 }}>{hit.sub1}</div>
                  <div style={{ fontSize:10, color:'var(--text-tertiary)' }}>{hit.sub2}</div>
                </div>

                {/* Right side */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
                  <span style={{
                    fontSize:9, padding:'2px 7px', borderRadius:10, fontWeight:600,
                    background: col.bg, color: col.color
                  }}>{hit.type}</span>
                  <StatusBadge status={hit.badge} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
