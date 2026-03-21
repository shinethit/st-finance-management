// src/pages/Settings.jsx
import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useLang, LANGUAGES } from '../lib/LangContext';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { t, lang, setLang } = useLang();
  const [name, setName]         = useState(profile?.display_name || '');
  const [currency, setCurrency] = useState(profile?.currency || 'MMK');
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

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
          <div className="page-title">{t('settings')}</div>
          <div className="page-subtitle">{t('profile_prefs')}</div>
        </div>
      </div>

      {/* Language */}
      <Section title={t('language')}>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {LANGUAGES.map(l => (
            <button key={l.code}
              onClick={() => setLang(l.code)}
              style={{
                display:'flex', alignItems:'center', gap:8,
                padding:'10px 18px', borderRadius:12, cursor:'pointer',
                border: lang===l.code ? '2px solid var(--accent)' : '2px solid var(--border)',
                background: lang===l.code ? 'rgba(255,107,53,0.10)' : 'var(--bg3)',
                fontFamily:'var(--font)', fontSize:14,
                fontWeight: lang===l.code ? 700 : 500,
                color: lang===l.code ? 'var(--accent)' : 'var(--text2)',
                transition:'all .15s',
              }}>
              <span style={{ fontSize:20 }}>{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Profile */}
      <Section title={t('profile')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">{t('display_name')}</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('default_currency')}</label>
            <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="MMK">MMK — Myanmar Kyat</option>
              <option value="USD">USD — US Dollar</option>
              <option value="SGD">SGD — Singapore Dollar</option>
              <option value="THB">THB — Thai Baht</option>
              <option value="CNY">CNY — Chinese Yuan</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('email')}</label>
            <input className="form-input" value={user?.email} disabled style={{ opacity: 0.5 }} />
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saved ? t('saved') : saving ? t('saving') : t('save_profile')}
          </button>
        </div>
      </Section>

      <Section title={t('account')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            {t('account_security')}
          </div>
          <button className="btn btn-danger" onClick={signOut} style={{ alignSelf: 'flex-start' }}>
            {t('sign_out')}
          </button>
        </div>
      </Section>

      <Section title={t('about')}>
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
          <div>Shine Thit v3 — {t('app_tagline')}</div>
          <div style={{ color: 'var(--text3)', marginTop: 4 }}>Supabase · React · Vercel · Free</div>
        </div>
      </Section>
    </div>
  );
}
