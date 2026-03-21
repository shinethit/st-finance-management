// src/pages/Debts.jsx — v3 fixed labels: I Lent / I Borrowed
import { useState } from 'react';
import { useDebts } from '../hooks/useData';

const fmt = n => new Intl.NumberFormat('en-US').format(Math.abs(Number(n)||0));
const today = () => new Date().toISOString().slice(0,10);

// ── Add/Edit Modal ────────────────────────────────────────────
function DebtModal({ onClose, onSave, initial }) {
  const { t } = useLang();
  const [form, setForm] = useState({
    direction: 'lend',
    contact_name: '', contact_phone: '',
    total_amount: '', interest_rate: '0',
    due_date: '', note: '',
    ...initial,
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const isLend = form.direction === 'lend';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{initial?.id?t('edit'):'New'} Debt / Loan</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">

          {/* Direction — big clear toggle */}
          <div className="type-toggle">
            <button className={`type-btn income ${isLend?'active':''}`} onClick={()=>set('direction','lend')}>
              💸 I Lent (ငါ ပေးချေး)
            </button>
            <button className={`type-btn expense ${!isLend?'active':''}`} onClick={()=>set('direction','borrow')}>
              🤲 I Borrowed (ငါ ယူချေး)
            </button>
          </div>

          {/* Context hint */}
          <div style={{ background:'var(--bg3)', borderRadius:'var(--radius-sm)', padding:'10px 14px', fontSize:12, color:'var(--text2)', fontWeight:500 }}>
            {isLend
              ? '💸 သူများကို ငွေချေးပေးတယ် — ပြန်ရမဲ့ ငွေ'
              : '🤲 သူများဆီကနေ ငွေချေးယူတယ် — ပြန်ပေးရမဲ့ ငွေ'
            }
          </div>

          <div className="form-group">
            <label className="form-label">{isLend?'Borrower':'Lender'} Name</label>
            <input className="form-input" placeholder="Contact name"
              value={form.contact_name} onChange={e=>set('contact_name',e.target.value)} autoFocus />
          </div>

          <div className="form-group">
            <label className="form-label">Phone (optional)</label>
            <input className="form-input" placeholder="+95 9xxx"
              value={form.contact_phone} onChange={e=>set('contact_phone',e.target.value)} />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t('amount')}</label>
              <input className="form-input" type="number" placeholder="0"
                value={form.total_amount} onChange={e=>set('total_amount',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Interest % / month</label>
              <input className="form-input" type="number" step="0.1" placeholder="0"
                value={form.interest_rate} onChange={e=>set('interest_rate',e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Due Date (optional)</label>
            <input className="form-input" type="date" value={form.due_date}
              onChange={e=>set('due_date',e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">{t('note')}</label>
            <textarea className="form-textarea" placeholder="Purpose, terms…"
              value={form.note} onChange={e=>set('note',e.target.value)} />
          </div>

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={()=>{
              if(!form.contact_name||!form.total_amount) return;
              onSave({...form, total_amount:Number(form.total_amount), interest_rate:Number(form.interest_rate||0)});
              onClose();
            }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Payment Modal ─────────────────────────────────────────────
function PaymentModal({ debt, onClose, onPay }) {
  const { t } = useLang();
  const [amount, setAmount] = useState('');
  const [note, setNote]     = useState('');
  const remaining = Number(debt.total_amount) - Number(debt.paid_amount);
  const isLend    = debt.direction === 'lend';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{ maxWidth:380 }}>
        <div className="modal-header">
          <div className="modal-title">{t('record_payment')}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">
          <div style={{ background:'var(--bg3)', borderRadius:'var(--radius-sm)', padding:'12px 14px', fontSize:13 }}>
            <div style={{ fontWeight:700 }}>
              {isLend ? '💸 Receiving from' : '🤲 Paying to'}: <span style={{ color:'var(--accent2)' }}>{debt.contact_name}</span>
            </div>
            <div style={{ color:'var(--text3)', marginTop:4, fontFamily:'var(--mono)', fontSize:12 }}>
              Remaining: K {fmt(remaining)}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('amount')}</label>
            <input className="form-input" type="number" placeholder="0" value={amount}
              onChange={e=>setAmount(e.target.value)} autoFocus />
          </div>

          {/* Quick % buttons */}
          <div style={{ display:'flex', gap:6 }}>
            {[25,50,75,100].map(pct=>(
              <button key={pct} className="btn btn-secondary btn-sm" style={{ flex:1 }}
                onClick={()=>setAmount(Math.round(remaining*pct/100))}>
                {pct}%
              </button>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">{t('note')}</label>
            <input className="form-input" placeholder="Optional" value={note}
              onChange={e=>setNote(e.target.value)} />
          </div>

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={()=>{
              if(!amount) return;
              onPay(debt.id, Number(amount), note);
              onClose();
            }}>
              {isLend ? 'Record Receipt' : t('record_payment')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Debt Card ─────────────────────────────────────────────────
function DebtCard({ debt, onEdit, onDelete, onPay }) {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(false);
  const remaining = Number(debt.total_amount) - Number(debt.paid_amount);
  const pct       = Math.min(100,(Number(debt.paid_amount)/Number(debt.total_amount))*100);
  const isLend    = debt.direction === 'lend';
  const settled   = debt.status === 'settled';
  const now       = new Date();
  const overdue   = debt.due_date && new Date(debt.due_date) < now && !settled;

  return (
    <div className="card" style={{ borderColor: overdue?'rgba(255,77,114,0.3)':settled?'rgba(0,212,140,0.2)':'var(--border)' }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
        {/* Icon */}
        <div style={{
          width:46, height:46, borderRadius:14, flexShrink:0,
          background: isLend ? 'var(--blue-bg)' : 'var(--red-bg)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:22,
        }}>
          {isLend ? '💸' : '🤲'}
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          {/* Name + badges */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
            <span style={{ fontWeight:700, fontSize:15 }}>{debt.contact_name}</span>
            <span className="badge" style={{
              background: isLend ? 'var(--blue-bg)' : 'var(--red-bg)',
              color: isLend ? 'var(--blue)' : 'var(--red)',
            }}>
              {isLend ? 'I Lent' : 'I Borrowed'}
            </span>
            {settled && <span className="badge badge-income">✓ Settled</span>}
            {overdue && <span className="badge badge-expense">{t('overdue')}</span>}
          </div>

          {debt.contact_phone && (
            <div style={{ fontSize:12, color:'var(--text3)', marginBottom:6 }}>{debt.contact_phone}</div>
          )}

          {/* Amounts */}
          <div style={{ display:'flex', gap:20, marginBottom:10 }}>
            <div>
              <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:3 }}>{t('total')}</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:17, fontWeight:500 }}>K {fmt(debt.total_amount)}</div>
            </div>
            <div>
              <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:3 }}>{t('paid')}</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:17, color:'var(--green)' }}>K {fmt(debt.paid_amount)}</div>
            </div>
            <div>
              <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:3 }}>{t('left')}</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:17, color: settled?'var(--green)':'var(--red)' }}>
                {settled ? '—' : `K ${fmt(remaining)}`}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="progress-bar" style={{ marginBottom:8 }}>
            <div className="progress-fill" style={{
              width:pct+'%',
              background: settled ? 'var(--green)' : isLend ? 'var(--blue)' : 'var(--red)',
            }}/>
          </div>

          {/* Footer row */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontSize:12, color:'var(--text3)' }}>
              {debt.due_date && `Due: ${debt.due_date}`}
              {debt.interest_rate>0 && ` · ${debt.interest_rate}%/mo`}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={()=>setExpanded(!expanded)}>
              {expanded?'▲ Less':'▼ Details'}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)' }}>
          {debt.note && (
            <div style={{ fontSize:13, color:'var(--text2)', marginBottom:12, fontStyle:'italic', background:'var(--bg3)', padding:'10px 14px', borderRadius:'var(--radius-sm)' }}>
              "{debt.note}"
            </div>
          )}

          {/* Payment history */}
          {debt.payments?.length > 0 && (
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:8 }}>
                Payment History
              </div>
              {debt.payments.map(p=>(
                <div key={p.id} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'7px 12px', background:'var(--bg3)', borderRadius:8, marginBottom:3 }}>
                  <span style={{ color:'var(--text2)' }}>{p.date}{p.note?` · ${p.note}`:''}</span>
                  <span style={{ fontFamily:'var(--mono)', color:'var(--green)', fontWeight:500 }}>+K {fmt(p.amount)}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {!settled && (
              <button className="btn btn-primary btn-sm" onClick={()=>onPay(debt)}>
                {isLend ? '+ Record Receipt' : '+ Record Payment'}
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={()=>onEdit(debt)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={()=>onDelete(debt.id)}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Debts Page ───────────────────────────────────────────
export default function Debts() {
  const { t } = useLang();
  const { data:debts, loading, save, del, addPayment } = useDebts();
  const [modal, setModal]       = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [tab, setTab]           = useState('active');

  const active  = debts.filter(d=>d.status!=='settled');
  const settled = debts.filter(d=>d.status==='settled');
  const shown   = tab==='active' ? active : settled;

  const totalLent     = active.filter(d=>d.direction==='lend').reduce((s,d)=>s+Number(d.total_amount)-Number(d.paid_amount),0);
  const totalBorrowed = active.filter(d=>d.direction==='borrow').reduce((s,d)=>s+Number(d.total_amount)-Number(d.paid_amount),0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">{t('debts')}</div>
          <div className="page-subtitle">{active.length} active · {settled.length} settled</div>
        </div>
        <button className="btn btn-primary" onClick={()=>setModal({})}>+ New</button>
      </div>

      {/* Summary */}
      <div className="grid-2" style={{ marginBottom:20 }}>
        <div className="stat-card" style={{ borderColor:'rgba(90,168,255,0.22)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <span style={{ fontSize:20 }}>💸</span>
            <div className="stat-label" style={{ marginBottom:0 }}>I Lent — To Receive</div>
          </div>
          <div className="stat-value" style={{ color:'var(--blue)' }}>+K {fmt(totalLent)}</div>
          <div className="stat-sub">{t('others_owe')}</div>
        </div>
        <div className="stat-card" style={{ borderColor:'rgba(255,77,114,0.22)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <span style={{ fontSize:20 }}>🤲</span>
            <div className="stat-label" style={{ marginBottom:0 }}>I Borrowed — To Pay</div>
          </div>
          <div className="stat-value negative">-K {fmt(totalBorrowed)}</div>
          <div className="stat-sub">{t('you_owe')}</div>
        </div>
      </div>

      {/* Tab */}
      <div className="type-toggle" style={{ marginBottom:20, maxWidth:260 }}>
        <button className={`type-btn income ${tab==='active'?'active':''}`} onClick={()=>setTab('active')}>
          Active ({active.length})
        </button>
        <button className={`type-btn expense ${tab==='settled'?'active':''}`} onClick={()=>setTab('settled')}>
          Settled ({settled.length})
        </button>
      </div>

      {loading
        ? <div className="empty-state"><div className="empty-state-text">Loading…</div></div>
        : shown.length===0
          ? <div className="empty-state">
              <div className="empty-state-icon">{tab==='active'?'💸':'✓'}</div>
              <div className="empty-state-text">{tab==='active'?'No active debts or loans':'No settled debts yet'}</div>
            </div>
          : <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {shown.map(d=>(
                <DebtCard key={d.id} debt={d}
                  onEdit={setModal}
                  onDelete={del}
                  onPay={setPayModal}
                />
              ))}
            </div>
      }

      {modal!==null && <DebtModal onClose={()=>setModal(null)} onSave={save} initial={modal} />}
      {payModal!==null && <PaymentModal debt={payModal} onClose={()=>setPayModal(null)} onPay={addPayment} />}
    </div>
  );
}
