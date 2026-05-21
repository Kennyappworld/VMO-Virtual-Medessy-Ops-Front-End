// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function LoginPage() {
  const { login }  = useAuth();
  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));

  const submit = async ev => {
    ev.preventDefault(); setError(''); setLoading(true);
    try { await login(form.email.trim(), form.password); }
    catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">VMO</div>
        <div className="login-sub">Virtual Medessy Operations Suite<br/>Medessy Enterprises Limited</div>
        {error && <div className="alert alert-danger" style={{marginBottom:16}}><i className="ti ti-alert-circle"></i>{error}</div>}
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="you@medessy.ng" required autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={set('password')} placeholder="••••••••••" required autoComplete="current-password" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{justifyContent:'center',padding:'10px'}}>
            {loading ? 'Signing in…' : 'Sign in to VMO'}
          </button>
        </form>
        <div style={{marginTop:24,fontSize:10,color:'var(--text-tertiary)',textAlign:'center',lineHeight:1.6}}>
          Secured by Faithgem Technologies · All activity is audited
        </div>
      </div>
    </div>
  );
}
