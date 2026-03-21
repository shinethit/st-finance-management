// src/pages/Reports.jsx — Date-filtered Reports
import { useState, useMemo, useEffect } from 'react';
import { useLang } from '../lib/LangContext';
import { supabase } from '../lib/supabase';

const fmt    = n => new Intl.NumberFormat('en-US').format(Math.abs(Number(n)||0));
const fmtK   = n => { const v=Math.abs(Number(n)||0); return v>=1000000?`${(v/1e6).toFixed(1)}M`:v>=1000?`${(v/1000).toFixed(0)}K`:`${Math.round(v)}`; };
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Bar Chart component ───────────────────────────────────────
function BarChart({ data, colorInc='var(--green)', colorExp='var(--accent)' }) {
  const max = Math.max(...data.map(d=>Math.max(d.income||0,d.expense||0)),1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:100, marginTop:8 }}>
      {data.map((d,i) => {
        const iH = Math.max(Math.round(((d.income||0)/max)*88),0);
        const eH = Math.max(Math.round(((d.expense||0)/max)*88),0);
        const isLast = i===data.length-1;
        return (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
            <div style={{ display:'flex', gap:2, alignItems:'flex-end', height:90 }}>
              <div title={`Income: ${fmt(d.income)}`}
                style={{ width:10, height:iH||2, borderRadius:'3px 3px 0 0',
                  background: isLast?colorInc:colorInc+'77', transition:'height .3s' }}/>
              <div title={`Expense: ${fmt(d.expense)}`}
                style={{ width:10, height:eH||2, borderRadius:'3px 3px 0 0',
                  background: isLast?colorExp:colorExp+'77', transition:'height .3s' }}/>
            </div>
            <div style={{ fontSize:9, color: isLast?'var(--text2)':'var(--text3)',
              fontWeight: isLast?700:500, whiteSpace:'nowrap' }}>
              {d.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Category donut-style bar ──────────────────────────────────
function CatBar({ name, icon, amount, total, color }) {
  const pct = total>0 ? (amount/total*100) : 0;
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:16 }}>{icon}</span>
          <span style={{ fontSize:13, fontWeight:600 }}>{name}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:12, color:'var(--text3)' }}>{pct.toFixed(1)}%</span>
          <span style={{ fontSize:13, fontWeight:700, color:'var(--red)' }}>K {fmtK(amount)}</span>
        </div>
      </div>
      <div style={{ height:6, borderRadius:99, background:'var(--bg3)', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, borderRadius:99, background:color||'var(--accent)',
          transition:'width .5s ease' }}/>
      </div>
    </div>
  );
}

