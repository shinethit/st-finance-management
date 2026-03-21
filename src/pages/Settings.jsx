// src/pages/Settings.jsx
import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [name, setName]       = useState(profile?.display_name || '');
  const [currency, setCurrency] = useState(profile?.currency || 'MMK');
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('profiles').update({
      display_name: name,
      currency,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);
    await refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  const Section = ({ title, children }) => (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-title" style={{ marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Profile & preferences</div>
        </div>
      </div>

      <Section title="Profile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Default Currency</label>
            <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="MMK">MMK — Myanmar Kyat</option>
              <option value="USD">USD — US Dollar</option>
              <option value="SGD">SGD — Singapore Dollar</option>
              <option value="THB">THB — Thai Baht</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={user?.email} disabled style={{ opacity: 0.5 }} />
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </Section>

      <Section title="Account">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            Your data is stored securely in Supabase with Row Level Security — only you can access your records.
          </div>
          <button className="btn btn-danger" onClick={signOut} style={{ alignSelf: 'flex-start' }}>
            Sign Out
          </button>
        </div>
      </Section>

      <Section title="About">
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
          <div>Fintrack v2 — Personal Finance + Vehicle Tracker</div>
          <div style={{ color: 'var(--text3)', marginTop: 4 }}>Supabase · React · Vercel · Free</div>
        </div>
      </Section>
    </div>
  );
}
