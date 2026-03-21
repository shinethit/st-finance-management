// src/pages/Dashboard.jsx — Clean Money Lover style
import { useState, useEffect } from 'react';
import { useDashboard } from '../hooks/useData';
import { useWallets } from '../hooks/useData';
import { supabase } from '../lib/supabase';

const fmt = n => new Intl.NumberFormat('en-US').format(Math.abs(Number(n)||0));

// ── Mini Bar Chart ────────────────────────────────────────────
function MiniChart({ data }) {
  if (!data?.length) return null;
  const maxInc = Math.max(...data.map(d=>d.income), 1);
  const maxExp = Math.max(...data.map(d=>d.expense), 1);
  const max    = Math.max(maxInc, maxExp);

  return (
    <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:52 }}>
      {data.map((d,i) => {
        const iH = Math.max((d.income/max)*48, 3);
        const eH = Math.max((d.expense/max)*48, 3);
        const isCurrent = i === data.length-1;
        return (
          <div key={i} style={{ flex:1 }}>
            <div style={{ display:'flex', gap:2, alignItems:'flex-end', height:48 }}>
              <div style={{
                flex:1, height:iH, borderRadius:'3px 3px 0 0',
                background: isCurrent ? 'var(--green)' : 'rgba(74,222,128,0.4)',
                minHeight:3,
              }}/>
              <div style={{
                flex:1, height:eH, borderRadius:'3px 3px 0 0',
                background: isCurrent ? 'var(--accent)' : 'rgba(255,107,53,0.4)',
                minHeight:3,
              }}/>
            </div>
            <div style={{
              fontSize:8, textAlign:'center', marginTop:4,
              color: isCurrent ? 'var(--accent)' : 'var(--text3)',
              fontWeight: isCurrent ? 700 : 500,
            }}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function TrendChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function load() {
      const now = new Date();
      const months = await Promise.all(
        Array.from({length:6}, (_,i) => {
          const d   = new Date(now.getFullYear(), now.getMonth()-5+i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
          return Promise.all([
            supabase.from('transactions').select('amount').eq('type','income').gte('date',key+'-01').lte('date',key+'-31'),
            supabase.from('transactions').select('amount').eq('type','expense').gte('date',key+'-01').lte('date',key+'-31'),
          ]).then(([inc,exp]) => ({
            label: d.toLocaleString('en-US', {month:'short'}),
            income:  (inc.data||[]).reduce((s,t)=>s+Number(t.amount),0),
            expense: (exp.data||[]).reduce((s,t)=>s+Number(t.amount),0),
          }));
        })
      );
      setData(months);
    }
    load();
  }, []);

  const avg6Exp = data.length ? data.reduce((s,d)=>s+d.expense,0)/data.length : 0;
  const thisExp = data[data.length-1]?.expense || 0;
  const diff    = thisExp - avg6Exp;

  return (
    <div className="card" style={{ marginTop:14 }}>
      <div className="section-header">
        <div className="section-title">Trending Report</div>
        <div style={{ display:'flex', gap:10, fontSize:11, color:'var(--text3)' }}>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:8, height:8, background:'var(--green)', borderRadius:2, display:'inline-block' }}/>Income
          </span>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:8, height:8, background:'var(--accent)', borderRadius:2, display:'inline-block' }}/>Expense
          </span>
        </div>
      </div>
      <MiniChart data={data} />
      <div style={{ display:'flex', gap:10, marginTop:14 }}>
        <div style={{ flex:1, background:'var(--bg3)', borderRadius:10, padding:'11px 13px' }}>
          <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.7px', color:'var(--text3)', marginBottom:4 }}>6-Mo Avg Expense</div>
          <div style={{ fontFamily:'var(--mono)', fontSize:15, fontWeight:600, color:'var(--accent)' }}>K {fmt(avg6Exp)}</div>
        </div>
        <div style={{ flex:1, background:'var(--bg3)', borderRadius:10, padding:'11px 13px' }}>
          <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.7px', color:'var(--text3)', marginBottom:4 }}>vs Last Month</div>
          <div style={{ fontFamily:'var(--mono)', fontSize:15, fontWeight:600, color: diff<=0?'var(--green)':'var(--accent)' }}>
            {diff<=0?'▼':'▲'} K {fmt(Math.abs(diff))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────
export default function Dashboard({ onNavigate }) {
  const { summary:s, loading } = useDashboard();
  const { data:wallets }       = useWallets();

  if (loading) return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div style={{ textAlign:'center', color:'var(--text3)' }}>
        <div style={{ fontSize:28, color:'var(--accent)', marginBottom:10 }}>✦</div>
        <div style={{ fontWeight:500 }}>Loading…</div>
      </div>
    </div>
  );

  const bal = s?.monthBalance || 0;
  const now = new Date();

  // Wallet gradient presets — colorful
  const walletGrads = [
    'linear-gradient(135deg,#1d4ed8,#3b82f6)',   // blue
    'linear-gradient(135deg,#7c3aed,#a78bfa)',   // purple
    'linear-gradient(135deg,#059669,#34d399)',   // green
    'linear-gradient(135deg,#dc2626,#fb7185)',   // red
    'linear-gradient(135deg,#d97706,#fbbf24)',   // amber
    'linear-gradient(135deg,#0891b2,#2dd4bf)',   // teal
  ];

  return (
    <div className="page">

      {/* ── Balance Display ── */}
      <div style={{ textAlign:'center', paddingBottom:24, paddingTop:8 }}>
        <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:1, color:'var(--text3)', marginBottom:8 }}>
          Total Balance
        </div>
        <div style={{ fontSize:40, fontWeight:800, letterSpacing:-1.5, marginBottom:22, fontFamily:'var(--mono)' }}>
          K {fmt(bal)}
        </div>
        <div style={{ display:'flex', justifyContent:'center', gap:40 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', display:'flex', alignItems:'center', gap:5, justifyContent:'center', marginBottom:5 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--green)', display:'inline-block' }}/>
              Income
            </div>
            <div style={{ fontFamily:'var(--mono)', fontSize:17, fontWeight:700, color:'var(--green)' }}>+K {fmt(s?.monthIncome)}</div>
          </div>
          <div style={{ width:1, background:'var(--border)' }}/>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', display:'flex', alignItems:'center', gap:5, justifyContent:'center', marginBottom:5 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent)', display:'inline-block' }}/>
              Expense
            </div>
            <div style={{ fontFamily:'var(--mono)', fontSize:17, fontWeight:700, color:'var(--accent)' }}>-K {fmt(s?.monthExpense)}</div>
          </div>
        </div>
      </div>

      {/* ── Wallets ── */}
      {wallets.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <div className="section-header">
            <div className="section-title">My Wallets</div>
            <button className="btn btn-ghost btn-sm" style={{ color:'var(--accent)' }}>See all</button>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            {wallets.slice(0,2).map((w,i) => (
              <div key={w.id} style={{
                flex:1, borderRadius:14, padding:'14px 14px 12px',
                background: walletGrads[i % walletGrads.length],
                position:'relative', overflow:'hidden',
              }}>
                <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.65)', marginBottom:6 }}>{w.name}</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:20, fontWeight:800, color:'#fff', letterSpacing:-.5 }}>
                  K {fmt(w.balance || 0)}
                </div>
                <div style={{ position:'absolute', right:12, top:12, fontSize:22, opacity:.45 }}>
                  {i===0?'💳':'💰'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Debt row ── */}
      {((s?.totalLent||0)>0||(s?.totalBorrowed||0)>0) && (
        <div className="grid-2" style={{ marginBottom:16 }}>
          <div className="stat-card" style={{ borderColor:'rgba(96,165,250,0.2)' }}>
            <div className="stat-label">I Lent</div>
            <div className="stat-value" style={{ fontSize:20, color:'var(--blue)' }}>K {fmt(s?.totalLent)}</div>
            <div className="stat-sub">To receive</div>
          </div>
          <div className="stat-card" style={{ borderColor:'rgba(255,107,53,0.2)' }}>
            <div className="stat-label">I Borrowed</div>
            <div className="stat-value" style={{ fontSize:20, color:'var(--accent)' }}>K {fmt(s?.totalBorrowed)}</div>
            <div className="stat-sub">To pay back</div>
          </div>
        </div>
      )}

      {/* ── Overdue alert ── */}
      {(s?.overdueReminders||0)>0 && (
        <div className="alert-banner warning">
          <span>⚠️</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:600, fontSize:13 }}>{s.overdueReminders} vehicle reminder{s.overdueReminders>1?'s':''} overdue</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={()=>onNavigate('vehicles')}>View →</button>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom:0 }}>
        {/* Recent Transactions */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">Recent</div>
            <button className="btn btn-ghost btn-sm" style={{ color:'var(--accent)' }} onClick={()=>onNavigate('transactions')}>See all</button>
          </div>
          {!(s?.recentTransactions?.length)
            ? <div className="empty-state" style={{ padding:'20px 0' }}>
                <div className="empty-state-icon">↕</div>
                <div className="empty-state-text">No transactions yet</div>
              </div>
            : <div className="tx-list">
                {(s.recentTransactions||[]).map((tx,i) => (
                  <div key={i} className="tx-item">
                    <div className="tx-icon" style={{
                      background: tx.type==='income'?'rgba(74,222,128,0.12)':'rgba(255,107,53,0.12)',
                    }}>
                      {tx.category?.icon||(tx.type==='income'?'↑':'↓')}
                    </div>
                    <div className="tx-info">
                      <div className="tx-name">{tx.note||tx.category?.name||'Transaction'}</div>
                      <div className="tx-meta">{tx.date}</div>
                    </div>
                    <div>
                      <div className={`tx-amount ${tx.type}`}>
                        {tx.type==='income'?'+':'-'}K {fmt(tx.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Budgets */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">Budgets</div>
            <button className="btn btn-ghost btn-sm" style={{ color:'var(--accent)' }} onClick={()=>onNavigate('budget')}>Manage</button>
          </div>
          {!(s?.budgets?.length)
            ? <div className="empty-state" style={{ padding:'20px 0' }}>
                <div className="empty-state-icon">◎</div>
                <div className="empty-state-text">No budgets set</div>
              </div>
            : <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {(s.budgets||[]).slice(0,4).map(b => {
                  const limit = b.effective_amount||0;
                  const pct   = limit>0?Math.min(100,((b.spent||0)/limit)*100):0;
                  return (
                    <div key={b.id}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span style={{ fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                          {b.name}
                          {b.budget_type==='percent' && (
                            <span style={{ fontSize:10, color:'var(--accent)', fontWeight:700, background:'rgba(255,107,53,0.12)', padding:'1px 6px', borderRadius:99 }}>
                              {b.percent_of_income}%
                            </span>
                          )}
                        </span>
                        <span style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)' }}>
                          {fmt(b.spent||0)}/{fmt(limit)}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className={`progress-fill ${pct>=90?'danger':pct>=70?'warning':'success'}`} style={{ width:pct+'%' }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>
      </div>

      {/* Trending Report */}
      <TrendChart />

    </div>
  );
}
