// src/pages/Reports.jsx — beautiful charts
import { useMemo } from 'react';
import { useTransactions, useCategories, useVehicles, useVehicleExpenses } from '../hooks/useData';

const fmt = n => new Intl.NumberFormat('en-US').format(Math.abs(Number(n)||0));

// ── Bar Chart ─────────────────────────────────────────────────
function BarChart({ data, maxVal, colorIncome, colorExpense }) {
  const W = 560, H = 100;
  const barW = 28, gap = (W - data.length * barW * 2 - 20) / (data.length - 1 || 1);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H+30}`} style={{ overflow:'visible' }}>
      {data.map((d, i) => {
        const x = 10 + i * (barW * 2 + gap);
        const incH = maxVal>0 ? (d.income/maxVal)*(H-10) : 0;
        const expH = maxVal>0 ? (d.expense/maxVal)*(H-10) : 0;
        return (
          <g key={i}>
            {/* Income bar */}
            <rect x={x} y={H-incH} width={barW} height={Math.max(incH,2)}
              rx="4" fill={colorIncome} opacity="0.85"/>
            {/* Expense bar */}
            <rect x={x+barW+2} y={H-expH} width={barW} height={Math.max(expH,2)}
              rx="4" fill={colorExpense} opacity="0.85"/>
            {/* Month label */}
            <text x={x+barW+1} y={H+18} textAnchor="middle"
              fill="var(--text3)" fontSize="9"
              fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight="700">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Category Row ──────────────────────────────────────────────
function CatRow({ name, icon, amount, maxAmt, color, i }) {
  const pct = maxAmt > 0 ? (amount/maxAmt)*100 : 0;
  const COLORS = ['var(--accent)','var(--green)','var(--blue)','var(--purple)','var(--pink)','var(--teal)','var(--amber)','var(--red)'];
  const c = color || COLORS[i % COLORS.length];
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, alignItems:'center' }}>
        <span style={{ fontSize:13, fontWeight:700 }}>{icon} {name}</span>
        <span style={{ fontSize:12, fontFamily:'var(--mono)', color:'var(--text2)' }}>K {fmt(amount)}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width:pct+'%', background:c }}/>
      </div>
    </div>
  );
}

export default function Reports() {
  const { data:transactions }       = useTransactions();
  const { data:categories }         = useCategories();
  const { data:vehicles }           = useVehicles();
  const { data:allVehicleExpenses } = useVehicleExpenses();

  const now      = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

  const catMap     = useMemo(()=>Object.fromEntries(categories.map(c=>[c.id,c])),[categories]);
  const vehicleMap = useMemo(()=>Object.fromEntries(vehicles.map(v=>[v.id,v])),[vehicles]);

  const monthTx    = transactions.filter(t=>t.date?.startsWith(monthStr));
  const monthInc   = monthTx.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0);
  const monthExp   = monthTx.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0);

  const catBreakdown = useMemo(()=>{
    const map={};
    monthTx.filter(t=>t.type==='expense').forEach(t=>{
      const key = t.category_id||t.category?.id||'unk';
      map[key]=(map[key]||0)+Number(t.amount);
    });
    return Object.entries(map)
      .map(([id,amount])=>({id,amount,cat:catMap[id]}))
      .sort((a,b)=>b.amount-a.amount);
  },[monthTx,catMap]);

  const maxCat = catBreakdown[0]?.amount||1;

  const monthlyTrend = useMemo(()=>{
    return Array.from({length:6},(_,i)=>{
      const d   = new Date(now.getFullYear(),now.getMonth()-5+i,1);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const inc = transactions.filter(t=>t.type==='income'  && t.date?.startsWith(key)).reduce((s,t)=>s+Number(t.amount),0);
      const exp = transactions.filter(t=>t.type==='expense' && t.date?.startsWith(key)).reduce((s,t)=>s+Number(t.amount),0);
      return {key, label:d.toLocaleString('en-US',{month:'short'}), income:inc, expense:exp};
    });
  },[transactions]);

  const maxTrend = Math.max(...monthlyTrend.flatMap(m=>[m.income,m.expense]),1);

  const vehicleSummary = useMemo(()=>{
    const map={};
    allVehicleExpenses.forEach(e=>{
      const vid=e.vehicle_id;
      if(!map[vid]) map[vid]={total:0,fuel:0,service:0,other:0};
      map[vid].total+=Number(e.amount);
      if(e.expense_type==='Fuel') map[vid].fuel+=Number(e.amount);
      else if(e.expense_type==='Service') map[vid].service+=Number(e.amount);
      else map[vid].other+=Number(e.amount);
    });
    return Object.entries(map)
      .map(([vid,s])=>({vid,...s,vehicle:vehicleMap[vid]}))
      .filter(v=>v.vehicle).sort((a,b)=>b.total-a.total);
  },[allVehicleExpenses,vehicleMap]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Reports</div>
          <div className="page-subtitle">{now.toLocaleString('en-US',{month:'long',year:'numeric'})}</div>
        </div>
      </div>

      {/* This month stats */}
      <div className="grid-3" style={{ marginBottom:20 }}>
        <div className="stat-card">
          <div className="stat-label">Income</div>
          <div className="stat-value positive">+K {fmt(monthInc)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Expenses</div>
          <div className="stat-value negative">-K {fmt(monthExp)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net</div>
          <div className={`stat-value ${monthInc-monthExp>=0?'positive':'negative'}`}>
            {monthInc-monthExp>=0?'+':'-'}K {fmt(monthInc-monthExp)}
          </div>
        </div>
      </div>

      {/* 6-Month Bar Chart */}
      <div className="card" style={{ marginBottom:16 }}>
        <div className="section-header">
          <div className="section-title">6-Month Overview</div>
          <div style={{ display:'flex', gap:12, fontSize:12, color:'var(--text2)', fontWeight:600 }}>
            <span style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:10,height:10,background:'var(--green)',borderRadius:3,display:'inline-block' }}/>Income
            </span>
            <span style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:10,height:10,background:'var(--red)',borderRadius:3,display:'inline-block' }}/>Expense
            </span>
          </div>
        </div>
        <BarChart data={monthlyTrend} maxVal={maxTrend} colorIncome="var(--green)" colorExpense="var(--red)"/>

        {/* Avg row */}
        <div style={{ display:'flex', gap:12, marginTop:16 }}>
          {[
            { label:'Avg Income',  val:monthlyTrend.reduce((s,m)=>s+m.income,0)/(monthlyTrend.length||1),  color:'var(--green)' },
            { label:'Avg Expense', val:monthlyTrend.reduce((s,m)=>s+m.expense,0)/(monthlyTrend.length||1), color:'var(--red)' },
          ].map(item=>(
            <div key={item.label} style={{ flex:1, background:'var(--bg3)', borderRadius:10, padding:'12px 14px' }}>
              <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.9px', color:'var(--text3)', marginBottom:5 }}>{item.label}</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:17, color:item.color }}>K {fmt(item.val)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom:16 }}>
        {/* Category breakdown */}
        <div className="card">
          <div className="section-title" style={{ marginBottom:16 }}>Spending by Category</div>
          {catBreakdown.length===0
            ? <div className="empty-state" style={{ padding:'20px 0' }}><div className="empty-state-text">No expenses this month</div></div>
            : catBreakdown.slice(0,7).map(({id,amount,cat},i)=>(
                <CatRow key={id} name={cat?.name||'Others'} icon={cat?.icon||'📦'}
                  amount={amount} maxAmt={maxCat} i={i} />
              ))
          }
        </div>

        {/* Savings summary */}
        <div className="card">
          <div className="section-title" style={{ marginBottom:16 }}>Income vs Expense</div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {monthlyTrend.map((m,i)=>{
              const net   = m.income - m.expense;
              const isPos = net >= 0;
              const pct   = m.income > 0 ? Math.min(100,(m.expense/m.income)*100) : 0;
              return (
                <div key={i}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:13, fontWeight:700 }}>{m.label}</span>
                    <span style={{ fontSize:12, fontFamily:'var(--mono)', color:isPos?'var(--green)':'var(--red)', fontWeight:500 }}>
                      {isPos?'+':'-'}K {fmt(net)}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill ${pct>=90?'danger':pct>=70?'warning':'success'}`}
                      style={{ width:pct+'%' }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vehicle costs */}
      {vehicleSummary.length>0 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom:16 }}>Vehicle Cost Summary</div>
          {vehicleSummary.map(v=>(
            <div key={v.vid} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontSize:26 }}>🚗</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{v.vehicle.name}</div>
                <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>
                  Fuel: K {fmt(v.fuel)} · Service: K {fmt(v.service)} · Other: K {fmt(v.other)}
                </div>
              </div>
              <div style={{ fontFamily:'var(--mono)', fontSize:17, color:'var(--amber)', fontWeight:500 }}>K {fmt(v.total)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
