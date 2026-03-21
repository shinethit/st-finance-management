// src/pages/Transactions.jsx — Supabase version
import { useState, useMemo } from 'react';
import { useTransactions, useCategories, useWallets } from '../hooks/useData';

const fmt = n => new Intl.NumberFormat('en-US').format(Math.abs(Number(n) || 0));
const today = () => new Date().toISOString().slice(0, 10);

function TxModal({ onClose, onSave, categories, wallets, initial }) {
  const [form, setForm] = useState({
    type: 'expense', amount: '',
    category_id: '', wallet_id: wallets[0]?.id || '',
    note: '', date: today(),
    ...initial,
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const cats = categories.filter(c => c.type === form.type);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{initial?.id ? t('edit') : 'Add'} Transaction</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">
          <div className="type-toggle">
            <button className={`type-btn expense ${form.type === 'expense' ? 'active' : ''}`} onClick={() => set('type','expense')}>{t('expense')}</button>
            <button className={`type-btn income  ${form.type === 'income'  ? 'active' : ''}`} onClick={() => set('type','income')}>{t('income')}</button>
          </div>
          <div className="form-group">
            <label className="form-label">{t('amount')}</label>
            <input className="form-input" type="number" placeholder="0" value={form.amount}
              onChange={e => set('amount', e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">{t('category')}</label>
            <select className="form-select" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
              <option value="">— Select —</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          {wallets.length > 0 && (
            <div className="form-group">
              <label className="form-label">{t('wallet')}</label>
              <select className="form-select" value={form.wallet_id} onChange={e => set('wallet_id', e.target.value)}>
                {wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
              </select>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">{t('date')}</label>
            <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('note')}</label>
            <input className="form-input" type="text" placeholder="Optional…" value={form.note}
              onChange={e => set('note', e.target.value)} />
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
            <button className="btn btn-primary" onClick={() => {
              if (!form.amount || !form.date) return;
              onSave({ ...form, amount: Number(form.amount) });
              onClose();
            }}>{t('save')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Transactions() {
  const { t } = useLang();
  const { data: transactions, loading, save, del } = useTransactions();
  const { data: categories } = useCategories();
  const { data: wallets }    = useWallets();
  const [modal, setModal]    = useState(null);
  const [filter, setFilter]  = useState('all');
  const [search, setSearch]  = useState('');

  const filtered = useMemo(() => {
    let list = transactions;
    if (filter !== 'all') list = list.filter(t => t.type === filter);
    if (search) list = list.filter(t =>
      (t.note || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.category?.name || '').toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [transactions, filter, search]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(tx => { const d = tx.date || 'Unknown'; if (!g[d]) g[d] = []; g[d].push(tx); });
    return Object.entries(g).sort(([a],[b]) => b.localeCompare(a));
  }, [filtered]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">{t('transactions')}</div>
          <div className="page-subtitle">{transactions.length} records</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>+ Add</button>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        <div className="type-toggle" style={{ flex:'none' }}>
          {['all','income','expense'].map(f => (
            <button key={f} className={`type-btn ${f} ${filter===f?'active':''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
        <input className="form-input" style={{ flex:1, minWidth:160 }}
          placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading
        ? <div className="empty-state"><div className="empty-state-text">Loading…</div></div>
        : grouped.length === 0
          ? <div className="empty-state"><div className="empty-state-icon">↕</div><div className="empty-state-text">{t('no_tx_found')}</div></div>
          : grouped.map(([date, txs]) => (
              <div key={date} style={{ marginBottom:20 }}>
                <div style={{ fontSize:12, color:'var(--text3)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:8 }}>{date}</div>
                <div className="tx-list">
                  {txs.map(tx => (
                    <div key={tx.id} className="tx-item" onClick={() => setModal(tx)}>
                      <div className="tx-icon" style={{
                        background: tx.category?.color
                          ? tx.category.color + '28'
                          : tx.type==='income'?'rgba(52,211,153,0.18)':'rgba(251,113,133,0.18)',
                        fontSize:20,
                      }}>
                        {tx.category?.icon || (tx.type==='income'?'↑':'↓')}
                      </div>
                      <div className="tx-info">
                        <div className="tx-name">{tx.note || tx.category?.name || 'Transaction'}</div>
                        <div className="tx-meta">{tx.category?.name || '—'}</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div className={`tx-amount ${tx.type}`}>{tx.type==='income'?'+':'-'}{fmt(tx.amount)}</div>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--red)' }}
                          onClick={e => { e.stopPropagation(); del(tx.id); }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
      }

      {modal !== null && (
        <TxModal onClose={() => setModal(null)} onSave={save} categories={categories} wallets={wallets} initial={modal} />
      )}
    </div>
  );
}
