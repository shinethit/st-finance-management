// src/pages/MyAnalytics.jsx — Custom Trackers + Sub-category Analytics
import { useState, useEffect, useCallback } from 'react';
import { useCustomTrackers, useCategories } from '../hooks/useData';
import { useLang } from '../lib/LangContext';

const fmt  = n => new Intl.NumberFormat('en-US').format(Math.abs(Number(n)||0));
const fmtK = n => { const v=Math.abs(Number(n)||0); return v>=1000000?`${(v/1e6).toFixed(1)}M`:v>=1000?`${(v/1000).toFixed(0)}K`:`${Math.round(v)}`; };

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const ICONS = ['📊','💡','🏠','🚗','🛒','🍜','💊','📱','🎓','💰','🔧','✈️','🎮','👕','⚡'];
const COLORS = ['#7c6aff','#ff6b35','#3b82f6','#10b981','#f59e0b','#ec4899','#06b6d4','#8b5cf6','#ef4444'];

// ── Mini bar chart ─────────────────────────────────────────────
function MiniChart({ data, color }) {
  const max = Math.max(...data.map(d => d.total), 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:56 }}>
      {data.map((d, i) => {
        const h = Math.max(3, Math.round((d.total / max) * 52));
        const isLast = i === data.length - 1;
        const isPrev = i === data.length - 2;
        return (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
            <div
              title={`K ${fmt(d.total)}`}
              style={{
                width:'100%', height:h, borderRadius:'3px 3px 0 0',
                background: isLast ? color : isPrev ? color+'99' : color+'44',
                transition:'height .3s ease',
                minHeight: d.total > 0 ? 3 : 0,
              }}
            />
            <div style={{ fontSize:8, color:'var(--text3)', whiteSpace:'nowrap' }}>
              {MONTHS_SHORT[parseInt(d.month.split('-')[1])-1]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Tracker Card ───────────────────────────────────────────────
function TrackerCard({ tracker, categories, onEdit, onDelete, getTrackerData }) {
  const [chartData, setChartData] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    getTrackerData(tracker).then(d => {
      setChartData(d);
      setLoading(false);
    });
  }, [tracker, getTrackerData]);

  const cur  = chartData[chartData.length - 1]?.total || 0;
  const prev = chartData[chartData.length - 2]?.total || 0;
  const diff = cur - prev;
  const pct  = prev > 0 ? ((diff / prev) * 100).toFixed(1) : null;

  const catLabel = tracker.filter_type !== 'note_contains'
    ? categories.find(c => c.id === tracker.filter_value)?.name
    : null;

  return (
    <div className="card" style={{ borderLeft:`4px solid ${tracker.color}` }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:38, height:38, borderRadius:10,
            background: tracker.color + '20',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
          }}>
            {tracker.icon}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>{tracker.name}</div>
            <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>
              {tracker.filter_type === 'note_contains'
                ? `"${tracker.filter_value}" ပါသော မှတ်တမ်းများ`
                : catLabel ? `📂 ${catLabel}` : 'Category'}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit(tracker)}>✏️</button>
          <button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--red)' }}
            onClick={() => onDelete(tracker.id)}>✕</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', color:'var(--text3)', padding:'12px 0', fontSize:13 }}>Loading…</div>
      ) : (
        <>
          {/* This month vs last month */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
            <div style={{ background:'var(--bg3)', borderRadius:10, padding:'10px 12px' }}>
              <div style={{ fontSize:10, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:4 }}>ဒီလ</div>
              <div style={{ fontWeight:800, fontSize:16, color: tracker.color }}>K {fmtK(cur)}</div>
            </div>
            <div style={{ background:'var(--bg3)', borderRadius:10, padding:'10px 12px' }}>
              <div style={{ fontSize:10, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:4 }}>အရင်လ</div>
              <div style={{ fontWeight:700, fontSize:16 }}>K {fmtK(prev)}</div>
            </div>
            <div style={{
              borderRadius:10, padding:'10px 12px',
              background: diff > 0 ? 'rgba(251,113,133,0.1)' : diff < 0 ? 'rgba(52,211,153,0.1)' : 'var(--bg3)',
            }}>
              <div style={{ fontSize:10, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:4 }}>ပြောင်းလဲမှု</div>
              <div style={{
                fontWeight:800, fontSize:15,
                color: diff > 0 ? 'var(--red)' : diff < 0 ? 'var(--green)' : 'var(--text2)',
              }}>
                {diff === 0 ? '—' : `${diff>0?'↑':'↓'}${Math.abs(pct)}%`}
              </div>
            </div>
          </div>

          {/* Price diff detail */}
          {diff !== 0 && prev > 0 && (
            <div style={{
              fontSize:12, padding:'8px 12px', borderRadius:8, marginBottom:12,
              background: diff > 0 ? 'rgba(251,113,133,0.08)' : 'rgba(52,211,153,0.08)',
              color: diff > 0 ? 'var(--red)' : 'var(--green)',
            }}>
              {diff > 0
                ? `📈 အရင်လထက် K ${fmt(Math.abs(diff))} ပိုကုန်သည်`
                : `📉 အရင်လထက် K ${fmt(Math.abs(diff))} သက်သာသည်`}
            </div>
          )}

          {/* 6-month chart */}
          <MiniChart data={chartData} color={tracker.color} />
        </>
      )}
    </div>
  );
}

