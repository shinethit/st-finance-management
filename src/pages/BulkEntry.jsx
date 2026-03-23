// src/pages/BulkEntry.jsx — Bulk Expense Entry with Auto-suggest + Price Compare
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCategories, useWallets } from '../hooks/useData';
import { useLang } from '../lib/LangContext';
import { supabase } from '../lib/supabase';

const today  = () => new Date().toISOString().slice(0, 10);
const fmt    = n => new Intl.NumberFormat('en-US').format(Math.abs(Number(n) || 0));
const nanoid = () => Math.random().toString(36).slice(2, 10);

function newRow(walletId, catId) {
  return {
    _id:        nanoid(),
    note:       '',
    category_id: catId || '',
    unit_price: '',
    qty:        1,
    total:      '',
    prevPrice:  null,
    prevDate:   null,
    suggestions: [],
    showSug:    false,
  };
}

// ── Auto-suggest dropdown ──────────────────────────────────────
function SuggestBox({ items, onPick }) {
  if (!items.length) return null;
  return (
    <div style={{
      position:'absolute', top:'100%', left:0, right:0, zIndex:99,
      background:'var(--bg2)', border:'1px solid var(--border)',
      borderRadius:10, overflow:'hidden',
      boxShadow:'0 8px 24px rgba(0,0,0,0.25)', marginTop:3,
    }}>
      {items.map((s, i) => (
        <div key={i}
          onMouseDown={e => { e.preventDefault(); onPick(s); }}
          style={{
            padding:'9px 14px', cursor:'pointer', fontSize:13,
            display:'flex', justifyContent:'space-between', alignItems:'center',
            borderBottom:'1px solid var(--border)',
          }}
          onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}
        >
          <span style={{ fontWeight:600 }}>{s.note}</span>
          <span style={{ color:'var(--text3)', fontSize:12 }}>K {fmt(s.amount)} · {s.date}</span>
        </div>
      ))}
    </div>
  );
}

