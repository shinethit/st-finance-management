// src/lib/CategoryPicker.jsx — Money Lover style + Quick Create
import { useState, useMemo } from 'react';
import { useLang } from './LangContext';
import { useCategories } from '../hooks/useData';

const QUICK_ICONS  = ['📦','🍜','🚗','🛍️','💊','💡','🎮','📚','✈️','🏠','💅','☕','🎯','🔧','📱','⚡','💧','🎁'];
const QUICK_COLORS = ['#7c6aff','#ff6b35','#3b82f6','#10b981','#f59e0b','#ec4899','#8b5cf6','#ef4444'];

// ── Quick Create inline form ──────────────────────────────────
function QuickCreate({ type, parentId, onDone, onCancel }) {
  const { t } = useLang();
  const { saveCategory } = useCategories();
  const [name,    setName]    = useState('');
  const [icon,    setIcon]    = useState('📦');
  const [color,   setColor]   = useState('#7c6aff');
  const [saving,  setSaving]  = useState(false);
  const [showMore, setShowMore] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const row = await saveCategory({
        name: name.trim(), icon, color,
        type, parent_id: parentId || null, is_custom: true,
      });
      onDone(row);
    } catch(e) {
      console.error(e);
      setSaving(false);
    }
  };

  return (
    <div style={{
      margin: '8px 0', padding: '12px 14px', borderRadius: 12,
      background: 'var(--bg3)', border: '1px solid var(--accent)',
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
        ✦ Category အသစ်ဖန်တီးမည်
      </div>

      {/* Name input */}
      <input
        className="form-input"
        placeholder="Category အမည်…"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel(); }}
        autoFocus
        style={{ marginBottom: 8 }}
      />

      {/* Icon + color quick row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {/* Selected icon preview */}
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: color + '25', border: `2px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          cursor: 'pointer',
        }} onClick={() => setShowMore(v => !v)}>
          {icon}
        </div>

        {/* Color dots */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1 }}>
          {QUICK_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)}
              style={{
                width: 22, height: 22, borderRadius: '50%', background: c,
                border: color === c ? '2.5px solid var(--text)' : '2.5px solid transparent',
                cursor: 'pointer', padding: 0, flexShrink: 0,
              }}/>
          ))}
        </div>
      </div>

      {/* Expanded icon picker */}
      {showMore && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {QUICK_ICONS.map(ic => (
            <button key={ic} onClick={() => { setIcon(ic); setShowMore(false); }}
              style={{
                width: 36, height: 36, borderRadius: 8, fontSize: 18,
                border: icon === ic ? '2px solid var(--accent)' : '2px solid transparent',
                background: icon === ic ? 'rgba(255,107,53,0.15)' : 'var(--bg2)',
                cursor: 'pointer',
              }}>{ic}</button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-secondary btn-sm" onClick={onCancel} style={{ flex: 1 }}>
          {t('cancel')}
        </button>
        <button className="btn btn-primary btn-sm" onClick={handleSave}
          disabled={saving || !name.trim()} style={{ flex: 2 }}>
          {saving ? 'Saving…' : t('save')}
        </button>
      </div>
    </div>
  );
}

// ── Cat row ───────────────────────────────────────────────────
function CatRow({ cat, selected, onSelect, isLast, indent }) {
  return (
    <button onClick={onSelect} style={{
      width: '100%', display: 'flex', alignItems: 'center',
      gap: indent ? 8 : 10,
      padding: indent ? '10px 14px 10px 38px' : '12px 14px',
      background: selected ? 'rgba(255,107,53,0.10)' : 'transparent',
      border: 'none', borderBottom: isLast ? 'none' : '1px solid var(--border)',
      cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)',
    }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
    >
      {indent && <span style={{ color:'var(--text3)', fontSize:10, marginLeft:-18, marginRight:2 }}>↳</span>}
      <div style={{
        width: indent ? 30 : 36, height: indent ? 30 : 36,
        borderRadius: indent ? 8 : 10,
        background: (cat.color||'#7c6aff') + '22',
        border: `1px solid ${cat.color||'#7c6aff'}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: indent ? 15 : 18, flexShrink: 0,
      }}>{cat.icon||'📦'}</div>
      <span style={{
        flex: 1, fontSize: indent ? 13 : 14,
        fontWeight: indent ? 500 : 600,
        color: selected ? 'var(--accent)' : 'var(--text)',
      }}>{cat.name}</span>
      {selected && <span style={{ color:'var(--accent)', fontSize:16 }}>✓</span>}
    </button>
  );
}

