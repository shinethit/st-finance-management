// src/pages/Budget.jsx — Budgets only (Categories moved to Categories page)
import { useState } from 'react';
import { useLang } from '../lib/LangContext';
import { useBudgets, useCategories, useTransactions } from '../hooks/useData';

const fmt = n => new Intl.NumberFormat('en-US').format(Math.abs(Number(n)||0));

function BudgetModal({ onClose, onSave, categories, monthIncome, initial }) {
  const { t } = useLang();
  const [form, setForm] = useState({
    name:'', category_id:'', budget_type:'fixed',
    amount:'', percent_of_income:'', period:'monthly',
    ...initial,
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const expCats   = categories.filter(c=>c.type==='expense');
  const isPercent = form.budget_type === 'percent';
  const effectiveAmt = isPercent && form.percent_of_income && monthIncome
    ? (monthIncome * Number(form.percent_of_income) / 100).toFixed(0) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{initial?.id?t('edit'):'New'} Budget</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">{t('budget_name')}</label>
            <input className="form-input" placeholder="e.g. Food, Donation"
              value={form.name} onChange={e=>set('name',e.target.value)} autoFocus />
          </div>

          <div className="form-group">
            <label className="form-label">{t('category')} (optional)</label>
            <select className="form-select" value={form.category_id}
              onChange={e=>set('category_id',e.target.value)}>
              <option value="">— All expenses —</option>
              {expCats.filter(c=>!c.parent_id).map(p => {
                const subs = expCats.filter(s=>s.parent_id===p.id);
                return subs.length > 0 ? (
                  <optgroup key={p.id} label={`${p.icon} ${p.name}`}>
                    <option value={p.id}>{p.icon} {p.name} (all)</option>
                    {subs.map(s=><option key={s.id} value={s.id}>　↳ {s.icon} {s.name}</option>)}
                  </optgroup>
                ) : <option key={p.id} value={p.id}>{p.icon} {p.name}</option>;
              })}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t('budget_type')}</label>
            <div className="type-toggle">
              <button className={`type-btn expense ${!isPercent?'active':''}`}
                onClick={()=>set('budget_type','fixed')}>{t('budget_fixed')}</button>
              <button className={`type-btn income ${isPercent?'active':''}`}
                onClick={()=>set('budget_type','percent')}>% of Income</button>
            </div>
          </div>

          {!isPercent ? (
            <div className="form-group">
              <label className="form-label">{t('amount')}</label>
              <input className="form-input" type="number" placeholder="0"
                value={form.amount} onChange={e=>set('amount',e.target.value)} />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">{t('budget_percent')}</label>
              <div style={{ position:'relative' }}>
                <input className="form-input" type="number" step="0.1" min="0" max="100"
                  placeholder="e.g. 30" value={form.percent_of_income}
                  onChange={e=>set('percent_of_income',e.target.value)}
                  style={{ paddingRight:36 }} />
                <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  color:'var(--text3)', fontSize:13 }}>%</span>
              </div>
              {effectiveAmt && (
                <div style={{ fontSize:12, color:'var(--accent2)', marginTop:5 }}>
                  = K {fmt(effectiveAmt)} (this month)
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">{t('period')}</label>
            <select className="form-select" value={form.period}
              onChange={e=>set('period',e.target.value)}>
              <option value="monthly">{t('monthly')}</option>
              <option value="weekly">{t('weekly')}</option>
              <option value="yearly">{t('yearly')}</option>
            </select>
          </div>

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
            <button className="btn btn-primary" onClick={()=>{
              if(!form.name) return;
              if(isPercent && !form.percent_of_income) return;
              if(!isPercent && !form.amount) return;
              onSave({
                ...form,
                amount: isPercent ? null : Number(form.amount),
                percent_of_income: isPercent ? Number(form.percent_of_income) : null,
              });
              onClose();
            }}>{t('save')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Budget() {
  const { t } = useLang();
  const { data: budgets, monthIncome, save: saveBudget, del: delBudget } = useBudgets();
  const { data: categories } = useCategories();
  const { data: transactions } = useTransactions();
  const [budgetModal, setBudgetModal] = useState(null);

  const totalPercent = budgets
    .filter(b=>b.budget_type==='percent' && b.percent_of_income)
    .reduce((s,b)=>s+Number(b.percent_of_income),0);
  const totalEffective = budgets.reduce((s,b)=>s+(b.effective_amount||0),0);

  const getBudgetSpent = (b) => {
    const thisMonth = new Date().toISOString().slice(0,7);
    return transactions
      .filter(tx =>
        tx.type==='expense' &&
        tx.date?.startsWith(thisMonth) &&
        (!b.category_id || tx.category_id===b.category_id)
      )
      .reduce((s,tx)=>s+Number(tx.amount),0);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">{t('budgets')}</div>
          <div className="page-subtitle">{t('monthly')} budgets</div>
        </div>
        <button className="btn btn-primary" onClick={()=>setBudgetModal({})}>
          + Budget
        </button>
      </div>

      {/* Income allocation bar */}
      {totalPercent > 0 && monthIncome > 0 && (
        <div className="card" style={{ marginBottom:16, padding:'14px 16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:13 }}>
            <span style={{ color:'var(--text2)' }}>Income allocated to budgets</span>
            <span style={{ fontFamily:'var(--mono)',
              color: totalPercent > 100 ? 'var(--red)' : 'var(--accent2)' }}>
              {totalPercent.toFixed(1)}%
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill"
              style={{ width:Math.min(100,totalPercent)+'%',
                background: totalPercent>100?'var(--red)':totalPercent>80?'var(--amber)':'var(--accent)' }} />
          </div>
          <div style={{ fontSize:11, color:'var(--text3)', marginTop:6 }}>
            {(100-totalPercent).toFixed(1)}% unallocated · K {fmt(monthIncome-totalEffective)} remaining
          </div>
        </div>
      )}

      {budgets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">◎</div>
          <div className="empty-state-text">No budgets yet</div>
          <div style={{ fontSize:12, color:'var(--text3)', marginTop:6 }}>
            + Budget နှိပ်ပြီး ထည့်ပါ
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {budgets.map(b => {
            const spent   = getBudgetSpent(b);
            const limit   = b.effective_amount || 0;
            const pct     = limit>0 ? Math.min(100,(spent/limit)*100) : 0;
            const cls     = pct>=90?'danger':pct>=70?'warning':'success';
            const isPercent = b.budget_type==='percent';
            return (
              <div key={b.id} className="card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontWeight:600, fontSize:15 }}>{b.name}</span>
                      {isPercent && (
                        <span style={{ fontSize:11, color:'var(--accent2)', background:'rgba(247,147,30,0.12)',
                          padding:'2px 8px', borderRadius:99 }}>
                          {b.percent_of_income}%
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize:12, color:'var(--text3)', marginTop:3 }}>
                      {b.category?.icon} {b.category?.name || 'All expenses'} · {b.period}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:4 }}>
                    <button className="btn btn-ghost btn-icon btn-sm"
                      onClick={()=>setBudgetModal(b)}>✎</button>
                    <button className="btn btn-ghost btn-icon btn-sm"
                      style={{ color:'var(--red)' }}
                      onClick={()=>delBudget(b.id)}>✕</button>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8 }}>
                  <span>K {fmt(spent)} <span style={{ color:'var(--text3)' }}>spent</span></span>
                  <span style={{ color:'var(--text3)' }}>K {fmt(limit)} limit</span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${cls}`} style={{ width:pct+'%' }} />
                </div>
                <div style={{ fontSize:12, color:'var(--text3)', marginTop:6 }}>
                  {pct>=100 ? '⚠ Over budget' : `K ${fmt(limit-spent)} remaining`}
                  {isPercent && monthIncome===0 && ' · Add income to see amount'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {budgetModal!==null && (
        <BudgetModal onClose={()=>setBudgetModal(null)} onSave={saveBudget}
          categories={categories} monthIncome={monthIncome} initial={budgetModal} />
      )}
    </div>
  );
}
