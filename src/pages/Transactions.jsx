// src/pages/Transactions.jsx
import { useState, useMemo } from 'react';
import { useLang } from '../lib/LangContext';
import { useTransactions, useCategories, useWallets } from '../hooks/useData';
import CategoryPicker from '../lib/CategoryPicker';

const fmt   = n => new Intl.NumberFormat('en-US').format(Math.abs(Number(n)||0));
const today = () => new Date().toISOString().slice(0,10);

// ── Category Picker Modal ─────────────────────────────────────
function CatPickerModal({ categories, value, type, onSelect, onClose }) {
  const { t } = useLang();
  const selected = categories.find(c => c.id === value);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}
        style={{ maxWidth: 480, height: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <div className="modal-title">Select {t('category')}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        {selected && (
          <div style={{
            margin: '0 0 12px', padding: '8px 14px',
            background: 'rgba(255,107,53,0.08)', borderRadius: 10,
            fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
            flexShrink: 0,
          }}>
            <span>{selected.icon}</span>
            <span style={{ fontWeight: 600 }}>{selected.name}</span>
            <span style={{ color: 'var(--accent)', marginLeft: 'auto' }}>✓</span>
          </div>
        )}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <CategoryPicker
            categories={categories}
            value={value}
            type={type}
            onChange={id => { onSelect(id); onClose(); }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Transaction Form Modal ────────────────────────────────────
function TxModal({ onClose, onSave, categories, wallets, initial }) {
  const { t } = useLang();
  const [form, setForm] = useState({
    type: 'expense', amount: '',
    category_id: '', wallet_id: wallets[0]?.id || '',
    note: '', date: today(),
    ...initial,
  });
  const [showCatPicker, setShowCatPicker] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const selCat = categories.find(c => c.id === form.category_id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {initial?.id ? t('edit_transaction') : t('add_transaction')}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">
          {/* Type toggle */}
          <div className="type-toggle">
            <button className={`type-btn expense ${form.type==='expense'?'active':''}`}
              onClick={() => set('type','expense')}>{t('expense')}</button>
            <button className={`type-btn income  ${form.type==='income' ?'active':''}`}
              onClick={() => set('type','income')} >{t('income')}</button>
          </div>

          {/* Amount — big and prominent */}
          <div className="form-group">
            <label className="form-label">{t('amount')}</label>
            <input className="form-input" type="number" placeholder="0"
              value={form.amount} onChange={e => set('amount', e.target.value)}
              autoFocus
              style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', letterSpacing: -0.5 }} />
          </div>

          {/* Category — tap to open picker */}
          <div className="form-group">
            <label className="form-label">{t('category')}</label>
            <button onClick={() => setShowCatPicker(true)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 12,
                border: '1px solid var(--border)', background: 'var(--bg3)',
                cursor: 'pointer', fontFamily: 'var(--font)',
              }}>
              {selCat ? (
                <>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: (selCat.color||'#7c6aff') + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>{selCat.icon}</div>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text)', textAlign: 'left' }}>
                    {selCat.name}
                  </span>
                  <span style={{ color: 'var(--text3)', fontSize: 12 }}>✎</span>
                </>
              ) : (
                <>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9, background: 'var(--bg4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  }}>📂</div>
                  <span style={{ flex: 1, fontSize: 14, color: 'var(--text3)', textAlign: 'left' }}>
                    — {t('category')} ရွေးပါ —
                  </span>
                  <span style={{ color: 'var(--text3)' }}>›</span>
                </>
              )}
            </button>
          </div>

          {/* Wallet */}
          {wallets.length > 0 && (
            <div className="form-group">
              <label className="form-label">{t('wallet')}</label>
              <select className="form-select" value={form.wallet_id}
                onChange={e => set('wallet_id', e.target.value)}>
                {wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
              </select>
            </div>
          )}

          {/* Date + Note side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">{t('date')}</label>
              <input className="form-input" type="date" value={form.date}
                onChange={e => set('date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('note')}</label>
              <input className="form-input" type="text" placeholder="…"
                value={form.note} onChange={e => set('note', e.target.value)} />
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
            <button className="btn btn-primary"
              onClick={() => {
                if (!form.amount || !form.date) return;
                onSave({ ...form, amount: Number(form.amount) });
                onClose();
              }}>
              {t('save')}
            </button>
          </div>
        </div>
      </div>

      {showCatPicker && (
        <CatPickerModal
          categories={categories}
          value={form.category_id}
          type={form.type}
          onSelect={id => set('category_id', id)}
          onClose={() => setShowCatPicker(false)}
        />
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Transactions() {
  const { t } = useLang();
  const { data: transactions, loading, save, del } = useTransactions();
  const { data: categories } = useCategories();
  const { data: wallets }    = useWallets();
  const [modal,  setModal]  = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = transactions;
    if (filter !== 'all') list = list.filter(tx => tx.type === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(tx =>
        tx.note?.toLowerCase().includes(q) ||
        tx.category?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [transactions, filter, search]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach(tx => {
      const d = tx.date;
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(tx);
    });
    return [...map.entries()];
  }, [filtered]);

  const fmtDateHeader = d => {
    const dt = new Date(d + 'T00:00:00');
    const now = new Date();
    const diff = Math.floor((now - dt) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return dt.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">{t('transactions')}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>
          + {t('add')}
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 16,
        background: 'var(--bg2)', padding: 4, borderRadius: 12, width: 'fit-content',
      }}>
        {[
          { id: 'all',     label: t('all') },
          { id: 'expense', label: t('expense') },
          { id: 'income',  label: t('income') },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            style={{
              padding: '6px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: filter === f.id ? 'var(--accent)' : 'transparent',
              color: filter === f.id ? '#fff' : 'var(--text3)',
              fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)',
              transition: 'all .15s',
            }}>{f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 14 }}>🔍</span>
        <input className="form-input"
          style={{ paddingLeft: 36 }}
          placeholder={t('search') + '…'}
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Transaction list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text3)' }}>Loading…</div>
      ) : grouped.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">↕</div>
          <div className="empty-state-text">{t('no_tx_found')}</div>
        </div>
      ) : (
        grouped.map(([date, txs]) => (
          <div key={date} style={{ marginBottom: 16 }}>
            {/* Date header with daily total */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 8, padding: '0 2px',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                {fmtDateHeader(date)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                <span style={{ color: 'var(--green)', marginRight: 8 }}>
                  +{fmt(txs.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0))}
                </span>
                <span style={{ color: 'var(--red)' }}>
                  -{fmt(txs.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0))}
                </span>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {txs.map((tx, i) => (
                <div key={tx.id} onClick={() => setModal(tx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', cursor: 'pointer',
                    borderBottom: i < txs.length-1 ? '1px solid var(--border)' : 'none',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Category icon */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: tx.type === 'income'
                      ? 'rgba(52,211,153,0.15)' : 'rgba(251,113,133,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>
                    {tx.category?.icon || (tx.type==='income' ? '↑' : '↓')}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.category?.name || 'Uncategorized'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.note || tx.wallet?.name || '—'}
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{
                    fontSize: 14, fontWeight: 700, flexShrink: 0,
                    color: tx.type === 'income' ? 'var(--green)' : 'var(--red)',
                  }}>
                    {tx.type === 'income' ? '+' : '-'}K {fmt(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {modal !== null && (
        <TxModal
          onClose={() => setModal(null)}
          onSave={item => save({ ...item, sub_type: item.sub_type || 'general' })}
          categories={categories}
          wallets={wallets}
          initial={modal}
        />
      )}
    </div>
  );
}
