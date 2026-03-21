// src/pages/Settings.jsx
import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useLang, LANGUAGES } from '../lib/LangContext';
import { useWalletManager } from '../hooks/useData';
import { supabase } from '../lib/supabase';
import Logo from '../lib/Logo';

const WALLET_ICONS   = ['💳','💰','🏦','💵','👛','🪙','💎','🏧','💴','💶'];
const WALLET_COLORS  = ['#7c6aff','#ff6b35','#3b82f6','#10b981','#f59e0b','#ec4899','#06b6d4','#8b5cf6'];

function WalletModal({ onClose, onSave, initial = {} }) {
  const { t } = useLang();
  const [form, setForm] = useState({
    name: '', icon: '💳', color: '#7c6aff', balance: '', currency: 'MMK', ...initial
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{initial.id ? t('edit') : t('add')} Wallet</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">Wallet {t('name')}</label>
            <input className="form-input" placeholder="e.g. KBZ, Cash, AYA" autoFocus
              value={form.name} onChange={e => set('name', e.target.value)} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-group">
              <label className="form-label">{t('icon')}</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {WALLET_ICONS.map(ic => (
                  <button key={ic} onClick={() => set('icon', ic)}
                    style={{ width:36, height:36, borderRadius:8, border:'none', cursor:'pointer', fontSize:18,
                      background: form.icon===ic ? 'var(--accent)' : 'var(--bg3)', transition:'all .1s' }}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('color')}</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {WALLET_COLORS.map(cl => (
                  <button key={cl} onClick={() => set('color', cl)}
                    style={{ width:28, height:28, borderRadius:'50%', cursor:'pointer',
                      border: form.color===cl ? '3px solid var(--text)' : '3px solid transparent',
                      background: cl }} />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-group">
              <label className="form-label">{t('amount')} (Initial Balance)</label>
              <input className="form-input" type="number" placeholder="0"
                value={form.balance} onChange={e => set('balance', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('default_currency')}</label>
              <select className="form-select" value={form.currency} onChange={e => set('currency', e.target.value)}>
                <option value="MMK">MMK</option>
                <option value="USD">USD</option>
                <option value="SGD">SGD</option>
                <option value="THB">THB</option>
                <option value="CNY">CNY</option>
              </select>
            </div>
          </div>

          {/* Preview */}
          <div style={{ padding:'12px 16px', borderRadius:12, background: form.color + '20',
            border: `1px solid ${form.color}44`, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:12, background: form.color + '30',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
              {form.icon}
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:14 }}>{form.name || 'Wallet Name'}</div>
              <div style={{ fontSize:12, color:'var(--text3)' }}>
                {form.currency} {Number(form.balance||0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
            <button className="btn btn-primary"
              onClick={() => { if (!form.name) return; onSave({ ...form, balance: Number(form.balance||0) }); onClose(); }}>
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── Adjust Balance Modal ──────────────────────────────────────
function AdjustModal({ wallet, onClose, onSave }) {
  const { t } = useLang();
  const [newBalance, setNewBalance] = useState(String(wallet.balance || 0));
  const [saving, setSaving]         = useState(false);
  const diff = Number(newBalance) - Number(wallet.balance || 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span style={{ marginRight:8 }}>{wallet.icon}</span>
            Adjust Balance
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">
          <div style={{ textAlign:'center', padding:'12px 0 20px' }}>
            <div style={{ fontSize:12, color:'var(--text3)', marginBottom:4 }}>Current Balance</div>
            <div style={{ fontSize:28, fontWeight:800, fontFamily:'var(--mono)' }}>
              {wallet.currency} {Number(wallet.balance||0).toLocaleString()}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">New Balance</label>
            <input className="form-input" type="number"
              value={newBalance}
              onChange={e => setNewBalance(e.target.value)}
              autoFocus
              style={{ fontSize:22, fontWeight:700, textAlign:'center' }} />
          </div>

          {newBalance !== '' && diff !== 0 && (
            <div style={{
              padding:'10px 14px', borderRadius:10, textAlign:'center',
              background: diff > 0 ? 'rgba(52,211,153,0.1)' : 'rgba(251,113,133,0.1)',
              color: diff > 0 ? 'var(--green)' : 'var(--red)',
              fontSize:14, fontWeight:600,
            }}>
              {diff > 0 ? '+' : ''}{wallet.currency} {diff.toLocaleString()}
              <span style={{ fontSize:12, fontWeight:400, color:'var(--text3)', marginLeft:8 }}>
                adjustment
              </span>
            </div>
          )}

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
            <button className="btn btn-primary" disabled={saving}
              onClick={async () => {
                if (newBalance === '') return;
                setSaving(true);
                await onSave({ ...wallet, balance: Number(newBalance) });
                onClose();
              }}>
              {saving ? 'Saving…' : 'Update Balance'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { t, lang, setLang } = useLang();
  const { data: wallets, save: saveWallet, del: delWallet } = useWalletManager();

  const [name,     setName]     = useState(profile?.display_name || '');
  const [currency, setCurrency] = useState(profile?.currency || 'MMK');
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [walletModal,  setWalletModal]  = useState(null);
  const [adjustModal,  setAdjustModal]  = useState(null);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('profiles').update({
      display_name: name, currency, updated_at: new Date().toISOString(),
    }).eq('id', user.id);
    await refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  const Section = ({ title, children, action }) => (
    <div className="card" style={{ marginBottom: 14 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div className="card-title" style={{ marginBottom:0 }}>{title}</div>
        {action}
      </div>
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

      {/* ── Language ── */}
      <Section title={t('language')}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 16px',
                borderRadius:12, cursor:'pointer',
                border: lang===l.code ? '2px solid var(--accent)' : '2px solid var(--border)',
                background: lang===l.code ? 'rgba(255,107,53,0.10)' : 'var(--bg3)',
                fontFamily:'var(--font)', fontSize:13,
                fontWeight: lang===l.code ? 700 : 500,
                color: lang===l.code ? 'var(--accent)' : 'var(--text2)',
                transition:'all .15s' }}>
              <span style={{ fontSize:18 }}>{l.flag}</span>{l.label}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Wallets ── */}
      <Section title={t('wallet') + 's'}
        action={
          <button className="btn btn-primary btn-sm" onClick={() => setWalletModal({})}>
            + {t('add')}
          </button>
        }>
        {wallets.length === 0 ? (
          <div style={{ textAlign:'center', color:'var(--text3)', padding:'20px 0', fontSize:13 }}>
            Wallet မရှိသေး
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {wallets.map(w => (
              <div key={w.id} style={{ display:'flex', alignItems:'center', gap:12,
                padding:'10px 12px', borderRadius:12, background:'var(--bg3)' }}>
                <div style={{ width:38, height:38, borderRadius:10,
                  background: w.color + '25', display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:20, flexShrink:0 }}>
                  {w.icon}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:14 }}>{w.name}</div>
                  <div style={{ fontSize:12, color:'var(--text3)' }}>
                    {w.currency} {Number(w.balance||0).toLocaleString()}
                  </div>
                </div>
                <div style={{ display:'flex', gap:4 }}>
                  <button className="btn btn-ghost btn-sm"
                    style={{ fontSize:11, color:'var(--accent)' }}
                    onClick={() => setAdjustModal(w)}>± Adjust</button>
                  <button className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => setWalletModal(w)}>✎</button>
                  <button className="btn btn-ghost btn-icon btn-sm"
                    style={{ color:'var(--red)' }}
                    onClick={() => { if (confirm('Delete wallet?')) delWallet(w.id); }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Profile ── */}
      <Section title={t('profile')}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
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
            <input className="form-input" value={user?.email} disabled style={{ opacity:0.5 }} />
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saved ? t('saved') : saving ? t('saving') : t('save_profile')}
          </button>
        </div>
      </Section>

      {/* ── Account ── */}
      <Section title={t('account')}>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ fontSize:13, color:'var(--text2)' }}>{t('account_security')}</div>
          <button className="btn btn-danger" onClick={signOut} style={{ alignSelf:'flex-start' }}>
            {t('sign_out')}
          </button>
        </div>
      </Section>

      {/* ── About ── */}
      <Section title={t('about')}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <Logo size={52} />
          <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.8 }}>
            <div style={{ fontWeight:700, fontSize:15 }}>Shine Thit v3</div>
            <div>{t('app_tagline')}</div>
            <div style={{ color:'var(--text3)', marginTop:4 }}>Supabase · React · Vercel · Free</div>
          </div>
        </div>
      </Section>

      {adjustModal !== null && (
        <AdjustModal
          wallet={adjustModal}
          onClose={() => setAdjustModal(null)}
          onSave={saveWallet}
        />
      )}
      {walletModal !== null && (
        <WalletModal
          onClose={() => setWalletModal(null)}
          onSave={saveWallet}
          initial={walletModal}
        />
      )}
    </div>
  );
}
