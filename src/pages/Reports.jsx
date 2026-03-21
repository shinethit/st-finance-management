// src/pages/Reports.jsx — Full Analysis Dashboard
import { useState, useMemo, useEffect } from 'react';
import { useLang } from '../lib/LangContext';
import { supabase } from '../lib/supabase';

const fmt    = n => new Intl.NumberFormat('en-US').format(Math.abs(Number(n)||0));
const fmtK   = n => { const v=Math.abs(Number(n)||0); return v>=1e6?`${(v/1e6).toFixed(1)}M`:v>=1000?`${(v/1000).toFixed(0)}K`:`${Math.round(v)}`; };
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Mini bar ──────────────────────────────────────────────────
function Bar({ pct, color }) {
  return (
    <div style={{ height:6, borderRadius:99, background:'var(--bg3)', overflow:'hidden', flex:1 }}>
      <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, background:color||'var(--accent)',
        borderRadius:99, transition:'width .4s ease' }}/>
    </div>
  );
}

// ── Day chart ─────────────────────────────────────────────────
function DayChart({ data }) {
  const max = Math.max(...data.map(d=>Math.max(d.income,d.expense)),1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:80, overflowX:'auto',
      padding:'0 2px 4px' }}>
      {data.map((d,i)=>{
        const iH = Math.max(Math.round((d.income /max)*72),0);
        const eH = Math.max(Math.round((d.expense/max)*72),0);
        const hasData = d.income>0||d.expense>0;
        return (
          <div key={i} style={{ flexShrink:0, width:18, display:'flex',
            flexDirection:'column', alignItems:'center', gap:2 }}>
            <div style={{ display:'flex', gap:1, alignItems:'flex-end', height:72 }}>
              {d.income>0 && <div style={{ width:7, height:iH, borderRadius:'2px 2px 0 0',
                background:'var(--green)', opacity:.85 }}/>}
              {d.expense>0 && <div style={{ width:7, height:eH, borderRadius:'2px 2px 0 0',
                background:'var(--accent)', opacity:.85 }}/>}
              {!hasData && <div style={{ width:14, height:2, background:'var(--border)',
                borderRadius:1, marginBottom:0 }}/>}
            </div>
            <div style={{ fontSize:8, color:'var(--text3)',
              fontWeight:(i+1)%5===0||i===0?700:400 }}>
              {(i+1)%5===0||i===0 ? i+1 : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Reports() {
  const { t } = useLang();
  const [mode,     setMode]    = useState('monthly');
  const [selYear,  setSelYear] = useState(new Date().getFullYear());
  const [selMonth, setSelMonth]= useState(new Date().getMonth());
  const [selDate,  setSelDate] = useState(new Date().toISOString().slice(0,10));
  const [txs,      setTxs]     = useState([]);
  const [prevTxs,  setPrevTxs] = useState([]);
  const [loading,  setLoading] = useState(false);

  const years = Array.from({length:5},(_,i)=>new Date().getFullYear()-i);

  const range = useMemo(()=>{
    if (mode==='daily')
      return { from:selDate, to:selDate };
    if (mode==='monthly') {
      const m = String(selMonth+1).padStart(2,'0');
      return { from:`${selYear}-${m}-01`, to:`${selYear}-${m}-31` };
    }
    return { from:`${selYear}-01-01`, to:`${selYear}-12-31` };
  },[mode,selYear,selMonth,selDate]);

  const prevRange = useMemo(()=>{
    if (mode!=='monthly') return null;
    const d = new Date(selYear, selMonth-1, 1);
    const m = String(d.getMonth()+1).padStart(2,'0');
    const y = d.getFullYear();
    return { from:`${y}-${m}-01`, to:`${y}-${m}-31` };
  },[mode,selYear,selMonth]);

  useEffect(()=>{
    setLoading(true);
    const fetch1 = supabase.from('transactions')
      .select('type,amount,date,note,category_id,category:categories(name,icon,color)')
      .gte('date',range.from).lte('date',range.to);

    const fetch2 = prevRange
      ? supabase.from('transactions')
          .select('type,amount,category_id,category:categories(name)')
          .gte('date',prevRange.from).lte('date',prevRange.to)
      : Promise.resolve({ data:[] });

    Promise.all([fetch1, fetch2]).then(([r1,r2])=>{
      setTxs(r1.data||[]);
      setPrevTxs(r2.data||[]);
      setLoading(false);
    });
  },[range.from,range.to,prevRange?.from,prevRange?.to]);

  // ── Stats ─────────────────────────────────────────────────
  const income  = txs.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0);
  const expense = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0);
  const net     = income - expense;

  // Category breakdown
  const catMap = useMemo(()=>{
    const m = {};
    txs.filter(t=>t.type==='expense').forEach(t=>{
      const k = t.category_id||'__none__';
      if (!m[k]) m[k]={name:t.category?.name||'Uncategorized',
        icon:t.category?.icon||'📦',color:t.category?.color||'#7c6aff',total:0,count:0};
      m[k].total+=Number(t.amount); m[k].count+=1;
    });
    return Object.values(m).sort((a,b)=>b.total-a.total);
  },[txs]);

  // Top by amount (top 5)
  const topByAmount = catMap.slice(0,5);

  // Top by frequency (count)
  const topByCount = useMemo(()=>[...catMap].sort((a,b)=>b.count-a.count).slice(0,5),[catMap]);

  // Day-by-day (monthly mode)
  const dayData = useMemo(()=>{
    if (mode!=='monthly') return [];
    const days = new Date(selYear,selMonth+1,0).getDate();
    const arr  = Array.from({length:days},()=>({income:0,expense:0}));
    txs.forEach(t=>{
      const d = parseInt(t.date?.split('-')[2]||0)-1;
      if (d>=0&&d<arr.length) {
        if (t.type==='income')  arr[d].income  +=Number(t.amount);
        if (t.type==='expense') arr[d].expense +=Number(t.amount);
      }
    });
    return arr;
  },[txs,mode,selYear,selMonth]);

  // 30%+ change vs prev month
  const bigChanges = useMemo(()=>{
    if (!prevTxs.length&&!txs.length) return [];
    const cur={}, prev={};
    txs.filter(t=>t.type==='expense').forEach(t=>{
      const k=t.category_id||'__none__';
      if(!cur[k]) cur[k]={name:t.category?.name||'Uncategorized',icon:t.category?.icon||'📦',total:0};
      cur[k].total+=Number(t.amount);
    });
    prevTxs.filter(t=>t.type==='expense').forEach(t=>{
      const k=t.category_id||'__none__';
      if(!prev[k]) prev[k]={name:t.category?.name||'Uncategorized',icon:t.category?.icon||'📦',total:0};
      prev[k].total+=Number(t.amount);
    });
    const results=[];
    new Set([...Object.keys(cur),...Object.keys(prev)]).forEach(k=>{
      const c=cur[k]?.total||0, p=prev[k]?.total||0;
      if(p===0&&c===0) return;
      const pct = p>0 ? ((c-p)/p*100) : (c>0?100:0);
      if(Math.abs(pct)>=30) results.push({
        name:cur[k]?.name||prev[k]?.name||'Uncategorized',
        icon:cur[k]?.icon||prev[k]?.icon||'📦',
        cur:c, prev:p, pct: Math.round(pct),
      });
    });
    return results.sort((a,b)=>Math.abs(b.pct)-Math.abs(a.pct)).slice(0,8);
  },[txs,prevTxs]);

  const rangeLabel = mode==='daily'
    ? selDate
    : mode==='monthly'
    ? `${MONTHS[selMonth]} ${selYear}`
    : String(selYear);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">{t('reports')}</div>
          <div className="page-subtitle">{rangeLabel}</div>
        </div>
      </div>

      {/* Mode */}
      <div style={{ display:'flex', gap:0, background:'var(--bg2)', borderRadius:12,
        padding:3, marginBottom:14, width:'fit-content' }}>
        {[['daily','ရက်'],['monthly','လ'],['yearly','နှစ်']].map(([id,lbl])=>(
          <button key={id} onClick={()=>setMode(id)}
            style={{ padding:'7px 18px', borderRadius:10, border:'none', cursor:'pointer',
              background:mode===id?'var(--accent)':'transparent',
              color:mode===id?'#fff':'var(--text3)',
              fontSize:13, fontWeight:700, fontFamily:'var(--font)', transition:'all .15s' }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Date controls */}
      <div className="card" style={{ marginBottom:14, padding:'12px 14px' }}>
        {mode==='daily' && (
          <input className="form-input" type="date" value={selDate}
            onChange={e=>setSelDate(e.target.value)} />
        )}
        {mode==='monthly' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <select className="form-select" value={selYear}
              onChange={e=>setSelYear(Number(e.target.value))}>
              {years.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
            <select className="form-select" value={selMonth}
              onChange={e=>setSelMonth(Number(e.target.value))}>
              {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
            </select>
          </div>
        )}
        {mode==='yearly' && (
          <select className="form-select" value={selYear}
            onChange={e=>setSelYear(Number(e.target.value))}>
            {years.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:48, color:'var(--text3)' }}>Loading…</div>
      ) : (
        <>
          {/* ── Summary ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
            {[
              {label:t('income'),val:income,color:'var(--green)'},
              {label:t('expense'),val:expense,color:'var(--red)'},
              {label:t('net'),val:Math.abs(net),color:net>=0?'var(--green)':'var(--red)'},
            ].map(s=>(
              <div key={s.label} className="card" style={{ padding:'12px',textAlign:'center' }}>
                <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',
                  letterSpacing:'.5px',color:'var(--text3)',marginBottom:5}}>{s.label}</div>
                <div style={{fontWeight:800,fontSize:15,color:s.color}}>
                  {s.label===t('net')&&net<0?'-':''}K {fmtK(s.val)}
                </div>
              </div>
            ))}
          </div>

          {/* ── Day-by-day chart (monthly only) ── */}
          {mode==='monthly' && txs.length>0 && (
            <div className="card" style={{ marginBottom:14 }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>
                ရက်အလိုက် သုံးစွဲမှု
              </div>
              <div style={{ display:'flex', gap:12, fontSize:11, color:'var(--text3)', marginBottom:8 }}>
                <span style={{ display:'flex',alignItems:'center',gap:4 }}>
                  <span style={{width:8,height:8,borderRadius:2,background:'var(--green)',display:'inline-block'}}/>
                  Income
                </span>
                <span style={{ display:'flex',alignItems:'center',gap:4 }}>
                  <span style={{width:8,height:8,borderRadius:2,background:'var(--accent)',display:'inline-block'}}/>
                  Expense
                </span>
              </div>
              <DayChart data={dayData} />
            </div>
          )}

          {/* ── Category Analysis ── */}
          {catMap.length>0 && (
            <div className="card" style={{ marginBottom:14 }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:14 }}>
                Category အလိုက် Analysis
              </div>
              {catMap.slice(0,8).map((c,i)=>(
                <div key={i} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{fontSize:16}}>{c.icon}</span>
                      <span style={{fontSize:13,fontWeight:600}}>{c.name}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{fontSize:11,color:'var(--text3)'}}>{c.count} ကြိမ်</span>
                      <span style={{fontSize:13,fontWeight:700,color:'var(--red)'}}>K {fmtK(c.total)}</span>
                    </div>
                  </div>
                  <Bar pct={expense>0?c.total/expense*100:0} color={c.color||'var(--accent)'}/>
                  <div style={{fontSize:10,color:'var(--text3)',marginTop:2}}>
                    {expense>0?(c.total/expense*100).toFixed(1):0}% of total expense
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Top by Amount + Top by Count ── */}
          {txs.filter(t=>t.type==='expense').length>0 && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {/* Top by Amount */}
              <div className="card">
                <div style={{fontWeight:700,fontSize:12,marginBottom:12,color:'var(--red)'}}>
                  💰 ပမာဏ အများဆုံး
                </div>
                {topByAmount.map((c,i)=>(
                  <div key={i} style={{ display:'flex',alignItems:'center',gap:8,
                    marginBottom:8,padding:'6px 0',
                    borderBottom:i<topByAmount.length-1?'1px solid var(--border)':'none' }}>
                    <span style={{ fontSize:13, color:'var(--text3)', fontWeight:700, width:16 }}>
                      {i+1}
                    </span>
                    <span style={{fontSize:15}}>{c.icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,overflow:'hidden',
                        textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
                      <div style={{fontSize:11,color:'var(--red)',fontWeight:700}}>
                        K {fmtK(c.total)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top by Count */}
              <div className="card">
                <div style={{fontWeight:700,fontSize:12,marginBottom:12,color:'var(--blue)'}}>
                  🔁 အကြိမ်ရေ အများဆုံး
                </div>
                {topByCount.map((c,i)=>(
                  <div key={i} style={{ display:'flex',alignItems:'center',gap:8,
                    marginBottom:8,padding:'6px 0',
                    borderBottom:i<topByCount.length-1?'1px solid var(--border)':'none' }}>
                    <span style={{ fontSize:13,color:'var(--text3)',fontWeight:700,width:16 }}>
                      {i+1}
                    </span>
                    <span style={{fontSize:15}}>{c.icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,overflow:'hidden',
                        textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
                      <div style={{fontSize:11,color:'var(--blue)',fontWeight:700}}>
                        {c.count} ကြိမ်
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 30%+ change vs prev month ── */}
          {mode==='monthly' && bigChanges.length>0 && (
            <div className="card" style={{ marginBottom:14 }}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>
                ယခင်လထက် ၃၀%+ ပြောင်းလဲမှု
              </div>
              <div style={{fontSize:11,color:'var(--text3)',marginBottom:14}}>
                {MONTHS[selMonth===0?11:selMonth-1]} vs {MONTHS[selMonth]}
              </div>
              {bigChanges.map((c,i)=>(
                <div key={i} style={{ display:'flex',alignItems:'center',gap:12,
                  padding:'10px 0',
                  borderBottom:i<bigChanges.length-1?'1px solid var(--border)':'none' }}>
                  <span style={{fontSize:20}}>{c.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600}}>{c.name}</div>
                    <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>
                      K {fmtK(c.prev)} → K {fmtK(c.cur)}
                    </div>
                  </div>
                  <div style={{
                    padding:'4px 12px', borderRadius:99,
                    background: c.pct>0?'rgba(251,113,133,0.12)':'rgba(52,211,153,0.12)',
                    color: c.pct>0?'var(--red)':'var(--green)',
                    fontWeight:700, fontSize:13, flexShrink:0,
                  }}>
                    {c.pct>0?'↑':'↓'}{Math.abs(c.pct)}%
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Empty state ── */}
          {txs.length===0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-text">{t('no_data')}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
