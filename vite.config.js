// src/pages/VehiclesPage.jsx
import React, { useState } from 'react';
import { api } from '../utils/api.js';
import { fmtDate, DaysBadge, StatusBadge, Modal, FG, Alert, useData } from '../components/UI.jsx';

const CATS = ['Staff Bus','Saloon Car','SUV','Pool Car','FAW Truck','Coaster Bus','Tipper','Flatbed','Tanker','Others'];
const DEPOTS = ['Lagos','Benin','Onitsha','Abuja','Port Harcourt'];

export default function VehiclesPage() {
  const { data: vehicles, loading, reload } = useData(() => api.getVehicles());
  const { data: drivers } = useData(() => api.getDrivers());
  const [showAdd, setShowAdd] = useState(false);
  const [showUpload, setShowUpload] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [showBulk, setShowBulk] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [search, setSearch] = useState('');
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const docAlerts = (vehicles||[]).filter(v =>
    [v.insurance_expiry, v.roadworthy_expiry, v.hackney_expiry, v.registration_expiry].filter(Boolean).some(d =>
      Math.ceil((new Date(d) - new Date()) / 86400000) <= 30
    )
  );

  const submitVehicle = async () => {
    if (!form.plate || !form.make_model) { setErr('Plate and make/model required.'); return; }
    setSaving(true); setErr('');
    try {
      await api.createVehicle(form);
      setShowAdd(false); setForm({}); reload();
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  const submitDoc = async () => {
    if (!form.doc_type || !form.expiry_date) { setErr('Document type and expiry date required.'); return; }
    setSaving(true); setErr('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      await api.uploadVehicleDoc(showUpload.id, fd);
      setShowUpload(null); setForm({}); reload();
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  const filtered = (vehicles||[]).filter(v =>
    !search || [v.plate, v.make_model, v.depot, v.category, v.driver_name].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  const ds = (date) => {
    if (!date) return { label: '—', cls: 'badge-muted', blink: false };
    const d = Math.ceil((new Date(date) - new Date()) / 86400000);
    if (d < 0) return { label: 'Expired', cls: 'badge-danger badge-blink', blink: true };
    if (d <= 30) return { label: `${d}d`, cls: 'badge-warn badge-blink', blink: true };
    return { label: `${d}d`, cls: 'badge-ok', blink: false };
  };

  return (
    <div className="page-content">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize:18, fontWeight:700 }}>Vehicles & document management</h1>
          <p style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2 }}>Add vehicles, upload documents, track expiry. 30-day alerts flash across all dashboards.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-sm" onClick={() => setShowBulk(true)}><i className="ti ti-upload"></i> Bulk import</button>
          <button className="btn btn-sm" onClick={() => api.exportData('vehicles','xlsx')}><i className="ti ti-download"></i> Export</button>
          <button className="btn btn-primary" onClick={() => { setShowAdd(true); setForm({}); setErr(''); }}>
            <i className="ti ti-plus"></i> Add vehicle
          </button>
        </div>
      </div>

      {docAlerts.length > 0 && (
        <Alert type="warning" blink>
          <strong>{docAlerts.length} vehicles with documents expiring within 30 days</strong> — {docAlerts.map(v=>v.plate).join(', ')} — alerts remain until documents are renewed and uploaded
        </Alert>
      )}

      <div style={{ marginBottom:12 }}>
        <div className="search-bar" style={{ maxWidth:280 }}>
          <i className="ti ti-search"></i>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Plate, make, depot, driver…" />
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th style={{width:90}}>Plate</th>
              <th style={{width:130}}>Make / model</th>
              <th style={{width:80}}>Category</th>
              <th style={{width:60}}>Fuel</th>
              <th style={{width:68}}>Depot</th>
              <th style={{width:80}}>Insurance</th>
              <th style={{width:80}}>Roadworthy</th>
              <th style={{width:80}}>Hackney</th>
              <th style={{width:80}}>Registration</th>
              <th style={{width:68}}>Status</th>
              <th style={{width:36}}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => {
              const ins = ds(v.insurance_expiry);
              const rw = ds(v.roadworthy_expiry);
              const hk = ds(v.hackney_expiry);
              const rg = ds(v.registration_expiry);
              const hasAlert = [ins,rw,hk,rg].some(s=>s.blink);
              return (
                <tr key={v.id} className="clickable" onClick={() => setShowDetail(v)}>
                  <td style={{ fontFamily:'var(--mono)',fontSize:10,fontWeight:600 }}>{v.plate}</td>
                  <td style={{ fontSize:11 }}>{v.make_model}</td>
                  <td><span className="badge badge-muted" style={{fontSize:9}}>{v.category}</span></td>
                  <td><span className={`badge ${v.fuel_type==='Petrol'?'badge-info':'badge-muted'}`} style={{fontSize:9}}>{v.fuel_type}</span></td>
                  <td style={{ fontSize:10 }}>{v.depot}</td>
                  <td><span className={`badge ${ins.cls}`}>{ins.label}</span></td>
                  <td><span className={`badge ${rw.cls}`}>{rw.label}</span></td>
                  <td><span className={`badge ${hk.cls}`}>{hk.label}</span></td>
                  <td><span className={`badge ${rg.cls}`}>{rg.label}</span></td>
                  <td>
                    <StatusBadge status={v.status} />
                    {hasAlert && <i className="ti ti-bell badge-blink" style={{ color:'var(--warning)',fontSize:11,marginLeft:4 }}></i>}
                  </td>
                  <td>
                    <button className="btn btn-sm" onClick={e=>{e.stopPropagation();setShowUpload(v);setForm({});setErr('');}}>
                      <i className="ti ti-upload"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
            {!filtered.length && <tr><td colSpan={11} style={{ textAlign:'center',color:'var(--text-tertiary)',padding:20 }}>No vehicles found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add Vehicle Modal */}
      {showAdd && (
        <Modal title="Add vehicle" onClose={() => setShowAdd(false)} width={560}
          footer={<><button className="btn" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={submitVehicle} disabled={saving}>{saving?'Saving…':'Create vehicle'}</button></>}>
          {err && <Alert type="danger">{err}</Alert>}
          <div className="form-grid-2">
            <FG label="Plate number" required><input value={form.plate||''} onChange={e=>f('plate',e.target.value)} placeholder="e.g. APP131JC" /></FG>
            <FG label="Make & model" required><input value={form.make_model||''} onChange={e=>f('make_model',e.target.value)} placeholder="e.g. Toyota Land Cruiser" /></FG>
            <FG label="Category">
              <select value={form.category||'Others'} onChange={e=>f('category',e.target.value)}>
                {CATS.map(c=><option key={c}>{c}</option>)}
              </select>
            </FG>
            <FG label="Fuel type">
              <select value={form.fuel_type||'Diesel'} onChange={e=>f('fuel_type',e.target.value)}>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
              </select>
            </FG>
            <FG label="Depot">
              <select value={form.depot||'Lagos'} onChange={e=>f('depot',e.target.value)}>
                {DEPOTS.map(d=><option key={d}>{d}</option>)}
              </select>
            </FG>
            <FG label="Assign driver">
              <select value={form.driver_id||''} onChange={e=>f('driver_id',e.target.value)}>
                <option value="">None</option>
                {(drivers||[]).map(d=><option key={d.id} value={d.id}>{d.full_name} ({d.plate})</option>)}
              </select>
            </FG>
          </div>
          <div style={{ border:'1px solid var(--border)',borderRadius:8,padding:'10px 12px',marginTop:8 }}>
            <div style={{ fontSize:11,fontWeight:500,color:'var(--text-secondary)',marginBottom:8 }}>Document expiry dates — 30-day alerts auto-activate across all dashboards</div>
            <div className="form-grid-2">
              <FG label="Insurance expiry"><input type="date" value={form.insurance_expiry||''} onChange={e=>f('insurance_expiry',e.target.value)} /></FG>
              <FG label="Road worthiness expiry"><input type="date" value={form.roadworthy_expiry||''} onChange={e=>f('roadworthy_expiry',e.target.value)} /></FG>
              <FG label="Hackney permit expiry"><input type="date" value={form.hackney_expiry||''} onChange={e=>f('hackney_expiry',e.target.value)} /></FG>
              <FG label="Registration expiry"><input type="date" value={form.registration_expiry||''} onChange={e=>f('registration_expiry',e.target.value)} /></FG>
            </div>
          </div>
          <FG label="Attach documents (PDF/image, multiple)"><input type="file" accept=".pdf,image/*" multiple /></FG>
          <FG label="Engine number"><input value={form.engine_number||''} onChange={e=>f('engine_number',e.target.value)} /></FG>
          <FG label="Chassis number"><input value={form.chassis_number||''} onChange={e=>f('chassis_number',e.target.value)} /></FG>
        </Modal>
      )}

      {/* Upload Doc Modal */}
      {showUpload && (
        <Modal title={`Upload document — ${showUpload.plate}`} onClose={() => setShowUpload(null)}
          footer={<><button className="btn" onClick={() => setShowUpload(null)}>Cancel</button><button className="btn btn-primary" onClick={submitDoc} disabled={saving}>{saving?'Uploading…':'Save & update'}</button></>}>
          {err && <Alert type="danger">{err}</Alert>}
          <div style={{ fontSize:11,color:'var(--text-secondary)',marginBottom:10 }}>Expiry flag resets to new date across all dashboards instantly on save.</div>
          <div className="form-grid-2">
            <FG label="Document type" required>
              <select value={form.doc_type||''} onChange={e=>f('doc_type',e.target.value)}>
                <option value="">Select type…</option>
                {['Insurance','Road worthiness','Hackney permit','Registration','Other'].map(t=><option key={t}>{t}</option>)}
              </select>
            </FG>
            <FG label="New expiry date" required><input type="date" value={form.expiry_date||''} onChange={e=>f('expiry_date',e.target.value)} /></FG>
          </div>
          <FG label="File attachment" required><input type="file" accept=".pdf,image/*" onChange={e=>f('file',e.target.files[0])} /></FG>
        </Modal>
      )}

      {/* Vehicle Detail Modal */}
      {showDetail && (
        <Modal title={`${showDetail.plate} — ${showDetail.make_model}`} onClose={() => setShowDetail(null)}
          footer={<>
            <button className="btn" onClick={() => setShowDetail(null)}>Close</button>
            <button className="btn btn-primary" onClick={() => { setShowUpload(showDetail); setShowDetail(null); setForm({}); setErr(''); }}>Upload / update docs</button>
          </>}>
          <div style={{ border:'1px solid var(--border)',borderRadius:8,overflow:'hidden' }}>
            {[
              ['Category', showDetail.category],
              ['Fuel type', showDetail.fuel_type],
              ['Depot', showDetail.depot],
              ['Driver', showDetail.driver_name || '—'],
              ['Engine number', showDetail.engine_number || '—'],
              ['Chassis number', showDetail.chassis_number || '—'],
              ['Insurance expiry', fmtDate(showDetail.insurance_expiry)],
              ['Road worthiness expiry', fmtDate(showDetail.roadworthy_expiry)],
              ['Hackney permit expiry', fmtDate(showDetail.hackney_expiry)],
              ['Registration expiry', fmtDate(showDetail.registration_expiry)],
              ['Status', showDetail.status],
            ].map(([l,v]) => (
              <div key={l} style={{ display:'flex',justifyContent:'space-between',padding:'5px 12px',borderBottom:'1px solid var(--border)',fontSize:11 }}>
                <span style={{ color:'var(--text-secondary)' }}>{l}</span>
                <span style={{ fontWeight:500 }}>{v}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Bulk Import Modal */}
      {showBulk && (
        <Modal title="Bulk import vehicles" onClose={() => setShowBulk(false)}
          footer={<><button className="btn" onClick={() => setShowBulk(false)}>Cancel</button><button className="btn btn-primary" onClick={() => setShowBulk(false)}>Import</button></>}>
          <div style={{ fontSize:11,color:'var(--text-secondary)',marginBottom:10 }}>
            Upload Excel/CSV. Expected columns: Plate, Make, Model, Category, Fuel, Depot, Insurance Expiry, Roadworthiness Expiry, Hackney Expiry, Registration Expiry, Driver Name.
          </div>
          <FG label="File" required><input type="file" accept=".xlsx,.xls,.csv" /></FG>
          <FG label="Import mode">
            <select>
              <option value="append">Append — add to existing records</option>
              <option value="replace">Replace — clear and repopulate</option>
              <option value="update">Update — match plate and overwrite</option>
            </select>
          </FG>
        </Modal>
      )}
    </div>
  );
}
