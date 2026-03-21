// src/lib/CategoryPicker.jsx — Money Lover style category picker
import { useState, useMemo } from 'react';
import { useLang } from './LangContext';

export default function CategoryPicker({ categories, value, onChange, type = 'expense' }) {
  const { t } = useLang();
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState(type);

  // Build tree: parent cats → children
  const tree = useMemo(() => {
    const filtered = categories.filter(c => c.type === activeType);
    const parents  = filtered.filter(c => !c.parent_id);
    const children = filtered.filter(c =>  c.parent_id);
    return parents.map(p => ({
      ...p,
      subs: children.filter(s => s.parent_id === p.id),
    }));
  }, [categories, activeType]);

  // Flat list for search
  const flatFiltered = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return categories.filter(c =>
      c.type === activeType && c.name.toLowerCase().includes(q)
    );
  }, [search, categories, activeType]);

  const selected = categories.find(c => c.id === value);

  const TYPES = [
    { id: 'expense',  label: t('expense')  },
    { id: 'income',   label: t('income')   },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Type tabs */}
      <div style={{
        display: 'flex', gap: 0,
        background: 'var(--bg3)', borderRadius: 12,
        padding: 3, margin: '0 0 14px',
      }}>
        {TYPES.map(tp => (
          <button key={tp.id} onClick={() => { setActiveType(tp.id); onChange(''); }}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 10,
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              fontFamily: 'var(--font)',
              background: activeType === tp.id ? 'var(--bg2)' : 'transparent',
              color: activeType === tp.id ? 'var(--text)' : 'var(--text3)',
              boxShadow: activeType === tp.id ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
              transition: 'all .15s',
            }}>
            {tp.label}
          </button>
        ))}
      </div>

      {/* Category list */}
      <div style={{ flex: 1, overflowY: 'auto', margin: '0 -4px' }}>
        {(flatFiltered || tree).length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 32, fontSize: 13 }}>
            {t('no_data')}
          </div>
        ) : flatFiltered ? (
          /* Search results — flat list */
          <div style={{ background: 'var(--bg3)', borderRadius: 14, overflow: 'hidden' }}>
            {flatFiltered.map((cat, i) => (
              <CatRow key={cat.id} cat={cat} selected={value === cat.id}
                onSelect={() => onChange(cat.id)}
                isLast={i === flatFiltered.length - 1} indent={!!cat.parent_id} />
            ))}
          </div>
        ) : (
          /* Tree view */
          tree.map(parent => (
            <div key={parent.id} style={{
              background: 'var(--bg3)', borderRadius: 14,
              overflow: 'hidden', marginBottom: 10,
            }}>
              {/* Parent row */}
              <CatRow cat={parent} selected={value === parent.id}
                onSelect={() => onChange(parent.id)}
                isParent isLast={parent.subs.length === 0} />
              {/* Sub-category rows */}
              {parent.subs.map((sub, i) => (
                <CatRow key={sub.id} cat={sub} selected={value === sub.id}
                  onSelect={() => onChange(sub.id)}
                  isLast={i === parent.subs.length - 1} indent />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Search bar — pinned bottom like Money Lover */}
      <div style={{
        marginTop: 12, position: 'relative',
        display: 'flex', alignItems: 'center',
      }}>
        <span style={{
          position: 'absolute', left: 14,
          color: 'var(--text3)', fontSize: 16, pointerEvents: 'none',
        }}>🔍</span>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('search') + '…'}
          style={{
            width: '100%', padding: '11px 14px 11px 40px',
            borderRadius: 12, border: '1px solid var(--border)',
            background: 'var(--bg3)', color: 'var(--text)',
            fontSize: 14, fontFamily: 'var(--font)',
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
}

function CatRow({ cat, selected, onSelect, isParent, isLast, indent }) {
  return (
    <button onClick={onSelect} style={{
      width: '100%', display: 'flex', alignItems: 'center',
      gap: indent ? 10 : 12,
      padding: indent ? '12px 16px 12px 42px' : '13px 16px',
      background: selected ? 'rgba(255,107,53,0.10)' : 'transparent',
      border: 'none',
      borderBottom: isLast ? 'none' : '1px solid var(--border)',
      cursor: 'pointer', textAlign: 'left',
      transition: 'background .1s',
      fontFamily: 'var(--font)',
    }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
    >
      {indent && (
        <span style={{ color: 'var(--text3)', fontSize: 11, marginLeft: -18, marginRight: 4 }}>↳</span>
      )}
      {/* Icon */}
      <div style={{
        width: indent ? 32 : 38,
        height: indent ? 32 : 38,
        borderRadius: indent ? 9 : 11,
        background: (cat.color || '#7c6aff') + '22',
        border: `1px solid ${cat.color || '#7c6aff'}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: indent ? 16 : 20, flexShrink: 0,
      }}>
        {cat.icon || '📦'}
      </div>

      {/* Name */}
      <span style={{
        flex: 1, fontSize: indent ? 13 : 14,
        fontWeight: isParent ? 600 : 500,
        color: selected ? 'var(--accent)' : 'var(--text)',
      }}>
        {cat.name}
      </span>

      {/* Check mark */}
      {selected && (
        <span style={{ color: 'var(--accent)', fontSize: 18, flexShrink: 0 }}>✓</span>
      )}
    </button>
  );
}
