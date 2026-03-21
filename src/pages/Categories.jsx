// src/pages/Categories.jsx — Clean standalone category + sub-category manager
import { useState } from 'react';
import { useCategories } from '../hooks/useData';
import { useLang } from '../lib/LangContext';

const ICONS  = ['🍜','🚗','🛍️','💊','💡','🎮','📚','✈️','🏠','💅','🐶','🎵','⚽','🎂','💐','🔧','🎓','💻','📦','🤲','⚡','💧','📱','🏥','🎯','🧴','👔','🍕','☕','🎁','🏋️','🎸','💈','🎪','🎭'];
const COLORS = ['#7c6aff','#ff6b35','#3b82f6','#10b981','#f59e0b','#ec4899','#06b6d4','#8b5cf6','#ef4444','#14b8a6','#f97316','#84cc16'];

// ── Add / Edit Modal ──────────────────────────────────────────
function CatModal({ onClose, onSave, initial, parentOptions }) {
  const { t } = useLang();
  const [form, setForm] = useState({
    name: '', type: 'expense', icon: '📦', color: '#7c6aff',
    parent_id: null, is_custom: true,
    ...initial,
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const isEdit = !!initial?.id;

  // Show which parent is pre-selected (when opening via + button)
  const selectedParent = form.parent_id
    ? parentOptions.find(p => p.id === form.parent_id)
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {isEdit ? t('edit') : t('add')} Category
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-form">
          {/* If sub-category — show parent info at top */}
          {selectedParent && (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
              borderRadius:10, background:'var(--bg3)', marginBottom:4 }}>
              <span style={{ fontSize:20 }}>{selectedParent.icon}</span>
              <div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>Sub-category of</div>
                <div style={{ fontWeight:700, fontSize:14 }}>{selectedParent.name}</div>
              </div>
              <button onClick={() => set('parent_id', null)}
                style={{ marginLeft:'auto', background:'none', border:'none',
                  cursor:'pointer', color:'var(--text3)', fontSize:16 }}>✕</button>
            </div>
          )}

          {/* Type — only top-level categories choose type */}
          {!form.parent_id && (
            <div className="type-toggle">
              <button className={`type-btn expense ${form.type==='expense'?'active':''}`}
                onClick={() => set('type','expense')}>{t('expense')}</button>
              <button className={`type-btn income ${form.type==='income'?'active':''}`}
                onClick={() => set('type','income')}>{t('income')}</button>
            </div>
          )}

          {/* Sub-category of */}
          <div className="form-group">
            <label className="form-label">Sub-category of</label>
            <select className="form-select"
              value={form.parent_id || ''}
              onChange={e => {
                const pid = e.target.value || null;
                const parent = parentOptions.find(p => p.id === pid);
                set('parent_id', pid);
                if (parent) set('type', parent.type);
              }}>
              <option value="">— ဘာမှမရွေး (Top-level) —</option>
              {parentOptions.map(p => (
                <option key={p.id} value={p.id}>{p.icon} {p.name} ({p.type})</option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">{t('name')}</label>
            <input className="form-input"
              placeholder="ဥပမာ — မီတာ, ဆေး, ဆန်"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              autoFocus />
          </div>

          {/* Icon picker */}
          <div className="form-group">
            <label className="form-label">{t('icon')}</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {ICONS.map(ic => (
                <button key={ic} onClick={() => set('icon', ic)}
                  style={{
                    width:40, height:40, fontSize:20, borderRadius:10,
                    border: form.icon===ic ? '2px solid var(--accent)' : '2px solid transparent',
                    background: form.icon===ic ? 'rgba(255,107,53,0.15)' : 'var(--bg3)',
                    cursor:'pointer',
                  }}>{ic}</button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="form-group">
            <label className="form-label">{t('color')}</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {COLORS.map(cl => (
                <button key={cl} onClick={() => set('color', cl)}
                  style={{
                    width:30, height:30, borderRadius:'50%', background:cl,
                    border: form.color===cl ? '3px solid var(--text)' : '3px solid transparent',
                    cursor:'pointer',
                  }}/>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{
            display:'flex', alignItems:'center', gap:12,
            padding:'12px 16px', borderRadius:12,
            background: form.color+'18', border:`1px solid ${form.color}33`,
          }}>
            <div style={{
              width:42, height:42, borderRadius:12,
              background: form.color+'28',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
            }}>{form.icon}</div>
            <div>
              {form.parent_id && (
                <div style={{ fontSize:11, color:'var(--text3)', marginBottom:2 }}>
                  ↳ Sub-category
                </div>
              )}
              <div style={{ fontWeight:700, fontSize:15 }}>{form.name || 'Category Name'}</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{form.type}</div>
            </div>
          </div>

          {error && (
            <div style={{ padding:'10px 12px', borderRadius:8, fontSize:13,
              background:'rgba(251,113,133,0.1)', color:'var(--red)', marginBottom:4 }}>
              ⚠ {error}
            </div>
          )}
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
            <button className="btn btn-primary" disabled={saving}
              onClick={async () => {
                if (!form.name.trim()) { setError('Name ထည့်ပါ'); return; }
                setSaving(true);
                setError('');
                try {
                  await onSave({ ...form, is_custom: true });
                  onClose();
                } catch(e) {
                  setError(e.message || 'Save မအောင်မြင်ဘူး — features.sql run ပြီးပြီလား?');
                  setSaving(false);
                }
              }}>
              {saving ? 'Saving…' : t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Categories() {
  const { t } = useLang();
  const { data: categories, saveCategory, del: delCategory } = useCategories();
  const [modal,  setModal]  = useState(null);
  const [filter, setFilter] = useState('expense');

  // Only user-created categories (is_custom) + only current type
  const custom = categories.filter(c => c.is_custom);
  // All top-level cats (both default & custom) can be parents
  const parentOpts = categories.filter(c => !c.parent_id);

  // Group: parents of current type + their subs
  const parents = categories.filter(c => c.type === filter && !c.parent_id);
  const subs    = (p) => categories.filter(c => c.parent_id === p.id);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Categories</div>
          <div className="page-subtitle">Category & Sub-category စီမံမည်</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>
          + {t('add')}
        </button>
      </div>

      {/* Type filter */}
      <div style={{
        display:'flex', gap:0, background:'var(--bg2)', borderRadius:12,
        padding:3, marginBottom:16, width:'fit-content',
      }}>
        {['expense','income'].map(tp => (
          <button key={tp} onClick={() => setFilter(tp)}
            style={{
              padding:'8px 20px', borderRadius:10, border:'none', cursor:'pointer',
              background: filter===tp ? 'var(--accent)' : 'transparent',
              color: filter===tp ? '#fff' : 'var(--text3)',
              fontSize:13, fontWeight:700, fontFamily:'var(--font)', transition:'all .15s',
            }}>
            {tp==='expense' ? t('expense') : t('income')}
          </button>
        ))}
      </div>

      {/* Category list */}
      {parents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <div className="empty-state-text">Category မရှိသေး</div>
          <div style={{ fontSize:12, color:'var(--text3)', marginTop:6 }}>
            + Add နှိပ်ပြီး ထည့်ပါ
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {parents.map(p => {
            const children = subs(p);
            return (
              <div key={p.id} className="card" style={{ padding:0, overflow:'hidden' }}>

                {/* Parent row */}
                <div style={{
                  display:'flex', alignItems:'center', gap:12, padding:'13px 16px',
                }}>
                  <div style={{
                    width:42, height:42, borderRadius:12, flexShrink:0,
                    background:(p.color||'#7c6aff')+'22',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
                  }}>{p.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:15 }}>{p.name}</div>
                    <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>
                      {children.length} sub-categories
                    </div>
                  </div>
                  {/* Add sub-category button */}
                  <button
                    onClick={() => setModal({ type: p.type, parent_id: p.id })}
                    style={{
                      width:30, height:30, borderRadius:8, border:'none',
                      background:'rgba(255,107,53,0.12)', color:'var(--accent)',
                      cursor:'pointer', fontSize:18, display:'flex',
                      alignItems:'center', justifyContent:'center',
                    }} title="Add sub-category">＋</button>
                  <button className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => setModal(p)}>✎</button>
                  <button className="btn btn-ghost btn-icon btn-sm"
                    style={{ color:'var(--red)' }}
                    onClick={() => { if (window.confirm(`Delete "${p.name}"?`)) delCategory(p.id); }}>✕</button>
                </div>

                {/* Sub-category rows */}
                {children.map(s => (
                  <div key={s.id} style={{
                    display:'flex', alignItems:'center', gap:10,
                    padding:'10px 16px 10px 48px',
                    borderTop:'1px solid var(--border)',
                    background:'var(--bg3)',
                  }}>
                    <span style={{ fontSize:10, color:'var(--text3)', marginLeft:-18, marginRight:4 }}>↳</span>
                    <div style={{
                      width:32, height:32, borderRadius:9, flexShrink:0,
                      background:(s.color||'#7c6aff')+'22',
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:17,
                    }}>{s.icon}</div>
                    <div style={{ flex:1, fontSize:13, fontWeight:500 }}>{s.name}</div>
                    <button className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => setModal(s)}>✎</button>
                    <button className="btn btn-ghost btn-icon btn-sm"
                      style={{ color:'var(--red)' }}
                      onClick={() => { if (window.confirm(`Delete "${s.name}"?`)) delCategory(s.id); }}>✕</button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {modal !== null && (
        <CatModal
          onClose={() => setModal(null)}
          onSave={saveCategory}
          initial={modal}
          parentOptions={parentOpts}
        />
      )}
    </div>
  );
}
