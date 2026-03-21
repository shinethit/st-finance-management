// src/pages/Admin.jsx — Shine Thit Admin Panel
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import Logo from '../lib/Logo';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'shinethit@admin2024';
const fmt    = n => new Intl.NumberFormat('en-US').format(Math.abs(Number(n)||0));
const fmtK   = n => { const v=Math.abs(Number(n)||0); return v>=1000000?`${(v/1000000).toFixed(1)}M`:v>=1000?`${(v/1000).toFixed(0)}K`:`${Math.round(v)}`; };
const fmtDate= d => d ? new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}) : '—';

// ── Mini Bar Chart ─────────────────────────────────────────────
function BarChart({ data, valueKey, labelKey, colorKey, maxVal }) {
  const max = maxVal || Math.max(...data.map(d=>Number(d[valueKey])||0), 1);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {data.map((d,i) => {
        const pct = Math.max(2, Math.round((Number(d[valueKey])||0) / max * 100));
        return (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ fontSize:16, width:24, textAlign:'center', flexShrink:0 }}>{d.icon||d.category_icon||''}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'60%' }}>
                  {d[labelKey]}
                </span>
                <span style={{ fontSize:12, color:'var(--text3)', flexShrink:0 }}>K {fmtK(d[valueKey])}</span>
              </div>
              <div style={{ height:7, borderRadius:99, background:'var(--bg3)', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pct}%`, borderRadius:99,
                  background: d[colorKey]||'var(--accent)', transition:'width .5s ease' }} />
              </div>
            </div>
            <div style={{ fontSize:11, color:'var(--text3)', width:32, textAlign:'right', flexShrink:0 }}>{d.tx_count||''}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Monthly Trend Chart ────────────────────────────────────────
function TrendChart({ data }) {
  if (!data?.length) return <div style={{ textAlign:'center', color:'var(--text3)', padding:32 }}>No data</div>;
  const maxVal = Math.max(...data.map(d=>Math.max(Number(d.income)||0, Number(d.expense)||0)), 1);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return (
    <div>
      <div style={{ display:'flex', gap:16, marginBottom:16, fontSize:12 }}>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ width:12, height:12, borderRadius:3, background:'var(--green)', display:'inline-block' }}/>Income
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ width:12, height:12, borderRadius:3, background:'var(--red)', display:'inline-block' }}/>Expense
        </span>
      </div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:140 }}>
        {data.map((d,i) => {
          const inPct  = Math.max(3, Math.round((Number(d.income)||0)  / maxVal * 120));
          const exPct  = Math.max(3, Math.round((Number(d.expense)||0) / maxVal * 120));
          const label  = months[parseInt(d.month?.split('-')[1]||1)-1];
          return (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
              <div style={{ display:'flex', gap:2, alignItems:'flex-end', height:120 }}>
                <div title={`Income: K${fmt(d.income)}`}
                  style={{ width:10, height:inPct, background:'var(--green)', borderRadius:'3px 3px 0 0', opacity:.85 }} />
                <div title={`Expense: K${fmt(d.expense)}`}
                  style={{ width:10, height:exPct, background:'var(--red)',   borderRadius:'3px 3px 0 0', opacity:.85 }} />
              </div>
              <div style={{ fontSize:9, color:'var(--text3)', textTransform:'uppercase', letterSpacing:.3 }}>{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Admin Login ────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [pw, setPw]       = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      if (pw === ADMIN_PASSWORD) { sessionStorage.setItem('admin_auth','1'); onLogin(); }
      else { setError('Incorrect password.'); setPw(''); }
      setLoading(false);
    }, 600);
  };
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:16 }}>
      <div style={{ width:'100%', maxWidth:380, background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:20, padding:36, boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}>
            <Logo size={64} />
          </div>
          <div style={{ fontSize:22, fontWeight:800, letterSpacing:-.5 }}>Admin Panel</div>
          <div style={{ fontSize:13, color:'var(--text3)', marginTop:5 }}>Shine Thit — Restricted Access</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="form-group">
            <label className="form-label">Admin Password</label>
            <input className="form-input" type="password" placeholder="••••••••••••"
              value={pw} onChange={e=>setPw(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleLogin()} autoFocus />
          </div>
          {error && <div style={{ fontSize:13, color:'var(--red)', background:'rgba(251,113,133,0.1)', padding:'10px 14px', borderRadius:8 }}>{error}</div>}
          <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:12 }}
            onClick={handleLogin} disabled={loading}>
            {loading ? 'Checking…' : 'Enter Admin Panel'}
          </button>
        </div>
        <div style={{ marginTop:20, fontSize:11, color:'var(--text3)', textAlign:'center' }}>
          Set password via VITE_ADMIN_PASSWORD in .env.local
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ label, value, icon, color, sub }) {
  return (
    <div className="stat-card" style={{ borderColor:color+'33' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:color+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{icon}</div>
        <div className="stat-label" style={{ marginBottom:0 }}>{label}</div>
      </div>
      <div className="stat-value" style={{ color, fontSize:26 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'var(--text3)', marginTop:3 }}>{sub}</div>}
    </div>
  );
}

// ── Announcement Modal ─────────────────────────────────────────
function AnnouncementModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState({ title:'', body:'', type:'info', is_active:true, ...initial });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{initial?.id?'Edit':'New'} Announcement</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-select" value={form.type} onChange={e=>set('type',e.target.value)}>
              <option value="info">ℹ️ Info</option>
              <option value="success">✅ Success</option>
              <option value="warning">⚠️ Warning</option>
              <option value="error">🚨 Error</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" placeholder="Announcement title" value={form.title} onChange={e=>set('title',e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-textarea" placeholder="Full message…" value={form.body} onChange={e=>set('body',e.target.value)} />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <input type="checkbox" id="active" checked={form.is_active} onChange={e=>set('is_active',e.target.checked)} style={{ width:16, height:16, accentColor:'var(--accent)' }}/>
            <label htmlFor="active" style={{ fontSize:13, fontWeight:600, cursor:'pointer' }}>Active (visible to users)</label>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={()=>{ if(!form.title||!form.body)return; onSave(form); onClose(); }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── User Detail Modal ──────────────────────────────────────────
function UserDetailModal({ user, onClose, onBlock, onUnblock }) {
  const [txs, setTxs]     = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    supabase.from('transactions').select('*,category:categories(name,icon)')
      .eq('user_id',user.id).order('date',{ascending:false}).limit(20)
      .then(({data})=>{ setTxs(data||[]); setLoading(false); });
  },[user.id]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{ maxWidth:520 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{user.display_name||user.email?.split('@')[0]}</div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:3 }}>{user.email}</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ display:'flex', gap:10, marginBottom:18 }}>
          {[
            { label:'Joined',       val:fmtDate(user.created_at) },
            { label:'Last Login',   val:fmtDate(user.last_sign_in) },
            { label:'Transactions', val:fmt(user.tx_count) },
          ].map(s=>(
            <div key={s.label} style={{ flex:1, background:'var(--bg3)', borderRadius:10, padding:'11px 12px' }}>
              <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.7px', color:'var(--text3)', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontWeight:700, fontSize:14 }}>{s.val}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18, padding:'12px 14px', background:'var(--bg3)', borderRadius:10 }}>
          <span style={{ fontSize:13, fontWeight:600, flex:1 }}>
            Status: {user.is_blocked
              ? <span style={{ color:'var(--red)' }}>🚫 Blocked</span>
              : <span style={{ color:'var(--green)' }}>✓ Active</span>}
          </span>
          {user.is_blocked
            ? <button className="btn btn-secondary btn-sm" onClick={()=>{ onUnblock(user.id); onClose(); }}>Unblock</button>
            : <button className="btn btn-danger btn-sm" onClick={()=>{ onBlock(user.id); onClose(); }}>Block</button>
          }
        </div>
        <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Recent Transactions</div>
        {loading
          ? <div style={{ textAlign:'center', color:'var(--text3)', padding:20 }}>Loading…</div>
          : txs.length===0
            ? <div style={{ textAlign:'center', color:'var(--text3)', padding:20 }}>No transactions</div>
            : <div className="tx-list" style={{ maxHeight:240, overflowY:'auto' }}>
                {txs.map(tx=>(
                  <div key={tx.id} className="tx-item">
                    <div className="tx-icon" style={{ background:tx.type==='income'?'rgba(52,211,153,0.15)':'rgba(251,113,133,0.15)', fontSize:17 }}>
                      {tx.category?.icon||(tx.type==='income'?'↑':'↓')}
                    </div>
                    <div className="tx-info">
                      <div className="tx-name">{tx.note||tx.category?.name||'Transaction'}</div>
                      <div className="tx-meta">{tx.date}</div>
                    </div>
                    <div className={`tx-amount ${tx.type}`}>{tx.type==='income'?'+':'-'}K {fmt(tx.amount)}</div>
                  </div>
                ))}
              </div>
        }
      </div>
    </div>
  );
}

// ── Analytics Tab ──────────────────────────────────────────────
function AnalyticsTab() {
  const [totals,     setTotals]     = useState(null);
  const [categories, setCategories] = useState([]);
  const [monthly,    setMonthly]    = useState([]);
  const [userSpend,  setUserSpend]  = useState([]);
  const [subtypes,   setSubtypes]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [section,    setSection]    = useState('overview'); // overview | categories | users | trend

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      const [t, c, m, u, s] = await Promise.all([
        supabase.rpc('admin_get_platform_totals'),
        supabase.rpc('admin_get_category_stats'),
        supabase.rpc('admin_get_monthly_trend'),
        supabase.rpc('admin_get_user_spending'),
        supabase.rpc('admin_get_subtype_stats'),
      ]);
      setTotals(t.data);
      setCategories(c.data||[]);
      setMonthly(m.data||[]);
      setUserSpend(u.data||[]);
      setSubtypes(s.data||[]);
      setLoading(false);
    })();
  },[]);

  if (loading) return <div style={{ textAlign:'center', color:'var(--text3)', padding:60 }}>Loading analytics…</div>;

  const totalIncome  = Number(totals?.total_income||0);
  const totalExpense = Number(totals?.total_expense||0);
  const net          = totalIncome - totalExpense;
  const saveRate     = totalIncome>0 ? Math.round(net/totalIncome*100) : 0;

  const SUB_LABELS = { general:'General', vehicle:'Vehicle', debt_out:'Debt', debt_in:'Debt Repay', savings:'Savings' };
  const SUB_COLORS = { general:'var(--accent)', vehicle:'var(--blue)', debt_out:'var(--red)', debt_in:'var(--green)', savings:'var(--purple)' };

  const SECTIONS = [
    { id:'overview',   label:'Overview'  },
    { id:'categories', label:'By Category' },
    { id:'users',      label:'By User'   },
    { id:'trend',      label:'Trend'     },
  ];

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:24, fontWeight:800, letterSpacing:-.5 }}>Analytics</div>
        <div style={{ fontSize:13, color:'var(--text3)', marginTop:3 }}>Platform-wide spending & income analysis</div>
      </div>

      {/* Sub-nav */}
      <div style={{ display:'flex', gap:6, marginBottom:24, background:'var(--bg2)', padding:4, borderRadius:12, width:'fit-content' }}>
        {SECTIONS.map(s=>(
          <button key={s.id} onClick={()=>setSection(s.id)}
            style={{ padding:'7px 16px', borderRadius:9, border:'none', cursor:'pointer',
              background: section===s.id ? 'var(--accent)' : 'transparent',
              color: section===s.id ? '#fff' : 'var(--text3)',
              fontSize:13, fontWeight:section===s.id?700:500, fontFamily:'var(--font)',
              transition:'all .15s' }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {section==='overview' && (
        <>
          {/* Big KPIs */}
          <div className="grid-4" style={{ marginBottom:20 }}>
            <StatCard label="Total Income"  value={`K ${fmtK(totalIncome)}`}  icon="↑" color="var(--green)"  sub={`${fmt(totalIncome)} MMK`} />
            <StatCard label="Total Expense" value={`K ${fmtK(totalExpense)}`} icon="↓" color="var(--red)"    sub={`${fmt(totalExpense)} MMK`} />
            <StatCard label="Net Balance"   value={`K ${fmtK(Math.abs(net))}`} icon={net>=0?'📈':'📉'} color={net>=0?'var(--green)':'var(--red)'} sub={net>=0?'Surplus':'Deficit'} />
            <StatCard label="Save Rate"     value={`${saveRate}%`}             icon="🎯" color="var(--purple)" sub="Income saved" />
          </div>

          <div className="grid-2" style={{ marginBottom:20 }}>
            {/* Platform totals */}
            <div className="card">
              <div style={{ fontSize:13, fontWeight:700, marginBottom:16 }}>Platform Totals</div>
              {[
                { label:'Total Income',       val:`K ${fmt(totalIncome)}`,                  color:'var(--green)'  },
                { label:'Total Expense',      val:`K ${fmt(totalExpense)}`,                 color:'var(--red)'    },
                { label:'Net',                val:`K ${fmt(Math.abs(net))}`,                color:net>=0?'var(--green)':'var(--red)' },
                { label:'Total Savings',      val:`K ${fmt(totals?.total_savings||0)}`,     color:'var(--purple)' },
                { label:'Active Debt',        val:`K ${fmt(totals?.total_debt_active||0)}`, color:'var(--amber)'  },
                { label:'Avg Txns/User',      val:totals?.avg_tx_per_user||0,               color:'var(--text2)'  },
              ].map(r=>(
                <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:13, color:'var(--text2)' }}>{r.label}</span>
                  <span style={{ fontFamily:'var(--mono)', fontWeight:700, fontSize:13, color:r.color }}>{r.val}</span>
                </div>
              ))}
            </div>

            {/* Spending by sub-type */}
            <div className="card">
              <div style={{ fontSize:13, fontWeight:700, marginBottom:16 }}>Spending by Type</div>
              {subtypes.length===0
                ? <div style={{ textAlign:'center', color:'var(--text3)', padding:24 }}>No data yet</div>
                : <BarChart
                    data={subtypes.map(s=>({
                      ...s,
                      label: SUB_LABELS[s.sub_type]||s.sub_type,
                      category_color: SUB_COLORS[s.sub_type]||'var(--accent)',
                    }))}
                    valueKey="total_amount" labelKey="label" colorKey="category_color"
                  />
              }
              <div style={{ marginTop:16, padding:'12px 14px', background:'var(--bg3)', borderRadius:10 }}>
                <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.7px', fontWeight:700, marginBottom:8 }}>Breakdown</div>
                {subtypes.map(s=>(
                  <div key={s.sub_type} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'4px 0', color:'var(--text2)' }}>
                    <span>{SUB_LABELS[s.sub_type]||s.sub_type}</span>
                    <span style={{ fontFamily:'var(--mono)', fontWeight:600 }}>{s.tx_count} txns</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mini trend preview */}
          <div className="card">
            <div style={{ fontSize:13, fontWeight:700, marginBottom:16 }}>Monthly Trend (Last 8 Months)</div>
            <TrendChart data={monthly} />
          </div>
        </>
      )}

      {/* ── CATEGORIES ── */}
      {section==='categories' && (
        <>
          <div className="grid-2" style={{ marginBottom:20 }}>
            <div className="card">
              <div style={{ fontSize:13, fontWeight:700, marginBottom:6 }}>Top Spending Categories</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginBottom:16 }}>Expense amount across all users</div>
              {categories.length===0
                ? <div style={{ textAlign:'center', color:'var(--text3)', padding:32 }}>No data yet</div>
                : <BarChart data={categories} valueKey="total_amount" labelKey="category_name" colorKey="category_color" />
              }
            </div>

            <div className="card">
              <div style={{ fontSize:13, fontWeight:700, marginBottom:16 }}>Category Details</div>
              <div style={{ fontSize:11, display:'grid', gridTemplateColumns:'1fr 80px 70px 60px', gap:8, padding:'6px 0', borderBottom:'1px solid var(--border)', color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px' }}>
                <span>Category</span><span style={{textAlign:'right'}}>Amount</span><span style={{textAlign:'right'}}>Txns</span><span style={{textAlign:'right'}}>Users</span>
              </div>
              {categories.map((c,i)=>(
                <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 80px 70px 60px', gap:8, padding:'10px 0', borderBottom:'1px solid var(--border)', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:16 }}>{c.category_icon}</span>
                    <span style={{ fontSize:13, fontWeight:600 }}>{c.category_name}</span>
                  </div>
                  <span style={{ fontSize:12, fontFamily:'var(--mono)', fontWeight:600, color:'var(--red)', textAlign:'right' }}>K {fmtK(c.total_amount)}</span>
                  <span style={{ fontSize:12, textAlign:'right', color:'var(--text2)' }}>{c.tx_count}</span>
                  <span style={{ fontSize:12, textAlign:'right', color:'var(--text3)' }}>{c.user_count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* % share of total */}
          <div className="card">
            <div style={{ fontSize:13, fontWeight:700, marginBottom:16 }}>Category Share of Total Expense</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {categories.slice(0,10).map((c,i)=>{
                const pct = totalExpense>0 ? (Number(c.total_amount)/totalExpense*100).toFixed(1) : 0;
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:99, background:'var(--bg3)', fontSize:12 }}>
                    <span>{c.category_icon}</span>
                    <span style={{ fontWeight:600 }}>{c.category_name}</span>
                    <span style={{ color:'var(--accent)', fontWeight:700 }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── BY USER ── */}
      {section==='users' && (
        <>
          {/* Top 3 spenders */}
          <div className="grid-3" style={{ marginBottom:20 }}>
            {userSpend.slice(0,3).map((u,i)=>(
              <div key={u.user_id||i} className="card" style={{ borderColor:['var(--amber)','var(--text3)','#b45309'][i]+'55' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,var(--accent),var(--accent2))`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff', fontSize:16 }}>
                    {['🥇','🥈','🥉'][i]}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.display_name||u.email?.split('@')[0]}</div>
                    <div style={{ fontSize:11, color:'var(--text3)' }}>Top Spender #{i+1}</div>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <div>
                    <div style={{ color:'var(--text3)', marginBottom:2 }}>Expense</div>
                    <div style={{ color:'var(--red)', fontWeight:700, fontFamily:'var(--mono)' }}>K {fmtK(u.total_expense)}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ color:'var(--text3)', marginBottom:2 }}>Income</div>
                    <div style={{ color:'var(--green)', fontWeight:700, fontFamily:'var(--mono)' }}>K {fmtK(u.total_income)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Full user table */}
          <div className="card">
            <div style={{ fontSize:13, fontWeight:700, marginBottom:16 }}>All Users — Spending Summary</div>
            <div style={{ fontSize:11, display:'grid', gridTemplateColumns:'1fr 100px 100px 100px 60px 90px', gap:8, padding:'6px 8px', borderBottom:'1px solid var(--border)', color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px' }}>
              <span>User</span>
              <span style={{textAlign:'right'}}>Income</span>
              <span style={{textAlign:'right'}}>Expense</span>
              <span style={{textAlign:'right'}}>Net</span>
              <span style={{textAlign:'right'}}>Txns</span>
              <span style={{textAlign:'right'}}>Last Activity</span>
            </div>
            {userSpend.map((u,i)=>{
              const netU = Number(u.net||0);
              return (
                <div key={u.user_id||i} style={{ display:'grid', gridTemplateColumns:'1fr 100px 100px 100px 60px 90px', gap:8, padding:'10px 8px', borderBottom:'1px solid var(--border)', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--accent2))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>
                      {(u.display_name||u.email||'U')[0].toUpperCase()}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.display_name||u.email?.split('@')[0]}</div>
                      <div style={{ fontSize:10, color:'var(--text3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:12, fontFamily:'var(--mono)', color:'var(--green)', textAlign:'right', fontWeight:600 }}>K {fmtK(u.total_income)}</div>
                  <div style={{ fontSize:12, fontFamily:'var(--mono)', color:'var(--red)',   textAlign:'right', fontWeight:600 }}>K {fmtK(u.total_expense)}</div>
                  <div style={{ fontSize:12, fontFamily:'var(--mono)', color:netU>=0?'var(--green)':'var(--red)', textAlign:'right', fontWeight:700 }}>
                    {netU>=0?'+':'-'}K {fmtK(Math.abs(netU))}
                  </div>
                  <div style={{ fontSize:12, textAlign:'right', color:'var(--text2)' }}>{u.tx_count||0}</div>
                  <div style={{ fontSize:11, textAlign:'right', color:'var(--text3)' }}>{u.last_tx_date||'—'}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── TREND ── */}
      {section==='trend' && (
        <>
          <div className="card" style={{ marginBottom:20 }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>Monthly Income vs Expense</div>
            <div style={{ fontSize:12, color:'var(--text3)', marginBottom:20 }}>Last 8 months — all users combined</div>
            <TrendChart data={monthly} />
          </div>

          {/* Monthly table */}
          <div className="card">
            <div style={{ fontSize:13, fontWeight:700, marginBottom:16 }}>Monthly Breakdown</div>
            <div style={{ fontSize:11, display:'grid', gridTemplateColumns:'100px 1fr 1fr 1fr 80px', gap:8, padding:'6px 8px', borderBottom:'1px solid var(--border)', color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px' }}>
              <span>Month</span>
              <span style={{textAlign:'right'}}>Income</span>
              <span style={{textAlign:'right'}}>Expense</span>
              <span style={{textAlign:'right'}}>Net</span>
              <span style={{textAlign:'right'}}>Txns</span>
            </div>
            {[...monthly].reverse().map((m,i)=>{
              const netM = Number(m.net||0);
              const mm = m.month?.split('-');
              const label = mm ? `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(mm[1])-1]} ${mm[0]}` : m.month;
              return (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'100px 1fr 1fr 1fr 80px', gap:8, padding:'10px 8px', borderBottom:'1px solid var(--border)', alignItems:'center' }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>{label}</span>
                  <span style={{ fontSize:12, fontFamily:'var(--mono)', color:'var(--green)', textAlign:'right', fontWeight:600 }}>K {fmt(m.income)}</span>
                  <span style={{ fontSize:12, fontFamily:'var(--mono)', color:'var(--red)',   textAlign:'right', fontWeight:600 }}>K {fmt(m.expense)}</span>
                  <span style={{ fontSize:12, fontFamily:'var(--mono)', color:netM>=0?'var(--green)':'var(--red)', textAlign:'right', fontWeight:700 }}>
                    {netM>=0?'+':'-'}K {fmt(Math.abs(netM))}
                  </span>
                  <span style={{ fontSize:12, textAlign:'right', color:'var(--text2)' }}>{m.tx_count}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Admin ─────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed]               = useState(!!sessionStorage.getItem('admin_auth'));
  const [tab, setTab]                     = useState('overview');
  const [stats, setStats]                 = useState(null);
  const [users, setUsers]                 = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedUser, setSelectedUser]   = useState(null);
  const [annModal, setAnnModal]           = useState(null);
  const [loading, setLoading]             = useState(false);
  const [search, setSearch]               = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: statsData } = await supabase.rpc('admin_get_stats');
      setStats(statsData);
      const { data: usersData } = await supabase.rpc('admin_get_users');
      setUsers(usersData||[]);
      const { data: annData }   = await supabase.from('announcements').select('*').order('created_at',{ascending:false});
      setAnnouncements(annData||[]);
    } catch(e) { console.error(e); }
    setLoading(false);
  },[]);

  useEffect(()=>{ if(authed) loadData(); },[authed,loadData]);

  const blockUser   = async(id)=>{ await supabase.from('user_blocks').insert({user_id:id,reason:'Blocked by admin'}); loadData(); };
  const unblockUser = async(id)=>{ await supabase.from('user_blocks').delete().eq('user_id',id); loadData(); };
  const saveAnn     = async(form)=>{ if(form.id){ await supabase.from('announcements').update({...form,updated_at:new Date().toISOString()}).eq('id',form.id); } else { await supabase.from('announcements').insert(form); } loadData(); };
  const deleteAnn   = async(id)=>{ await supabase.from('announcements').delete().eq('id',id); loadData(); };
  const signOut     = ()=>{ sessionStorage.removeItem('admin_auth'); setAuthed(false); };

  if (!authed) return <AdminLogin onLogin={()=>setAuthed(true)} />;

  const filteredUsers = users.filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  const annTypeColor = { info:'var(--blue)', success:'var(--green)', warning:'var(--amber)', error:'var(--red)' };
  const annTypeIcon  = { info:'ℹ️', success:'✅', warning:'⚠️', error:'🚨' };

  const TABS = [
    { id:'overview',      label:'Overview',    icon:'📊' },
    { id:'analytics',     label:'Analytics',   icon:'📈' },
    { id:'users',         label:'Users',       icon:'👥' },
    { id:'announcements', label:'Announce',    icon:'📢' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex' }}>
      {/* Sidebar */}
      <div style={{ width:210, background:'var(--bg2)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', padding:'24px 12px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0 8px 24px' }}>
          <Logo size={36} />
          <div>
            <div style={{ fontWeight:800, fontSize:14 }}>Admin Panel</div>
            <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1 }}>Shine Thit</div>
          </div>
        </div>
        <nav style={{ display:'flex', flexDirection:'column', gap:2, flex:1 }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8,
                background:tab===t.id?'rgba(255,107,53,0.12)':'none', border:'none', cursor:'pointer',
                fontFamily:'var(--font)', fontSize:13, fontWeight:tab===t.id?700:500,
                color:tab===t.id?'var(--accent)':'var(--text3)',
                width:'100%', textAlign:'left', transition:'all .15s' }}>
              <span style={{ fontSize:16 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <button className="btn btn-ghost" style={{ justifyContent:'flex-start', gap:8, color:'var(--text3)', fontSize:13 }} onClick={signOut}>
          🚪 Sign Out
        </button>
      </div>

      {/* Main */}
      <div style={{ flex:1, overflowY:'auto' }}>
        <div style={{ padding:'24px 28px', maxWidth:1100 }}>

          {/* OVERVIEW */}
          {tab==='overview' && (
            <>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:24, fontWeight:800, letterSpacing:-.5 }}>Overview</div>
                <div style={{ fontSize:13, color:'var(--text3)', marginTop:3 }}>{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</div>
              </div>
              {loading
                ? <div style={{ textAlign:'center', color:'var(--text3)', padding:40 }}>Loading…</div>
                : <div className="grid-4" style={{ marginBottom:20 }}>
                    <StatCard label="Total Users"        value={fmt(stats?.total_users||0)}        icon="👥" color="var(--blue)" />
                    <StatCard label="Total Transactions" value={fmt(stats?.total_transactions||0)} icon="↕"  color="var(--accent)" />
                    <StatCard label="Total Debts"        value={fmt(stats?.total_debts||0)}        icon="💸" color="var(--purple)" />
                    <StatCard label="Total Vehicles"     value={fmt(stats?.total_vehicles||0)}     icon="🚗" color="var(--teal)" />
                  </div>
              }
              <div className="grid-2">
                <div className="card">
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Today's Activity</div>
                  {[
                    { label:"New Users Today",     val:stats?.new_users_today,     icon:'👤', color:'var(--green)'  },
                    { label:"Transactions Today",  val:stats?.tx_today,            icon:'↕',  color:'var(--accent)' },
                    { label:"Active Announcements",val:stats?.active_announcements,icon:'📢', color:'var(--blue)'   },
                  ].map(s=>(
                    <div key={s.label} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                      <div style={{ width:34, height:34, borderRadius:9, background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{s.icon}</div>
                      <div style={{ flex:1, fontSize:13, fontWeight:600 }}>{s.label}</div>
                      <div style={{ fontFamily:'var(--mono)', fontWeight:700, color:s.color }}>{fmt(s.val||0)}</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Recent Users</div>
                  {users.slice(0,5).map(u=>(
                    <div key={u.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)', cursor:'pointer' }} onClick={()=>setSelectedUser(u)}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--accent2))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
                        {(u.display_name||u.email||'U')[0].toUpperCase()}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>{fmtDate(u.created_at)}</div>
                      </div>
                      {u.is_blocked && <span style={{ fontSize:11, color:'var(--red)', fontWeight:700 }}>Blocked</span>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ANALYTICS */}
          {tab==='analytics' && <AnalyticsTab />}

          {/* USERS */}
          {tab==='users' && (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <div>
                  <div style={{ fontSize:24, fontWeight:800, letterSpacing:-.5 }}>Users</div>
                  <div style={{ fontSize:13, color:'var(--text3)', marginTop:3 }}>{users.length} registered users</div>
                </div>
                <input className="form-input" style={{ maxWidth:240 }} placeholder="Search users…" value={search} onChange={e=>setSearch(e.target.value)} />
              </div>
              <div className="card">
                <div style={{ display:'grid', gridTemplateColumns:'1fr 120px 80px 80px 80px', gap:12, padding:'8px 12px', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.7px', color:'var(--text3)', borderBottom:'1px solid var(--border)', marginBottom:4 }}>
                  <span>User</span><span>Joined</span><span>Txns</span><span>Status</span><span>Action</span>
                </div>
                {loading
                  ? <div style={{ textAlign:'center', padding:32, color:'var(--text3)' }}>Loading…</div>
                  : filteredUsers.length===0
                    ? <div style={{ textAlign:'center', padding:32, color:'var(--text3)' }}>No users found</div>
                    : filteredUsers.map(u=>(
                        <div key={u.id}
                          style={{ display:'grid', gridTemplateColumns:'1fr 120px 80px 80px 80px', gap:12, padding:'11px 12px', borderBottom:'1px solid var(--border)', alignItems:'center', cursor:'pointer' }}
                          onMouseEnter={e=>e.currentTarget.style.background='var(--bg3)'}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                          onClick={()=>setSelectedUser(u)}>
                          <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                            <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--accent2))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
                              {(u.display_name||u.email||'U')[0].toUpperCase()}
                            </div>
                            <div style={{ minWidth:0 }}>
                              <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.display_name||u.email?.split('@')[0]}</div>
                              <div style={{ fontSize:11, color:'var(--text3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</div>
                            </div>
                          </div>
                          <div style={{ fontSize:12, color:'var(--text2)' }}>{fmtDate(u.created_at)}</div>
                          <div style={{ fontFamily:'var(--mono)', fontSize:13, fontWeight:600 }}>{fmt(u.tx_count)}</div>
                          <div>
                            {u.is_blocked
                              ? <span style={{ fontSize:11, color:'var(--red)', fontWeight:700, background:'rgba(251,113,133,0.12)', padding:'3px 8px', borderRadius:99 }}>Blocked</span>
                              : <span style={{ fontSize:11, color:'var(--green)', fontWeight:700, background:'rgba(52,211,153,0.12)', padding:'3px 8px', borderRadius:99 }}>Active</span>}
                          </div>
                          <div onClick={e=>e.stopPropagation()}>
                            {u.is_blocked
                              ? <button className="btn btn-secondary btn-sm" onClick={()=>unblockUser(u.id)}>Unblock</button>
                              : <button className="btn btn-danger btn-sm" onClick={()=>blockUser(u.id)}>Block</button>}
                          </div>
                        </div>
                      ))
                }
              </div>
            </>
          )}

          {/* ANNOUNCEMENTS */}
          {tab==='announcements' && (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <div>
                  <div style={{ fontSize:24, fontWeight:800, letterSpacing:-.5 }}>Announcements</div>
                  <div style={{ fontSize:13, color:'var(--text3)', marginTop:3 }}>Push messages to all users</div>
                </div>
                <button className="btn btn-primary" onClick={()=>setAnnModal({})}>+ New Announcement</button>
              </div>
              {loading
                ? <div style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>Loading…</div>
                : announcements.length===0
                  ? <div className="empty-state"><div className="empty-state-icon">📢</div><div className="empty-state-text">No announcements yet</div></div>
                  : <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {announcements.map(a=>(
                        <div key={a.id} className="card" style={{ borderColor:annTypeColor[a.type]+'33' }}>
                          <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                            <div style={{ width:40, height:40, borderRadius:12, background:annTypeColor[a.type]+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{annTypeIcon[a.type]}</div>
                            <div style={{ flex:1 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                                <span style={{ fontWeight:700, fontSize:15 }}>{a.title}</span>
                                <span style={{ fontSize:11, fontWeight:700, color:annTypeColor[a.type], background:annTypeColor[a.type]+'15', padding:'2px 8px', borderRadius:99 }}>{a.type}</span>
                                {!a.is_active && <span style={{ fontSize:11, fontWeight:700, color:'var(--text3)', background:'var(--bg3)', padding:'2px 8px', borderRadius:99 }}>Inactive</span>}
                              </div>
                              <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>{a.body}</div>
                              <div style={{ fontSize:11, color:'var(--text3)', marginTop:6 }}>{fmtDate(a.created_at)}</div>
                            </div>
                            <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                              <button className="btn btn-secondary btn-sm" onClick={()=>setAnnModal(a)}>Edit</button>
                              <button className="btn btn-danger btn-sm" onClick={()=>deleteAnn(a.id)}>Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
              }
            </>
          )}
        </div>
      </div>

      {selectedUser && <UserDetailModal user={selectedUser} onClose={()=>setSelectedUser(null)} onBlock={blockUser} onUnblock={unblockUser} />}
      {annModal !== null && <AnnouncementModal onClose={()=>setAnnModal(null)} onSave={saveAnn} initial={annModal} />}
    </div>
  );
}