export default function Reports() {
  const { t } = useLang();

  // ── Date range mode: daily | monthly | yearly ────────────────
  const [mode,      setMode]     = useState('monthly'); // 'daily' | 'monthly' | 'yearly'
  const [selYear,   setSelYear]  = useState(new Date().getFullYear());
  const [selMonth,  setSelMonth] = useState(new Date().getMonth()); // 0-indexed
  const [selDate,   setSelDate]  = useState(new Date().toISOString().slice(0,10));

  const [txs,       setTxs]      = useState([]);
  const [cats,      setCats]     = useState([]);
  const [loading,   setLoading]  = useState(false);

  // ── Build date range ─────────────────────────────────────────
  const range = useMemo(() => {
    if (mode === 'daily') {
      return { from: selDate, to: selDate, label: selDate };
    }
    if (mode === 'monthly') {
      const from = `${selYear}-${String(selMonth+1).padStart(2,'0')}-01`;
      const to   = `${selYear}-${String(selMonth+1).padStart(2,'0')}-31`;
      return { from, to, label: `${MONTHS[selMonth]} ${selYear}` };
    }
    // yearly
    return { from:`${selYear}-01-01`, to:`${selYear}-12-31`, label:`${selYear}` };
  }, [mode, selYear, selMonth, selDate]);

  // ── Fetch on range change ─────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase.from('transactions')
        .select('type,amount,date,category_id,category:categories(name,icon,color)')
        .gte('date', range.from).lte('date', range.to)
        .order('date', { ascending: true }),
      supabase.from('categories').select('*'),
    ]).then(([{ data: txData }, { data: catData }]) => {
      setTxs(txData || []);
      setCats(catData || []);
      setLoading(false);
    });
  }, [range.from, range.to]);

  // ── Computed stats ────────────────────────────────────────────
  const totalIncome  = txs.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0);
  const totalExpense = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0);
  const net          = totalIncome - totalExpense;

  // Category breakdown
  const catBreakdown = useMemo(() => {
    const map = {};
    txs.filter(t=>t.type==='expense').forEach(t => {
      const k = t.category_id || '__none__';
      if (!map[k]) map[k] = { name: t.category?.name||'Uncategorized',
        icon: t.category?.icon||'📦', color: t.category?.color||'#7c6aff', total:0, count:0 };
      map[k].total += Number(t.amount);
      map[k].count += 1;
    });
    return Object.values(map).sort((a,b)=>b.total-a.total).slice(0,8);
  }, [txs]);

  // Chart data: monthly→ days, yearly→ months, daily→ single day
  const chartData = useMemo(() => {
    if (mode === 'daily') {
      const hours = Array.from({length:24},(_,h)=>({label:`${h}h`,income:0,expense:0}));
      txs.forEach(t=>{
        // no time data, just show totals
      });
      return [{ label: range.label, income: totalIncome, expense: totalExpense }];
    }
    if (mode === 'monthly') {
      const days = new Date(selYear, selMonth+1, 0).getDate();
      const arr  = Array.from({length:days},(_,i)=>({
        label: String(i+1), income:0, expense:0,
      }));
      txs.forEach(t=>{
        const day = parseInt(t.date.split('-')[2])-1;
        if (arr[day]) {
          if (t.type==='income')  arr[day].income  += Number(t.amount);
          if (t.type==='expense') arr[day].expense += Number(t.amount);
        }
      });
      // Show every 5th day label only
      return arr.map((d,i)=>({...d, label: (i+1)%5===0||i===0?d.label:''}));
    }
    // yearly — 12 months
    const arr = MONTHS.map(m=>({label:m,income:0,expense:0}));
    txs.forEach(t=>{
      const m = parseInt(t.date.split('-')[1])-1;
      if (t.type==='income')  arr[m].income  += Number(t.amount);
      if (t.type==='expense') arr[m].expense += Number(t.amount);
    });
    return arr;
  }, [txs, mode, selYear, selMonth, range.label, totalIncome, totalExpense]);

  const years = Array.from({length:5},(_,i)=>new Date().getFullYear()-i);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">{t('reports')}</div>
          <div className="page-subtitle">{range.label}</div>
        </div>
      </div>

      {/* ── Mode selector ── */}
      <div style={{ display:'flex', gap:0, background:'var(--bg2)', borderRadius:12,
        padding:3, marginBottom:16 }}>
        {[
          { id:'daily',   label:'ရက်' },
          { id:'monthly', label:'လ'  },
          { id:'yearly',  label:'နှစ်'},
        ].map(m=>(
          <button key={m.id} onClick={()=>setMode(m.id)}
            style={{ flex:1, padding:'8px 0', borderRadius:10, border:'none', cursor:'pointer',
              background: mode===m.id?'var(--accent)':'transparent',
              color: mode===m.id?'#fff':'var(--text3)',
              fontSize:13, fontWeight:700, fontFamily:'var(--font)', transition:'all .15s' }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Date controls ── */}
      <div className="card" style={{ marginBottom:16, padding:'12px 16px' }}>
        {mode === 'daily' && (
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">{t('date')}</label>
            <input className="form-input" type="date" value={selDate}
              onChange={e=>setSelDate(e.target.value)} />
          </div>
        )}
        {mode === 'monthly' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">နှစ်</label>
              <select className="form-select" value={selYear}
                onChange={e=>setSelYear(Number(e.target.value))}>
                {years.map(y=><option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">လ</label>
              <select className="form-select" value={selMonth}
                onChange={e=>setSelMonth(Number(e.target.value))}>
                {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
              </select>
            </div>
          </div>
        )}
        {mode === 'yearly' && (
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">နှစ်</label>
            <select className="form-select" value={selYear}
              onChange={e=>setSelYear(Number(e.target.value))}>
              {years.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:48, color:'var(--text3)' }}>Loading…</div>
      ) : (
        <>
          {/* ── Summary cards ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
            {[
              { label:t('income'),  val:totalIncome,  color:'var(--green)' },
              { label:t('expense'), val:totalExpense, color:'var(--red)'   },
              { label:t('net'),     val:Math.abs(net),color:net>=0?'var(--green)':'var(--red)' },
            ].map(s=>(
              <div key={s.label} className="card" style={{ padding:'12px', textAlign:'center' }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase',
                  letterSpacing:'.5px', color:'var(--text3)', marginBottom:6 }}>{s.label}</div>
                <div style={{ fontWeight:800, fontSize:15, color:s.color }}>
                  {s.label===t('net')&&net<0?'-':''}K {fmtK(s.val)}
                </div>
              </div>
            ))}
          </div>

          {/* ── Chart ── */}
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>
              {t('income_vs_expense')}
            </div>
            <div style={{ display:'flex', gap:14, fontSize:11, color:'var(--text3)', marginBottom:4 }}>
              <span style={{ display:'flex',alignItems:'center',gap:4 }}>
                <span style={{ width:8,height:8,borderRadius:2,background:'var(--green)',display:'inline-block' }}/>
                {t('income')}
              </span>
              <span style={{ display:'flex',alignItems:'center',gap:4 }}>
                <span style={{ width:8,height:8,borderRadius:2,background:'var(--accent)',display:'inline-block' }}/>
                {t('expense')}
              </span>
            </div>
            {txs.length === 0
              ? <div style={{ textAlign:'center', color:'var(--text3)', padding:'24px 0', fontSize:13 }}>
                  {t('no_data')}
                </div>
              : <BarChart data={chartData} />
            }
          </div>

          {/* ── Category breakdown ── */}
          {catBreakdown.length > 0 && (
            <div className="card" style={{ marginBottom:16 }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:16 }}>
                {t('spending_by_category')}
              </div>
              {catBreakdown.map((c,i)=>(
                <CatBar key={i} name={c.name} icon={c.icon}
                  amount={c.total} total={totalExpense} color={c.color} />
              ))}
            </div>
          )}

          {/* ── Daily detail (for monthly/yearly view — top days) ── */}
          {mode !== 'daily' && txs.length > 0 && (
            <div className="card">
              <div style={{ fontWeight:700, fontSize:13, marginBottom:14 }}>
                Transaction Summary
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'8px 0', borderBottom:'1px solid var(--border)', color:'var(--text3)' }}>
                <span>Total transactions</span>
                <span style={{ fontWeight:700, color:'var(--text)' }}>{txs.length}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'8px 0', borderBottom:'1px solid var(--border)', color:'var(--text3)' }}>
                <span>Average per transaction</span>
                <span style={{ fontWeight:700, color:'var(--text)' }}>
                  K {fmtK(txs.length ? totalExpense/txs.filter(t=>t.type==='expense').length : 0)}
                </span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'8px 0', color:'var(--text3)' }}>
                <span>Save rate</span>
                <span style={{ fontWeight:700, color: totalIncome>0?'var(--green)':'var(--text3)' }}>
                  {totalIncome > 0 ? Math.round(net/totalIncome*100) : 0}%
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