// ── Main Picker ───────────────────────────────────────────────
export default function CategoryPicker({ categories: initialCats, value, onChange, type = 'expense', onCategoriesChange }) {
  const { t } = useLang();
  const { data: freshCats, saveCategory } = useCategories();

  // Use fresh categories from hook (gets updated after quick create)
  const categories = freshCats.length > 0 ? freshCats : initialCats;

  const [search,      setSearch]      = useState('');
  const [activeType,  setActiveType]  = useState(type);
  const [showCreate,  setShowCreate]  = useState(false);
  const [createParent, setCreateParent] = useState(null);

  const tree = useMemo(() => {
    const filtered = categories.filter(c => c.type === activeType);
    const parents  = filtered.filter(c => !c.parent_id);
    const children = filtered.filter(c => c.parent_id);
    return parents.map(p => ({ ...p, subs: children.filter(s => s.parent_id === p.id) }));
  }, [categories, activeType]);

  const flatFiltered = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return categories.filter(c => c.type === activeType && c.name.toLowerCase().includes(q));
  }, [search, categories, activeType]);

  const handleCreated = (newCat) => {
    setShowCreate(false);
    setCreateParent(null);
    onChange(newCat.id);
    if (onCategoriesChange) onCategoriesChange();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Type tabs */}
      <div style={{ display:'flex', gap:0, background:'var(--bg3)', borderRadius:12, padding:3, margin:'0 0 10px' }}>
        {[['expense', t('expense')], ['income', t('income')]].map(([id, lbl]) => (
          <button key={id} onClick={() => { setActiveType(id); onChange(''); setShowCreate(false); }}
            style={{ flex:1, padding:'7px 0', borderRadius:10, border:'none', cursor:'pointer',
              fontSize:13, fontWeight:600, fontFamily:'var(--font)',
              background: activeType===id ? 'var(--bg2)' : 'transparent',
              color: activeType===id ? 'var(--text)' : 'var(--text3)',
              boxShadow: activeType===id ? '0 1px 4px rgba(0,0,0,.2)' : 'none',
              transition: 'all .15s',
            }}>{lbl}</button>
        ))}
      </div>

      {/* Category list */}
      <div style={{ flex:1, overflowY:'auto', minHeight:0 }}>

        {/* Quick Create form (top-level) */}
        {showCreate && !createParent && (
          <QuickCreate type={activeType} parentId={null}
            onDone={handleCreated} onCancel={() => setShowCreate(false)} />
        )}

        {(flatFiltered || tree).length === 0 && !showCreate ? (
          <div style={{ textAlign:'center', color:'var(--text3)', padding:24, fontSize:13 }}>
            {t('no_data')}
          </div>
        ) : flatFiltered ? (
          <div style={{ background:'var(--bg3)', borderRadius:14, overflow:'hidden' }}>
            {flatFiltered.map((cat,i) => (
              <CatRow key={cat.id} cat={cat} selected={value===cat.id}
                onSelect={() => onChange(cat.id)}
                isLast={i===flatFiltered.length-1} indent={!!cat.parent_id} />
            ))}
          </div>
        ) : (
          tree.map(parent => (
            <div key={parent.id} style={{ background:'var(--bg3)', borderRadius:14, overflow:'hidden', marginBottom:8 }}>
              <CatRow cat={parent} selected={value===parent.id}
                onSelect={() => onChange(parent.id)}
                isParent isLast={parent.subs.length===0 && !(showCreate && createParent===parent.id)} />

              {/* Sub-category create for this parent */}
              {showCreate && createParent===parent.id && (
                <div style={{ padding:'0 8px 8px' }}>
                  <QuickCreate type={activeType} parentId={parent.id}
                    onDone={handleCreated} onCancel={() => { setShowCreate(false); setCreateParent(null); }} />
                </div>
              )}

              {parent.subs.map((sub, i) => (
                <CatRow key={sub.id} cat={sub} selected={value===sub.id}
                  onSelect={() => onChange(sub.id)}
                  isLast={i===parent.subs.length-1} indent />
              ))}

              {/* Add sub-cat button */}
              <button
                onClick={() => { setShowCreate(true); setCreateParent(parent.id); }}
                style={{ width:'100%', padding:'8px 14px 8px 38px', background:'none', border:'none',
                  borderTop:'1px solid var(--border)', cursor:'pointer',
                  fontSize:12, color:'var(--text3)', textAlign:'left',
                  fontFamily:'var(--font)', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ color:'var(--accent)', fontSize:14 }}>＋</span>
                Sub-category ထည့်မည်
              </button>
            </div>
          ))
        )}
      </div>

      {/* Bottom toolbar */}
      <div style={{ borderTop:'1px solid var(--border)', paddingTop:10, display:'flex', gap:8, flexShrink:0 }}>
        {/* Search */}
        <div style={{ flex:1, position:'relative' }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', fontSize:14, pointerEvents:'none' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('search')+'…'}
            style={{ width:'100%', padding:'9px 12px 9px 32px', borderRadius:10,
              border:'1px solid var(--border)', background:'var(--bg3)',
              color:'var(--text)', fontSize:14, fontFamily:'var(--font)', outline:'none',
              boxSizing:'border-box' }} />
        </div>

        {/* New category button */}
        {!showCreate && (
          <button onClick={() => { setShowCreate(true); setCreateParent(null); setSearch(''); }}
            style={{ padding:'9px 14px', borderRadius:10, border:'1px solid var(--accent)',
              background:'rgba(255,107,53,0.1)', color:'var(--accent)',
              cursor:'pointer', fontFamily:'var(--font)', fontSize:13, fontWeight:700,
              flexShrink:0, whiteSpace:'nowrap' }}>
            ＋ New
          </button>
        )}
      </div>
    </div>
  );
}