// ── Tracker Modal ──────────────────────────────────────────────
function TrackerModal({ onClose, onSave, categories, initial }) {
  const topCats = categories.filter(c => c.type === 'expense' && !c.parent_id);
  const subCats = categories.filter(c => c.type === 'expense' && c.parent_id);

  const [form, setForm] = useState({
    name:'', icon:'📊', color:'#7c6aff',
    filter_type:'note_contains', filter_value:'',
    ...initial,
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{initial?.id ? 'Edit' : 'New'} Tracker</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Tracker အမည်</label>
            <input className="form-input" placeholder="ဥပမာ — မီတာခ, ဆေးကုန်ကျစရိတ်"
              value={form.name} onChange={e=>set('name',e.target.value)} autoFocus />
          </div>

          {/* Icon + Color row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div className="form-group">
              <label className="form-label">အိုင်ကွန်</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {ICONS.map(ic => (
                  <button key={ic} onClick={()=>set('icon',ic)}
                    style={{
                      width:36, height:36, borderRadius:8, border:'none', cursor:'pointer', fontSize:18,
                      background: form.icon===ic ? 'var(--accent)' : 'var(--bg3)',
                      transition:'all .1s',
                    }}>{ic}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">အရောင်</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {COLORS.map(cl => (
                  <button key={cl} onClick={()=>set('color',cl)}
                    style={{
                      width:28, height:28, borderRadius:'50%', border: form.color===cl ? '3px solid var(--text1)' : '3px solid transparent',
                      background:cl, cursor:'pointer',
                    }}/>
                ))}
              </div>
            </div>
          </div>

          {/* Filter type */}
          <div className="form-group">
            <label className="form-label">ခြေရာခံမည့် နည်းလမ်း</label>
            <div className="type-toggle">
              <button className={`type-btn expense ${form.filter_type==='note_contains'?'active':''}`}
                onClick={()=>set('filter_type','note_contains')}>
                🔤 Keyword
              </button>
              <button className={`type-btn income ${form.filter_type==='category'?'active':''}`}
                onClick={()=>set('filter_type','category')}>
                📂 Category
              </button>
            </div>
          </div>

          {/* Filter value */}
          {form.filter_type === 'note_contains' ? (
            <div className="form-group">
              <label className="form-label">Keyword (မှတ်ချက်ထဲမှ ရှာမည်)</label>
              <input className="form-input"
                placeholder="ဥပမာ — မီတာ, ဆေးဝါး, Internet"
                value={form.filter_value} onChange={e=>set('filter_value',e.target.value)} />
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>
                Note ထဲမှာ ဒီစကားလုံးပါတဲ့ transaction တွေကို ပေါင်းတွက်မည်
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Category ရွေးမည်</label>
              <select className="form-select" value={form.filter_value}
                onChange={e=>set('filter_value',e.target.value)}>
                <option value="">— ရွေးပါ —</option>
                {topCats.map(c => (
                  <optgroup key={c.id} label={`${c.icon} ${c.name}`}>
                    <option value={c.id}>{c.icon} {c.name} (အားလုံး)</option>
                    {subCats.filter(s=>s.parent_id===c.id).map(s=>(
                      <option key={s.id} value={s.id}>　↳ {s.icon} {s.name}</option>
                    ))}
                  </optgroup>
                ))}
                {topCats.filter(c => !subCats.some(s=>s.parent_id===c.id)).length === 0 &&
                  categories.filter(c=>c.type==='expense'&&!c.parent_id).map(c=>(
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))
                }
              </select>
            </div>
          )}

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary"
              onClick={() => {
                if (!form.name || !form.filter_value && form.filter_type!=='note_contains') return;
                if (form.filter_type==='note_contains' && !form.filter_value) return;
                onSave(form); onClose();
              }}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function MyAnalytics() {
  const { data:trackers, loading, save, del, getTrackerData } = useCustomTrackers();
  const { data:categories } = useCategories();
  const { t } = useLang();
  const [modal, setModal] = useState(null);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">My Analytics</div>
          <div className="page-subtitle">မိမိသတ်မှတ်သော ကုန်ကျစရိတ် ခြေရာခံမှု</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>
          + Tracker ထည့်မည်
        </button>
      </div>

      {/* Info banner */}
      <div style={{
        padding:'12px 16px', borderRadius:12, marginBottom:20,
        background:'rgba(124,106,255,0.08)', border:'1px solid rgba(124,106,255,0.2)',
        fontSize:13, color:'var(--text2)', lineHeight:1.6,
      }}>
        💡 <strong>ဥပမာ</strong> — "မီတာခ" tracker တစ်ခုဖန်တီးပြီး keyword "မီတာ" သို့မဟုတ် Bills category ရွေးပါ။
        ဒါဆိုရင် အရင်လနဲ့ ဒီလ ကုန်ကျမှု ယှဉ်ကြည့်လို့ ရမည်။
      </div>

      {loading ? (
        <div style={{ textAlign:'center', color:'var(--text3)', padding:60 }}>Loading…</div>
      ) : trackers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">Tracker မရှိသေး</div>
          <div style={{ fontSize:13, color:'var(--text3)', marginBottom:16 }}>
            မိမိ track လုပ်ချင်တဲ့ ကုန်ကျစရိတ်တွေကို ထည့်ပါ
          </div>
          <button className="btn btn-primary" onClick={() => setModal({})}>
            ပထမဆုံး Tracker ဖန်တီးမည်
          </button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:16 }}>
          {trackers.map(tr => (
            <TrackerCard
              key={tr.id}
              tracker={tr}
              categories={categories}
              onEdit={t => setModal(t)}
              onDelete={del}
              getTrackerData={getTrackerData}
            />
          ))}
        </div>
      )}

      {modal !== null && (
        <TrackerModal
          onClose={() => setModal(null)}
          onSave={save}
          categories={categories}
          initial={modal}
        />
      )}
    </div>
  );
}
