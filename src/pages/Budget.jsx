// src/pages/Budget.jsx — v3 (% of income support)
import { useState } from 'react';
import { useBudgets, useCategories, useTransactions } from '../hooks/useData';
import { useLang } from '../lib/LangContext';

const fmt = n => new Intl.NumberFormat('en-US').format(Math.abs(Number(n)||0));

function BudgetModal({ onClose, onSave, categories, monthIncome, initial }) {
  const [form, setForm] = useState({
    name: '', category_id: '', budget_type: 'fixed',
    amount: '', percent_of_income: '', period: 'monthly',
    ...initial,
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const expCats = categories.filter(c=>c.type==='expense');
  const isPercent = form.budget_type === 'percent';

  const effectiveAmt = isPercent && form.percent_of_income && monthIncome
    ? (monthIncome * Number(form.percent_of_income) / 100).toFixed(0)
    : null;

  const handleSubmit = () => {
    if (!form.name) return;
    if (isPercent && !form.percent_of_income) return;
    if (!isPercent && !form.amount) return;
    onSave({
      ...form,
      amount: isPercent ? null : Number(form.amount),
      percent_of_income: isPercent ? Number(form.percent_of_income) : null,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{initial?.id?'Edit':'New'} Budget</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">Budget Name</label>
            <input className="form-input" placeholder="e.g. Food, Donation" value={form.name}
              onChange={e=>set('name',e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Category (optional)</label>
            <select className="form-select" value={form.category_id} onChange={e=>set('category_id',e.target.value)}>
              <option value="">— All expenses —</option>
              {expCats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          {/* Budget type toggle */}
          <div className="form-group">
            <label className="form-label">Budget Type</label>
            <div className="type-toggle">
              <button className={`type-btn expense ${!isPercent?'active':''}`} onClick={()=>set('budget_type','fixed')}>
                Fixed Amount
              </button>
              <button className={`type-btn income ${isPercent?'active':''}`} onClick={()=>set('budget_type','percent')}>
                % of Income
              </button>
            </div>
          </div>

          {!isPercent ? (
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input className="form-input" type="number" placeholder="0" value={form.amount}
                onChange={e=>set('amount',e.target.value)} />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Percentage of Monthly Income</label>
              <div style={{ position:'relative' }}>
                <input className="form-input" type="number" step="0.1" min="0" max="100"
                  placeholder="e.g. 5" value={form.percent_of_income}
                  onChange={e=>set('percent_of_income',e.target.value)}
                  style={{ paddingRight: 36 }} />
                <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', fontSize:13 }}>%</span>
              </div>
              {effectiveAmt && (
                <div style={{ fontSize:12, color:'var(--accent2)', marginTop:5 }}>
                  = {fmt(effectiveAmt)} (based on this month's income of {fmt(monthIncome)})
                </div>
              )}
              {!monthIncome && (
                <div style={{ fontSize:12, color:'var(--text3)', marginTop:5 }}>
                  Amount will calculate automatically based on each month's income.
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Period</label>
            <select className="form-select" value={form.period} onChange={e=>set('period',e.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState({ name:'', icon:'📦', color:'#7c6aff', type:'expense', ...initial });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const ICONS = ['🍜','🚗','🛍️','💊','💡','🎮','📚','✈️','🏠','💅','🐶','🎵','⚽','🎂','💐','🔧','🎓','💻','📦','🤲'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{initial?.id?'Edit':'New'} Category</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">
          <div className="type-toggle">
            <button className={`type-btn expense ${form.type==='expense'?'active':''}`} onClick={()=>set('type','expense')}>Expense</button>
            <button className={`type-btn income  ${form.type==='income' ?'active':''}`} onClick={()=>set('type','income')}>Income</button>
          </div>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" placeholder="e.g. Coffee" value={form.name} onChange={e=>set('name',e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {ICONS.map(ic=>(
                <button key={ic} onClick={()=>set('icon',ic)}
                  style={{ width:38,height:38,borderRadius:8,border:`2px solid ${form.icon===ic?'var(--accent)':'var(--border)'}`,background:'var(--bg3)',cursor:'pointer',fontSize:18 }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={()=>{ if(!form.name)return; onSave(form); onClose(); }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Budget() {
  const { data: budgets, monthIncome, save: saveBudget, del: delBudget } = useBudgets();
  const { data: categories, saveCategory, del: delCategory } = useCategories();
  const { data: transactions } = useTransactions();
  const [budgetModal, setBudgetModal] = useState(null);
  const [catModal, setCatModal]       = useState(null);
  const [tab, setTab]                 = useState('budgets');

  const now      = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

  const getBudgetSpent = b =>
    transactions
      .filter(t => t.type==='expense' && t.date?.startsWith(monthStr) &&
        (!b.category_id || t.category_id===b.category_id))
      .reduce((s,t)=>s+Number(t.amount),0);

  const customCats = categories.filter(c=>c.is_custom);

  // Total budget allocation summary
  const totalFixed   = budgets.filter(b=>b.budget_type==='fixed').reduce((s,b)=>s+Number(b.amount||0),0);
  const totalPercent = budgets.filter(b=>b.budget_type==='percent').reduce((s,b)=>s+Number(b.percent_of_income||0),0);
  const totalEffective = budgets.reduce((s,b)=>s+Number(b.effective_amount||0),0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Budget & Categories</div>
          <div className="page-subtitle">
            {monthIncome > 0
              ? `This month income: ${fmt(monthIncome)} · Budgeted: ${fmt(totalEffective)} (${totalPercent > 0 ? totalPercent.toFixed(1)+'% allocated' : ''})`
              : 'Plan your spending'}
          </div>
        </div>
        <button className="btn btn-primary" onClick={()=>tab==='budgets'?setBudgetModal({}):setCatModal({})}>
          + {tab==='budgets'?'Budget':'Category'}
        </button>
      </div>

      {/* Summary bar — only show if % budgets exist */}
      {totalPercent > 0 && monthIncome > 0 && (
        <div className="card" style={{ marginBottom:20, padding:'14px 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:13 }}>
            <span style={{ color:'var(--text2)' }}>Income allocated to budgets</span>
            <span style={{ fontFamily:'var(--mono)', color: totalPercent > 100 ? 'var(--red)' : 'var(--accent2)' }}>
              {totalPercent.toFixed(1)}%
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width:Math.min(100,totalPercent)+'%', background: totalPercent>100?'var(--red)':totalPercent>80?'var(--amber)':'var(--accent)' }} />
          </div>
          <div style={{ fontSize:11, color:'var(--text3)', marginTop:6 }}>
            {(100-totalPercent).toFixed(1)}% unallocated · {fmt(monthIncome - totalEffective)} remaining
          </div>
        </div>
      )}

      <div className="type-toggle" style={{ marginBottom:20, maxWidth:280 }}>
        <button className={`type-btn expense ${tab==='budgets'?'active':''}`} onClick={()=>setTab('budgets')}>Budgets</button>
        <button className={`type-btn income  ${tab==='categories'?'active':''}`} onClick={()=>setTab('categories')}>Categories</button>
      </div>

      {tab==='budgets' && (
        budgets.length===0
          ? <div className="empty-state"><div className="empty-state-icon">◎</div><div className="empty-state-text">No budgets yet. Try adding a % of income budget!</div></div>
          : <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {budgets.map(b=>{
                const spent    = getBudgetSpent(b);
                const limit    = b.effective_amount || 0;
                const pct      = limit > 0 ? Math.min(100,(spent/limit)*100) : 0;
                const cls      = pct>=90?'danger':pct>=70?'warning':'success';
                const isPercent = b.budget_type === 'percent';
                return (
                  <div key={b.id} className="card">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontWeight:500, fontSize:15 }}>{b.name}</span>
                          {isPercent && (
                            <span className="badge badge-info" style={{ fontSize:10 }}>
                              {b.percent_of_income}% of income
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{b.period}</div>
                      </div>
                      <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                        <span style={{ fontFamily:'var(--mono)', fontSize:13, color:'var(--text2)' }}>
                          {fmt(spent)} / {fmt(limit)}
                        </span>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>setBudgetModal(b)}>✎</button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--red)' }} onClick={()=>delBudget(b.id)}>✕</button>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div className={`progress-fill ${cls}`} style={{ width:pct+'%' }} />
                    </div>
                    <div style={{ fontSize:12, color:'var(--text3)', marginTop:6 }}>
                      {pct>=100 ? '⚠ Over budget' : `${fmt(limit-spent)} remaining`}
                      {isPercent && monthIncome===0 && ' · Add income to see amount'}
                    </div>
                  </div>
                );
              })}
            </div>
      )}

      {tab==='categories' && (
        <div>
          <div style={{ fontSize:12, color:'var(--text3)', marginBottom:12 }}>Custom categories — your own additions.</div>
          {customCats.length===0
            ? <div className="empty-state"><div className="empty-state-icon">◈</div><div className="empty-state-text">No custom categories yet.</div></div>
            : <div className="grid-3">
                {customCats.filter(c=>!c.parent_id).map(c=>(
                  <div key={c.id} className="card" style={{ padding:0, overflow:'hidden' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px' }}>
                      <div style={{ fontSize:24,width:40,height:40,borderRadius:10,background:'var(--bg3)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                        {c.icon}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:500 }}>{c.name}</div>
                        <div className={`badge badge-${c.type}`}>{c.type}</div>
                      </div>
                      <div style={{ display:'flex', gap:4 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>setCatModal(c)}>✎</button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--red)' }} onClick={()=>delCategory(c.id)}>✕</button>
                      </div>
                    </div>
                    {customCats.filter(s=>s.parent_id===c.id).map(s=>(
                      <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 14px 9px 32px', borderTop:'1px solid var(--border)', background:'var(--bg3)' }}>
                        <span style={{ fontSize:11, color:'var(--text3)' }}>↳</span>
                        <div style={{ width:26,height:26,borderRadius:7,background:s.color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14 }}>{s.icon}</div>
                        <div style={{ flex:1, fontSize:13, fontWeight:500 }}>{s.name}</div>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>setCatModal(s)}>✎</button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--red)' }} onClick={()=>delCategory(s.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {budgetModal!==null && (
        <BudgetModal onClose={()=>setBudgetModal(null)} onSave={saveBudget}
          categories={categories} monthIncome={monthIncome} initial={budgetModal} />
      )}
      {catModal!==null && (
        <CategoryModal onClose={()=>setCatModal(null)} onSave={saveCategory} initial={catModal} categories={categories} />
      )}
    </div>
  );
}