// ── Single item row ────────────────────────────────────────────
function ItemRow({ row, categories, onChange, onRemove, onNoteChange, expenseCats }) {
  const inputRef = useRef(null);

  const setField = (k, v) => onChange({ ...row, [k]: v });

  const handleQtyOrPrice = (field, val) => {
    const updated = { ...row, [field]: val };
    const p = Number(updated.unit_price) || 0;
    const q = Number(updated.qty)        || 0;
    if (p && q) updated.total = String(p * q);
    else if (field === 'total') updated.total = val;
    onChange(updated);
  };

  const handleTotalDirect = val => {
    const updated = { ...row, total: val };
    const q = Number(updated.qty) || 1;
    if (val && q) updated.unit_price = String((Number(val) / q).toFixed(0));
    onChange(updated);
  };

  const priceDiff = row.prevPrice && row.total
    ? Number(row.total) - Number(row.prevPrice)
    : null;

  return (
    <div style={{
      background:'var(--bg2)', border:'1px solid var(--border)',
      borderRadius:14, padding:'14px 16px', marginBottom:10,
      position:'relative',
    }}>
      {/* Row header — remove button */}
      <button onClick={onRemove} style={{
        position:'absolute', top:10, right:10,
        background:'none', border:'none', cursor:'pointer',
        color:'var(--text3)', fontSize:18, lineHeight:1, padding:4,
      }}>✕</button>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
        {/* Item name + auto-suggest */}
        <div className="form-group" style={{ position:'relative', gridColumn:'1/-1' }}>
          <label className="form-label">ပစ္စည်းအမည်</label>
          <input
            ref={inputRef}
            className="form-input"
            placeholder="ဥပမာ — ဆန်, ဆီ, ဆေးဝါး…"
            value={row.note}
            onChange={e => onNoteChange(row._id, e.target.value)}
            onFocus={() => onChange({ ...row, showSug: true })}
            onBlur={() => setTimeout(() => onChange({ ...row, showSug: false }), 150)}
            autoComplete="off"
          />
          {row.showSug && <SuggestBox items={row.suggestions} onPick={s => {
            const updated = {
              ...row,
              note:       s.note,
              unit_price: String(s.amount),
              total:      String(s.amount),
              showSug:    false,
              suggestions:[],
            };
            onChange(updated);
          }} />}
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">အမျိုးအစား</label>
          <select className="form-select" value={row.category_id}
            onChange={e => setField('category_id', e.target.value)}>
            <option value="">— ရွေးပါ —</option>
            {expenseCats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>

        {/* Unit price */}
        <div className="form-group">
          <label className="form-label">တစ်ခုဈေး</label>
          <input className="form-input" type="number" placeholder="0"
            value={row.unit_price}
            onChange={e => handleQtyOrPrice('unit_price', e.target.value)} />
        </div>

        {/* Qty */}
        <div className="form-group">
          <label className="form-label">အရေအတွက်</label>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <button onClick={() => handleQtyOrPrice('qty', Math.max(1, Number(row.qty)-1))}
              style={{ width:32, height:36, borderRadius:8, border:'1px solid var(--border)', background:'var(--bg3)', cursor:'pointer', fontSize:18, color:'var(--text2)', flexShrink:0 }}>−</button>
            <input className="form-input" type="number" min="1"
              value={row.qty} style={{ textAlign:'center' }}
              onChange={e => handleQtyOrPrice('qty', e.target.value)} />
            <button onClick={() => handleQtyOrPrice('qty', Number(row.qty)+1)}
              style={{ width:32, height:36, borderRadius:8, border:'1px solid var(--border)', background:'var(--bg3)', cursor:'pointer', fontSize:18, color:'var(--text2)', flexShrink:0 }}>+</button>
          </div>
        </div>

        {/* Total */}
        <div className="form-group">
          <label className="form-label" style={{ display:'flex', justifyContent:'space-between' }}>
            <span>စုစုပေါင်း</span>
            {row.unit_price && row.qty > 1 && (
              <span style={{ color:'var(--text3)', fontSize:11, fontWeight:400 }}>
                K {fmt(row.unit_price)} × {row.qty}
              </span>
            )}
          </label>
          <input className="form-input" type="number" placeholder="0"
            value={row.total}
            onChange={e => handleTotalDirect(e.target.value)}
            style={{ fontWeight:700, fontSize:15 }} />
        </div>
      </div>

      {/* Price compare badge */}
      {row.prevPrice && row.total && (
        <div style={{
          display:'flex', alignItems:'center', gap:8, fontSize:12,
          padding:'7px 12px', borderRadius:8,
          background: priceDiff > 0 ? 'rgba(251,113,133,0.1)' : priceDiff < 0 ? 'rgba(52,211,153,0.1)' : 'var(--bg3)',
          border: `1px solid ${priceDiff > 0 ? 'rgba(251,113,133,0.25)' : priceDiff < 0 ? 'rgba(52,211,153,0.25)' : 'var(--border)'}`,
        }}>
          <span style={{ fontSize:16 }}>
            {priceDiff > 0 ? '📈' : priceDiff < 0 ? '📉' : '➡️'}
          </span>
          <span>
            <span style={{ color:'var(--text3)' }}>အရင်ဈေး ({row.prevDate}): </span>
            <span style={{ fontWeight:700 }}>K {fmt(row.prevPrice)}</span>
          </span>
          {priceDiff !== 0 && (
            <span style={{
              fontWeight:700, marginLeft:'auto',
              color: priceDiff > 0 ? 'var(--red)' : 'var(--green)',
            }}>
              {priceDiff > 0 ? '+' : ''}K {fmt(priceDiff)}
              {' '}({priceDiff > 0 ? '↑' : '↓'}{Math.abs((priceDiff / Number(row.prevPrice) * 100)).toFixed(1)}%)
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function BulkEntry() {
  const { data: categories } = useCategories();
  const { data: wallets }    = useWallets();
  const { t } = useLang();

  const expenseCats = categories.filter(c => c.type === 'expense');
  const defCat  = expenseCats.find(c => c.name === 'Food & Drink')?.id || expenseCats[0]?.id || '';
  const defWallet = wallets[0]?.id || '';

  const [date,      setDate]     = useState(today());
  const [walletId,  setWalletId] = useState('');
  const [rows,      setRows]     = useState([newRow('', defCat)]);
  const [saving,    setSaving]   = useState(false);
  const [saved,     setSaved]    = useState(false);
  const [history,   setHistory]  = useState([]);   // all past transactions for lookup

  // Load transaction history for suggest + price compare
  useEffect(() => {
    supabase
      .from('transactions')
      .select('note, amount, date, category_id')
      .eq('type', 'expense')
      .not('note', 'is', null)
      .neq('note', '')
      .order('date', { ascending: false })
      .limit(500)
      .then(({ data }) => setHistory(data || []));
  }, []);

  useEffect(() => {
    if (wallets.length && !walletId) setWalletId(wallets[0]?.id || '');
  }, [wallets]);

  // Update suggestions + prev price when note changes
  const handleNoteChange = useCallback((rowId, val) => {
    setRows(prev => prev.map(r => {
      if (r._id !== rowId) return r;

      const trimmed = val.trim().toLowerCase();
      let suggestions = [];
      let prevPrice   = null;
      let prevDate    = null;

      if (trimmed.length >= 1) {
        // Unique items matching the query
        const seen = new Set();
        suggestions = history
          .filter(h => h.note?.toLowerCase().includes(trimmed))
          .filter(h => { if (seen.has(h.note)) return false; seen.add(h.note); return true; })
          .slice(0, 6);

        // Exact match → get most recent price
        const exact = history.find(h => h.note?.toLowerCase() === trimmed);
        if (exact) {
          prevPrice = exact.amount;
          prevDate  = exact.date;
        }
      }

      return { ...r, note: val, suggestions, showSug: suggestions.length > 0, prevPrice, prevDate };
    }));
  }, [history]);

  const updateRow = (updated) =>
    setRows(prev => prev.map(r => r._id === updated._id ? updated : r));

  const addRow = () =>
    setRows(prev => {
      const last = prev[prev.length - 1];
      return [...prev, newRow(walletId, last?.category_id || defCat)];
    });

  const removeRow = (id) =>
    setRows(prev => prev.length > 1 ? prev.filter(r => r._id !== id) : prev);

  const grandTotal = rows.reduce((s, r) => s + (Number(r.total) || 0), 0);

  const handleSave = async () => {
    const valid = rows.filter(r => r.note && Number(r.total) > 0);
    if (!valid.length) return;
    setSaving(true);
    try {
      const inserts = valid.map(r => ({
        type:        'expense',
        sub_type:    'general',
        amount:      Number(r.total),
        note:        r.note,
        category_id: r.category_id || null,
        wallet_id:   walletId || null,
        date,
      }));
      await supabase.from('transactions').insert(inserts);
      setSaved(true);
      setRows([newRow(walletId, defCat)]);
      setTimeout(() => setSaved(false), 2500);
      // Refresh history
      const { data } = await supabase
        .from('transactions').select('note,amount,date,category_id')
        .eq('type','expense').not('note','is',null).neq('note','')
        .order('date',{ascending:false}).limit(500);
      setHistory(data || []);
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Bulk Entry</div>
          <div className="page-subtitle">ပစ္စည်းများ တစ်ခါတည်း ထည့်မည်</div>
        </div>
      </div>

      {/* Shared header — date + wallet */}
      <div className="card" style={{ marginBottom:16, display:'flex', gap:12, flexWrap:'wrap' }}>
        <div className="form-group" style={{ flex:1, minWidth:140, marginBottom:0 }}>
          <label className="form-label">နေ့ရက်</label>
          <input className="form-input" type="date" value={date}
            onChange={e => setDate(e.target.value)} />
        </div>
        {wallets.length > 0 && (
          <div className="form-group" style={{ flex:1, minWidth:140, marginBottom:0 }}>
            <label className="form-label">ပိုက်ဆံအိတ်</label>
            <select className="form-select" value={walletId}
              onChange={e => setWalletId(e.target.value)}>
              {wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Item rows */}
      {rows.map(row => (
        <ItemRow
          key={row._id}
          row={row}
          categories={categories}
          expenseCats={expenseCats}
          onChange={updateRow}
          onRemove={() => removeRow(row._id)}
          onNoteChange={handleNoteChange}
        />
      ))}

      {/* Add row button */}
      <button onClick={addRow}
        style={{
          width:'100%', padding:'11px', borderRadius:12, marginBottom:16,
          border:'2px dashed var(--border)', background:'transparent',
          cursor:'pointer', color:'var(--text3)', fontSize:13, fontWeight:600,
          fontFamily:'var(--font)', transition:'all .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text3)'; }}>
        + ပစ္စည်းတစ်ခုထပ်ထည့်မည်
      </button>

      {/* Summary + save */}
      <div className="card" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
        <div>
          <div style={{ fontSize:12, color:'var(--text3)', marginBottom:3 }}>
            ပစ္စည်း {rows.filter(r => r.note && Number(r.total)>0).length} မျိုး · စုစုပေါင်း
          </div>
          <div style={{ fontSize:26, fontWeight:800, letterSpacing:-.5, color:'var(--red)' }}>
            K {fmt(grandTotal)}
          </div>
        </div>
        <button className="btn btn-primary" style={{ padding:'12px 28px', fontSize:15 }}
          onClick={handleSave} disabled={saving || !rows.some(r => r.note && Number(r.total)>0)}>
          {saved ? '✓ သိမ်းပြီး' : saving ? 'သိမ်းနေသည်…' : 'အားလုံးသိမ်းမည်'}
        </button>
      </div>

      {saved && (
        <div style={{ marginTop:12, padding:'12px 16px', borderRadius:12,
          background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.25)',
          fontSize:13, color:'var(--green)', textAlign:'center' }}>
          ✓ ငွေစာရင်း {rows.filter(r => r.note).length > 0
            ? 'များ' : ''} သိမ်းဆည်းပြီးပါပြီ
        </div>
      )}
    </div>
  );
}
