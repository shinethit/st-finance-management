// src/App.jsx — Shine Thit · Clean Money Lover Style
import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { LangProvider, useLang } from './lib/LangContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Savings from './pages/Savings';
import Debts from './pages/Debts';
import Vehicles from './pages/Vehicles';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import BulkEntry from './pages/BulkEntry';
import MyAnalytics from './pages/MyAnalytics';
import Categories from './pages/Categories';
import Admin from './pages/Admin';
import { supabase } from './lib/supabase';
import './App.css';
import Logo from './lib/Logo';

// ── SVG Icons ─────────────────────────────────────────────────
const Icon = ({ d, size=16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

const Icons = {
  dashboard:    () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  transactions: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4"/></svg>,
  budget:       () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/></svg>,
  savings:      () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  debts:        () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  vehicles:     () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17H5a2 2 0 0 1-2-2V9l3.5-4h11L21 9v6a2 2 0 0 1-2 2Z"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>,
  reports:      () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  settings:     () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  search:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bell:         () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  categories:   () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg>,
  analytics:    () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  bulk:         () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
  logout:       () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const NAV = [
  { id:'dashboard',    labelKey:'nav_dashboard',    icon:'dashboard' },
  { id:'transactions', labelKey:'nav_transactions', icon:'transactions' },
  { id:'budget',       labelKey:'nav_budget',       icon:'budget' },
  { id:'savings',      labelKey:'nav_savings',      icon:'savings' },
  { id:'debts',        labelKey:'nav_debts',        icon:'debts' },
  { id:'vehicles',     labelKey:'nav_vehicles',     icon:'vehicles' },
  { id:'bulk',         labelKey:'nav_bulk',         icon:'bulk' },
  { id:'analytics',     labelKey:'nav_analytics',     icon:'analytics' },
  { id:'reports',      labelKey:'nav_reports',      icon:'reports' },
  { id:'settings',     labelKey:'nav_settings',     icon:'settings' },
];

const PAGES = {
  dashboard:Dashboard, transactions:Transactions, budget:Budget,
  savings:Savings, debts:Debts, vehicles:Vehicles,
  reports:Reports, settings:Settings, bulk:BulkEntry, analytics:MyAnalytics, categories:Categories,
};

// ── Search Overlay ─────────────────────────────────────────────
function SearchOverlay({ onClose }) {
  const { t } = useLang();
  const [q, setQ] = useState('');
  useEffect(() => {
    const fn = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-box" onClick={e => e.stopPropagation()}>
        <div className="search-input-row">
          <Icons.search />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder={t('search') + ' transactions, categories…'} />
          <button onClick={onClose} className="btn btn-ghost btn-sm">ESC</button>
        </div>
        {!q && (
          <div style={{ marginTop:12, fontSize:12, color:'var(--text3)', textAlign:'center' }}>
            Type to search across your finances
          </div>
        )}
      </div>
    </div>
  );
}

// ── Notifications Dropdown ─────────────────────────────────────
function NotifDropdown({ onClose }) {
  const ref = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener('mousedown', fn), 0);
    return () => document.removeEventListener('mousedown', fn);
  }, [onClose]);

  useEffect(() => {
    (async () => {
      const notifs = [];
      const today = new Date().toISOString().slice(0,10);
      const in7   = new Date(Date.now()+7*86400000).toISOString().slice(0,10);

      // Announcements
      const { data: anns } = await supabase
        .from('announcements').select('*').eq('is_active',true).limit(3);
      (anns||[]).forEach(a => notifs.push({
        icon: a.type==='warning'?'⚠️':a.type==='error'?'🚨':a.type==='success'?'✅':'ℹ️',
        bg:   a.type==='warning'?'rgba(251,191,36,0.12)':'rgba(96,165,250,0.12)',
        title: a.title, body: a.body, time: 'Admin',
      }));

      // Debts due soon
      const { data: debts } = await supabase
        .from('debts').select('contact_name,direction,due_date,total_amount,paid_amount')
        .eq('status','active').lte('due_date', in7).gte('due_date', today).limit(3);
      (debts||[]).forEach(d => notifs.push({
        icon:'💸', bg:'rgba(251,113,133,0.12)',
        title: d.direction==='borrow'?'Debt Due Soon':'Payment Expected',
        body:  `${d.contact_name} — K ${new Intl.NumberFormat().format(Number(d.total_amount)-Number(d.paid_amount))} remaining`,
        time:  d.due_date,
      }));

      // Budget alerts (>80%)
      const thisMonth = new Date().toISOString().slice(0,7);
      const { data: budgets } = await supabase
        .from('budgets').select('*,category:categories(name,icon)').limit(10);
      const { data: txs } = await supabase
        .from('transactions').select('amount,category_id').eq('type','expense')
        .gte('date', thisMonth+'-01').lte('date', thisMonth+'-31');
      (budgets||[]).forEach(b => {
        if (!b.amount) return;
        const spent = (txs||[])
          .filter(t => !b.category_id || t.category_id===b.category_id)
          .reduce((s,t)=>s+Number(t.amount),0);
        const pct = spent/Number(b.amount)*100;
        if (pct >= 80) notifs.push({
          icon:'📊', bg:'rgba(251,191,36,0.12)',
          title:`Budget Alert: ${b.name}`,
          body: `${Math.round(pct)}% used this month`,
          time: 'Budget',
        });
      });

      setItems(notifs);
      setLoading(false);
    })();
  }, []);

  return (
    <div ref={ref} className="notif-dropdown">
      <div className="notif-header">
        <span>Notifications</span>
        <span style={{fontSize:11,color:'var(--text3)'}}>{items.length} items</span>
      </div>
      {loading ? (
        <div style={{textAlign:'center',padding:20,color:'var(--text3)',fontSize:13}}>Loading…</div>
      ) : items.length === 0 ? (
        <div style={{textAlign:'center',padding:20,color:'var(--text3)',fontSize:13}}>No notifications</div>
      ) : items.map((n,i) => (
        <div key={i} className="notif-item">
          <div className="notif-icon" style={{ background:n.bg }}>{n.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:600, fontSize:13 }}>{n.title}</div>
            <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>{n.body}</div>
          </div>
          <div style={{ fontSize:11, color:'var(--text3)', whiteSpace:'nowrap' }}>{n.time}</div>
        </div>
      ))}
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────
function AppInner() {
  const { user, loading, signOut, profile } = useAuth();
  const { t } = useLang();
  const [page, setPage]         = useState('dashboard');
  const [theme, setTheme]       = useState('dark');
  const [searchOpen, setSearch] = useState(false);
  const [notifOpen, setNotif]   = useState(false);
  const [moreOpen,  setMoreOpen] = useState(false);
  const [announcements, setAnns] = useState([]);

  // Load active announcements
  useEffect(() => {
    supabase.from('announcements').select('*')
      .eq('is_active', true).order('created_at', { ascending: false })
      .then(({ data }) => setAnns(data || []));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (loading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ textAlign:'center', color:'var(--text3)' }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:10 }}><img src="/icons/logo-transparent.png" width="72" height="72" alt=""/></div>
        <div style={{ fontWeight:600 }}>Loading…</div>
      </div>
    </div>
  );

  if (!user) return <Auth />;

  const PageComponent = PAGES[page] || Dashboard;
  const currentNav   = NAV.find(n => n.id === page);

  const navigateTo = (id) => {
    setPage(id);
    setNotif(false);
  };

  return (
    <div className="app">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">✦</div>
          <div>
            <div className="brand-name">Shine Thit</div>
            <div className="brand-sub">Personal Finance</div>
          </div>
        </div>

        <div className="user-chip">
          <div className="user-avatar">
            {(profile?.display_name || user.email || 'U')[0].toUpperCase()}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {profile?.display_name || user.email?.split('@')[0]}
            </div>
            <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>
              {profile?.currency || 'MMK'}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(item => {
            const IC = Icons[item.icon];
            return (
              <button key={item.id} className={`nav-item ${page===item.id?'active':''}`}
                onClick={() => navigateTo(item.id)}>
                <div className="nav-icon-box"><IC /></div>
                <span style={{ flex:1, fontSize:13 }}>{t(item.labelKey)}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-ghost"
            style={{ width:'100%', justifyContent:'flex-start', gap:8, color:'var(--text3)', fontSize:13 }}
            onClick={signOut}>
            <Icons.logout /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Top Header — direct child of .app, NOT inside scroll ── */}
      <div className="top-header">
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <img src="/icons/logo-transparent.png" width="24" height="24"
              style={{objectFit:"contain",cursor:"pointer"}}
              onClick={()=>navigateTo('dashboard')} alt="" />
            <div className="top-header-title">{t(currentNav?.labelKey)}</div>
          </div>
          <div className="top-header-sub">
            {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
          </div>
        </div>
        <div className="top-header-right">
          <button className="hdr-btn"
            onClick={() => setTheme(th => th==='dark'?'light':'dark')}
            title="Toggle theme" style={{ fontSize:18 }}>
            {theme==='dark' ? '☀️' : '🌙'}
          </button>
          <button className="hdr-btn" onClick={() => setSearch(true)} title="Search">
            <Icons.search />
          </button>
          <div style={{ position:'relative' }}>
            <button className="hdr-btn" onClick={() => setNotif(v => !v)} title="Notifications">
              <Icons.bell />
              <span className="notif-dot" />
            </button>
            {notifOpen && <NotifDropdown onClose={() => setNotif(false)} />}
          </div>
        </div>
      </div>

      {/* ── Main scroll area ── */}
      <main className="main-content">

        {/* ── Announcement Ticker ── */}
        {announcements.length > 0 && (
          <div style={{
            background: 'linear-gradient(90deg, rgba(255,107,53,0.12), rgba(247,147,30,0.12))',
            borderBottom: '1px solid rgba(255,107,53,0.2)',
            overflow: 'hidden', height: 36,
            display: 'flex', alignItems: 'center',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0 16px', flexShrink: 0,
            }}>
              <span style={{ fontSize: 14 }}>
                {announcements[0].type === 'warning' ? '⚠️'
                  : announcements[0].type === 'success' ? '✅'
                  : announcements[0].type === 'error'   ? '🚨' : 'ℹ️'}
              </span>
            </div>
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <div style={{
                display: 'inline-flex', gap: 60,
                animation: 'ticker 20s linear infinite',
                whiteSpace: 'nowrap',
              }}>
                {[...announcements, ...announcements].map((a, i) => (
                  <span key={i} style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
                    {a.title} — {a.body}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        <PageComponent onNavigate={navigateTo} />
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="mobile-nav">
        <button className={`mobile-nav-item ${page==='dashboard'?'active':''}`} onClick={() => navigateTo('dashboard')}>
          <div className="mob-icon"><Icons.dashboard /></div>
          <span className="mobile-nav-label">{t('nav_dashboard')}</span>
        </button>
        <button className={`mobile-nav-item ${page==='transactions'?'active':''}`} onClick={() => navigateTo('transactions')}>
          <div className="mob-icon"><Icons.transactions /></div>
          <span className="mobile-nav-label">{t('nav_transactions')}</span>
        </button>
        <div className="mob-fab-wrap">
          <button className="mob-fab" onClick={() => navigateTo('bulk')}>＋</button>
          <span className="mob-fab-label">{t('add')}</span>
        </div>
        <button className={`mobile-nav-item ${page==='reports'?'active':''}`} onClick={() => navigateTo('reports')}>
          <div className="mob-icon"><Icons.reports /></div>
          <span className="mobile-nav-label">{t('nav_reports')}</span>
        </button>
        <button className={`mobile-nav-item ${moreOpen||['settings','budget','savings','debts','vehicles','analytics','bulk'].includes(page)?'active':''}`}
          onClick={() => setMoreOpen(v=>!v)}>
          <div className="mob-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </div>
          <span className="mobile-nav-label">More</span>
        </button>
      </nav>

      {/* ── More drawer ── */}
      {moreOpen && (
        <div style={{
          position:'fixed', inset:0, zIndex:90,
          background:'rgba(0,0,0,0.5)',
        }} onClick={() => setMoreOpen(false)}>
          <div style={{
            position:'absolute', bottom: 'calc(var(--nav-h) + env(safe-area-inset-bottom))',
            left:0, right:0,
            background:'var(--bg2)', borderRadius:'20px 20px 0 0',
            padding:'20px 16px',
            display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8,
          }} onClick={e=>e.stopPropagation()}>
            {[
              { id:'settings',  icon:'⚙️', label:t('nav_settings') },
              { id:'budget',    icon:'📊', label:t('nav_budget') },
              { id:'savings',   icon:'🎯', label:t('nav_savings') },
              { id:'debts',     icon:'💸', label:t('nav_debts') },
              { id:'vehicles',  icon:'🚗', label:t('nav_vehicles') },
              { id:'analytics', icon:'📈', label:t('nav_analytics') },
              { id:'categories',icon:'📂', label:'Categories' },
              { id:'bulk',      icon:'📋', label:t('nav_bulk') },
            ].map(item=>(
              <button key={item.id}
                onClick={() => { navigateTo(item.id); setMoreOpen(false); }}
                style={{
                  display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                  padding:'12px 4px', borderRadius:12, border:'none', cursor:'pointer',
                  background: page===item.id ? 'rgba(255,107,53,0.12)' : 'var(--bg3)',
                  color: page===item.id ? 'var(--accent)' : 'var(--text2)',
                  fontFamily:'var(--font)',
                }}>
                <span style={{ fontSize:24 }}>{item.icon}</span>
                <span style={{ fontSize:10, fontWeight:600, textAlign:'center' }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {searchOpen && <SearchOverlay onClose={() => setSearch(false)} />}
    </div>
  );
}

export default function App() {
  // Env var check — show helpful message instead of blank screen
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
        background:'#0f0f11', color:'#fbbf24', fontFamily:'sans-serif', padding:32, flexDirection:'column', gap:16, textAlign:'center' }}>
        <div style={{ fontSize:48 }}>✦</div>
        <div style={{ fontSize:20, fontWeight:700 }}>Shine Thit</div>
        <div style={{ fontSize:14, color:'#f87171', maxWidth:420, lineHeight:1.7 }}>
          Supabase environment variables are missing.<br/>
          Go to <strong>Vercel → Project → Settings → Environment Variables</strong> and add:<br/>
          <code style={{ display:'block', marginTop:8, padding:'8px 16px', background:'rgba(248,113,113,0.1)', borderRadius:8, fontSize:12 }}>
            VITE_SUPABASE_URL<br/>VITE_SUPABASE_ANON_KEY
          </code>
        </div>
        <div style={{ fontSize:12, color:'#6b7280' }}>Then redeploy from Vercel dashboard.</div>
      </div>
    );
  }

  // URL-based routing
  if (window.location.pathname === '/admin') {
    return <LangProvider><Admin /></LangProvider>;
  }
  if (window.location.pathname === '/reset-password') {
    return <LangProvider><AuthProvider><Auth /></AuthProvider></LangProvider>;
  }
  return <LangProvider><AuthProvider><AppInner /></AuthProvider></LangProvider>;
}
