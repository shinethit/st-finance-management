// src/pages/Savings.jsx — Supabase version
import { useLang } from '../lib/LangContext';
import { useState } from 'react';
import { useSavings } from '../hooks/useData';

const fmt = n => new Intl.NumberFormat('en-US').format(Math.abs(Number(n)||0));
const ICONS  = ['🏠','🚗','✈️','💍','🎓','💻','📱','🏋️','🐶','🎸','🎯','💎'];
const COLORS = ['#7c6aff','#22c55e','#3b82f6','#f59e0b','#ef4444','#14b8a6','#ec4899','#8b5cf6'];

function SavingsModal({ onClose, onSave, initial }) {
  const { t } = useLang();
  const [form, setForm] = useState({
    name:'', target_amount:'', current_amount:'0',
    icon:'🎯', color:'#7c6aff', deadline:'',
    ...initial,
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{initial?.id?t('edit'):'New'} Savings Goal</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">{t('goal_name')}</label>
            <input className="form-input" placeholder="e.g. New Car" value={form.name} onChange={e=>set('name',e.target.value)} autoFocus />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t('target_amount')}</label>
              <input className="form-input" type="number" placeholder="0" value={form.target_amount} onChange={e=>set('target_amount',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('saved_so_far')}</label>
              <input className="form-input" type="number" placeholder="0" value={form.current_amount} onChange={e=>set('current_amount',e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Deadline (optional)</label>
            <input className="form-input" type="date" value={form.deadline} onChange={e=>set('deadline',e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('icon')}</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {ICONS.map(ic=>(
                <button key={ic} onClick={()=>set('icon',ic)}
                  style={{ width:38,height:38,borderRadius:8,border:`2px solid ${form.icon===ic?'var(--accent)':'var(--border)'}`,background:'var(--bg3)',cursor:'pointer',fontSize:18 }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('color')}</label>
            <div style={{ display:'flex', gap:6 }}>
              {COLORS.map(col=>(
                <button key={col} onClick={()=>set('color',col)}
                  style={{ width:28,height:28,borderRadius:99,border:`3px solid ${form.color===col?'white':'transparent'}`,background:col,cursor:'pointer' }} />
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={()=>{
              if(!form.name||!form.target_amount)return;
              onSave({...form,target_amount:Number(form.target_amount),current_amount:Number(form.current_amount)});
              onClose();
            }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddModal({ goal, onClose, onSave }) {
  const { t } = useLang();
  const [amount, setAmount] = useState('');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{ maxWidth:320 }}>
        <div className="modal-header">
          <div className="modal-title">Add to {goal.name}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">{t('amount_to_add')}</label>
            <input className="form-input" type="number" placeholder="0" value={amount} onChange={e=>setAmount(e.target.value)} autoFocus />
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={()=>{
              if(!amount)return;
              onSave({...goal, current_amount: Number(goal.current_amount)+Number(amount)});
              onClose();
            }}>{t('add')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Savings() {
  const { t } = useLang();
  const { data: goals, loading, save, del } = useSavings();
  const [modal, setModal]     = useState(null);
  const [addModal, setAddModal] = useState(null);

  const totalTarget = goals.reduce((s,g)=>s+Number(g.target_amount),0);
  const totalSaved  = goals.reduce((s,g)=>s+Number(g.current_amount),0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">{t('savings_goals')}</div>
          <div className="page-subtitle">{fmt(totalSaved)} saved of {fmt(totalTarget)} total</div>
        </div>
        <button className="btn btn-primary" onClick={()=>setModal({})}>+ New Goal</button>
      </div>

      {loading
        ? <div className="empty-state"><div className="empty-state-text">Loading…</div></div>
        : goals.length===0
          ? <div className="empty-state"><div className="empty-state-icon">◇</div><div className="empty-state-text">{t('no_savings')}</div></div>
          : <div className="grid-2">
              {goals.map(g=>{
                const pct  = Math.min(100,((Number(g.current_amount)/Number(g.target_amount))*100)||0);
                const left = Number(g.target_amount)-Number(g.current_amount);
                const done = pct>=100;
                return (
                  <div key={g.id} className="card">
                    <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                      <div style={{ width:50,height:50,borderRadius:14,background:g.color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0,border:`2px solid ${g.color}30` }}>
                        {g.icon}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, fontSize:15 }}>{g.name}</div>
                        {g.deadline && <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>Due: {g.deadline}</div>}
                      </div>
                      <div style={{ display:'flex', gap:4 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>setModal(g)}>✎</button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--red)' }} onClick={()=>del(g.id)}>✕</button>
                      </div>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <span style={{ fontFamily:'var(--mono)', fontSize:20, fontWeight:600 }}>{fmt(g.current_amount)}</span>
                      <span style={{ fontSize:13, color:'var(--text3)', alignSelf:'flex-end' }}>of {fmt(g.target_amount)}</span>
                    </div>
                    <div className="progress-bar" style={{ marginBottom:10 }}>
                      <div className="progress-fill" style={{ width:pct+'%', background:done?'var(--green)':g.color }} />
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:12, color:done?'var(--green)':'var(--text3)' }}>
                        {done?'✓ Goal reached!':`${fmt(left)} to go · ${pct.toFixed(0)}%`}
                      </span>
                      {!done && <button className="btn btn-secondary btn-sm" onClick={()=>setAddModal(g)}>+ Add</button>}
                    </div>
                  </div>
                );
              })}
            </div>
      }

      {modal!==null    && <SavingsModal onClose={()=>setModal(null)} onSave={save} initial={modal} />}
      {addModal!==null && <AddModal goal={addModal} onClose={()=>setAddModal(null)} onSave={save} />}
    </div>
  );
}
