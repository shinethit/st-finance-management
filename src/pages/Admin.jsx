// src/pages/Admin.jsx — Shine Thit Admin Panel
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ── Admin password (change this to your own secret) ──────────
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'shinethit@admin2024';

const fmt  = n => new Intl.NumberFormat('en-US').format(Math.abs(Number(n)||0));
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : '—';

// ── Login Screen ──────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [pw, setPw]         = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      if (pw === ADMIN_PASSWORD) {
        sessionStorage.setItem('admin_auth', '1');
        onLogin();
      } else {
        setError('Incorrect password.');
        setPw('');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg)', padding:16,
    }}>
      <div style={{
        width:'100%', maxWidth:380,
        background:'var(--bg2)', border:'1px solid var(--border2)',
        borderRadius:20, padding:36,
        boxShadow:'0 20px 60px rgba(0,0,0,0.4)',
      }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:40, marginBottom:10 }}>🔐</div>
          <div style={{ fontFamily:'var(--font)', fontSize:22, fontWeight:800, letterSpacing:-.5 }}>
            Admin Panel
          </div>
          <div style={{ fontSize:13, color:'var(--text3)', marginTop:5 }}>Shine Thit — Restricted Access</div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="form-group">
            <label className="form-label">Admin Password</label>
            <input className="form-input" type="password" placeholder="••••••••••••"
              value={pw} onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleLogin()} autoFocus />
          </div>

          {error && (
            <div style={{ fontSize:13, color:'var(--red)', background:'rgba(251,113,133,0.1)', padding:'10px 14px', borderRadius:8 }}>
              {error}
            </div>
          )}

          <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:12 }}
            onClick={handleLogin} disabled={loading}>
            {loading ? 'Checking…' : 'Enter Admin Panel'}
          </button>
        </div>

        <div style={{ marginTop:20, fontSize:11, color:'var(--text3)', textAlign:'center', lineHeight:1.6 }}>
          Set password via VITE_ADMIN_PASSWORD in .env.local
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  return (
    <div className="stat-card" style={{ borderColor: color+'33' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:color+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
          {icon}
        </div>
        <div className="stat-label" style={{ marginBottom:0 }}>{label}</div>
      </div>
      <div className="stat-value" style={{ color, fontSize:28 }}>{fmt(value || 0)}</div>
    </div>
  );
}

// ── Announcement Modal ────────────────────────────────────────
function AnnouncementModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState({ title:'', body:'', type:'info', is_active:true, ...initial });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{initial?.id?'Edit':'New'} Announcement</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-select" value={form.type} onChange={e=>set('type',e.target.value)}>
              <option value="info">ℹ️ Info</option>
              <option value="success">✅ Success</option>
              <option value="warning">⚠️ Warning</option>
              <option value="error">🚨 Error</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" placeholder="Announcement title" value={form.title}
              onChange={e=>set('title',e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-textarea" placeholder="Full message to users…" value={form.body}
              onChange={e=>set('body',e.target.value)} />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <input type="checkbox" id="active" checked={form.is_active}
              onChange={e=>set('is_active',e.target.checked)} style={{ width:16, height:16, accentColor:'var(--accent)' }}/>
            <label htmlFor="active" style={{ fontSize:13, fontWeight:600, cursor:'pointer' }}>Active (visible to users)</label>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={()=>{ if(!form.title||!form.body) return; onSave(form); onClose(); }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── User Detail Modal ─────────────────────────────────────────
function UserDetailModal({ user, onClose, onBlock, onUnblock }) {
  const [txs, setTxs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    supabase.from('transactions').select('*,category:categories(name,icon)')
      .eq('user_id', user.id).order('date',{ascending:false}).limit(20)
      .then(({data})=>{ setTxs(data||[]); setLoading(false); });
  },[user.id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{ maxWidth:520 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{user.display_name || user.email?.split('@')[0]}</div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:3 }}>{user.email}</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* User info */}
        <div style={{ display:'flex', gap:10, marginBottom:18 }}>
          {[
            { label:'Joined',       val: fmtDate(user.created_at) },
            { label:'Last Login',   val: fmtDate(user.last_sign_in) },
            { label:'Transactions', val: fmt(user.tx_count) },
          ].map(s=>(
            <div key={s.label} style={{ flex:1, background:'var(--bg3)', borderRadius:10, padding:'11px 12px' }}>
              <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.7px', color:'var(--text3)', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontWeight:700, fontSize:14 }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Status + actions */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18, padding:'12px 14px', background:'var(--bg3)', borderRadius:10 }}>
          <span style={{ fontSize:13, fontWeight:600, flex:1 }}>
            Status: {user.is_blocked
              ? <span style={{ color:'var(--red)' }}>🚫 Blocked</span>
              : <span style={{ color:'var(--green)' }}>✓ Active</span>}
          </span>
          {user.is_blocked
            ? <button className="btn btn-secondary btn-sm" onClick={()=>{ onUnblock(user.id); onClose(); }}>Unblock User</button>
            : <button className="btn btn-danger btn-sm" onClick={()=>{ onBlock(user.id); onClose(); }}>Block User</button>
          }
        </div>

        {/* Recent transactions */}
        <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Recent Transactions</div>
        {loading
          ? <div style={{ textAlign:'center', color:'var(--text3)', padding:20 }}>Loading…</div>
          : txs.length===0
            ? <div style={{ textAlign:'center', color:'var(--text3)', padding:20 }}>No transactions</div>
            : <div className="tx-list" style={{ maxHeight:240, overflowY:'auto' }}>
                {txs.map(tx=>(
                  <div key={tx.id} className="tx-item">
                    <div className="tx-icon" style={{ background: tx.type==='income'?'rgba(52,211,153,0.15)':'rgba(251,113,133,0.15)', fontSize:17 }}>
                      {tx.category?.icon||(tx.type==='income'?'↑':'↓')}
                    </div>
                    <div className="tx-info">
                      <div className="tx-name">{tx.note||tx.category?.name||'Transaction'}</div>
                      <div className="tx-meta">{tx.date}</div>
                    </div>
                    <div className={`tx-amount ${tx.type}`}>
                      {tx.type==='income'?'+':'-'}K {fmt(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
        }
      </div>
    </div>
  );
}

// ── Main Admin Panel ──────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed]         = useState(!!sessionStorage.getItem('admin_auth'));
  const [tab, setTab]               = useState('overview');
  const [stats, setStats]           = useState(null);
  const [users, setUsers]           = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedUser, setSelectedUser]   = useState(null);
  const [annModal, setAnnModal]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Stats
      const { data: statsData } = await supabase.rpc('admin_get_stats');
      setStats(statsData);

      // Users
      const { data: usersData } = await supabase.rpc('admin_get_users');
      setUsers(usersData || []);

      // Announcements
      const { data: annData } = await supabase
        .from('announcements').select('*').order('created_at', {ascending:false});
      setAnnouncements(annData || []);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { if (authed) loadData(); }, [authed, loadData]);

  const blockUser = async (userId) => {
    await supabase.from('user_blocks').insert({ user_id: userId, reason:'Blocked by admin' });
    loadData();
  };

  const unblockUser = async (userId) => {
    await supabase.from('user_blocks').delete().eq('user_id', userId);
    loadData();
  };

  const saveAnnouncement = async (form) => {
    if (form.id) {
      await supabase.from('announcements').update({ ...form, updated_at: new Date().toISOString() }).eq('id', form.id);
    } else {
      await supabase.from('announcements').insert(form);
    }
    loadData();
  };

  const deleteAnnouncement = async (id) => {
    await supabase.from('announcements').delete().eq('id', id);
    loadData();
  };

  const signOut = () => {
    sessionStorage.removeItem('admin_auth');
    setAuthed(false);
  };

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  const filteredUsers = users.filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  const annTypeColor = { info:'var(--blue)', success:'var(--green)', warning:'var(--amber)', error:'var(--red)' };
  const annTypeIcon  = { info:'ℹ️', success:'✅', warning:'⚠️', error:'🚨' };

  const TABS = [
    { id:'overview',      label:'Overview',      icon:'📊' },
    { id:'users',         label:'Users',         icon:'👥' },
    { id:'announcements', label:'Announcements', icon:'📢' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex' }}>
      {/* Sidebar */}
      <div style={{
        width:220, background:'var(--bg2)', borderRight:'1px solid var(--border)',
        display:'flex', flexDirection:'column', padding:'24px 12px', flexShrink:0,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0 8px 24px' }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,var(--accent),var(--accent2))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🔐</div>
          <div>
            <div style={{ fontWeight:800, fontSize:14 }}>Admin Panel</div>
            <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1 }}>Shine Thit</div>
          </div>
        </div>

        <nav style={{ display:'flex', flexDirection:'column', gap:2, flex:1 }}>
          {TABS.map(t=>(
            <button key={t.id}
              onClick={()=>setTab(t.id)}
              style={{
                display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
                borderRadius:8, background: tab===t.id?'rgba(255,107,53,0.12)':'none',
                border:'none', cursor:'pointer', fontFamily:'var(--font)',
                fontSize:13, fontWeight: tab===t.id?700:500,
                color: tab===t.id?'var(--accent)':'var(--text3)',
                width:'100%', textAlign:'left', transition:'all .15s',
              }}>
              <span style={{ fontSize:16 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <button className="btn btn-ghost" style={{ justifyContent:'flex-start', gap:8, color:'var(--text3)', fontSize:13 }}
          onClick={signOut}>
          🚪 Sign Out
        </button>
      </div>

      {/* Main */}
      <div style={{ flex:1, overflowY:'auto' }}>
        <div style={{ padding:'24px 28px', maxWidth:1000 }}>

          {/* ── OVERVIEW ── */}
          {tab==='overview' && (
            <>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontFamily:'var(--font)', fontSize:24, fontWeight:800, letterSpacing:-.5 }}>Overview</div>
                <div style={{ fontSize:13, color:'var(--text3)', marginTop:3 }}>
                  {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
                </div>
              </div>

              {loading
                ? <div style={{ textAlign:'center', color:'var(--text3)', padding:40 }}>Loading stats…</div>
                : <div className="grid-4" style={{ marginBottom:20 }}>
                    <StatCard label="Total Users"        value={stats?.total_users}        icon="👥" color="var(--blue)" />
                    <StatCard label="Total Transactions" value={stats?.total_transactions} icon="↕"  color="var(--accent)" />
                    <StatCard label="Total Debts"        value={stats?.total_debts}        icon="💸" color="var(--purple)" />
                    <StatCard label="Total Vehicles"     value={stats?.total_vehicles}     icon="🚗" color="var(--teal)" />
                  </div>
              }

              <div className="grid-2">
                <div className="card">
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Today's Activity</div>
                  {[
                    { label:'New Users Today',    val: stats?.new_users_today,    icon:'👤', color:'var(--green)' },
                    { label:'Transactions Today', val: stats?.tx_today,           icon:'↕',  color:'var(--accent)' },
                    { label:'Active Announcements',val:stats?.active_announcements,icon:'📢', color:'var(--blue)' },
                  ].map(s=>(
                    <div key={s.label} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                      <div style={{ width:34, height:34, borderRadius:9, background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{s.icon}</div>
                      <div style={{ flex:1, fontSize:13, fontWeight:600 }}>{s.label}</div>
                      <div style={{ fontFamily:'var(--mono)', fontWeight:700, color:s.color }}>{fmt(s.val||0)}</div>
                    </div>
                  ))}
                </div>

                <div className="card">
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Recent Users</div>
                  {users.slice(0,5).map(u=>(
                    <div key={u.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)', cursor:'pointer' }}
                      onClick={()=>setSelectedUser(u)}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--accent2))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
                        {(u.display_name||u.email||'U')[0].toUpperCase()}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>{fmtDate(u.created_at)}</div>
                      </div>
                      {u.is_blocked && <span style={{ fontSize:11, color:'var(--red)', fontWeight:700 }}>Blocked</span>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── USERS ── */}
          {tab==='users' && (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <div>
                  <div style={{ fontSize:24, fontWeight:800, letterSpacing:-.5 }}>Users</div>
                  <div style={{ fontSize:13, color:'var(--text3)', marginTop:3 }}>{users.length} registered users</div>
                </div>
                <input className="form-input" style={{ maxWidth:240 }}
                  placeholder="Search users…" value={search} onChange={e=>setSearch(e.target.value)} />
              </div>

              <div className="card">
                {/* Table header */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 120px 80px 80px 80px', gap:12, padding:'8px 12px', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.7px', color:'var(--text3)', borderBottom:'1px solid var(--border)', marginBottom:4 }}>
                  <span>User</span><span>Joined</span><span>Txns</span><span>Status</span><span>Action</span>
                </div>

                {loading
                  ? <div style={{ textAlign:'center', padding:32, color:'var(--text3)' }}>Loading…</div>
                  : filteredUsers.length===0
                    ? <div style={{ textAlign:'center', padding:32, color:'var(--text3)' }}>No users found</div>
                    : filteredUsers.map(u=>(
                        <div key={u.id}
                          style={{ display:'grid', gridTemplateColumns:'1fr 120px 80px 80px 80px', gap:12, padding:'11px 12px', borderBottom:'1px solid var(--border)', alignItems:'center', transition:'background .1s', cursor:'pointer' }}
                          onMouseEnter={e=>e.currentTarget.style.background='var(--bg3)'}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                          onClick={()=>setSelectedUser(u)}>
                          <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                            <div style={{ width:32, height:32, borderRadius:'50%', background:`linear-gradient(135deg,var(--accent),var(--accent2))`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
                              {(u.display_name||u.email||'U')[0].toUpperCase()}
                            </div>
                            <div style={{ minWidth:0 }}>
                              <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {u.display_name || u.email?.split('@')[0]}
                              </div>
                              <div style={{ fontSize:11, color:'var(--text3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</div>
                            </div>
                          </div>
                          <div style={{ fontSize:12, color:'var(--text2)' }}>{fmtDate(u.created_at)}</div>
                          <div style={{ fontFamily:'var(--mono)', fontSize:13, fontWeight:600 }}>{fmt(u.tx_count)}</div>
                          <div>
                            {u.is_blocked
                              ? <span style={{ fontSize:11, color:'var(--red)', fontWeight:700, background:'rgba(251,113,133,0.12)', padding:'3px 8px', borderRadius:99 }}>Blocked</span>
                              : <span style={{ fontSize:11, color:'var(--green)', fontWeight:700, background:'rgba(52,211,153,0.12)', padding:'3px 8px', borderRadius:99 }}>Active</span>
                            }
                          </div>
                          <div onClick={e=>e.stopPropagation()}>
                            {u.is_blocked
                              ? <button className="btn btn-secondary btn-sm" onClick={()=>unblockUser(u.id)}>Unblock</button>
                              : <button className="btn btn-danger btn-sm" onClick={()=>blockUser(u.id)}>Block</button>
                            }
                          </div>
                        </div>
                      ))
                }
              </div>
            </>
          )}

          {/* ── ANNOUNCEMENTS ── */}
          {tab==='announcements' && (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <div>
                  <div style={{ fontSize:24, fontWeight:800, letterSpacing:-.5 }}>Announcements</div>
                  <div style={{ fontSize:13, color:'var(--text3)', marginTop:3 }}>Push messages to all users</div>
                </div>
                <button className="btn btn-primary" onClick={()=>setAnnModal({})}>+ New Announcement</button>
              </div>

              {loading
                ? <div style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>Loading…</div>
                : announcements.length===0
                  ? <div className="empty-state"><div className="empty-state-icon">📢</div><div className="empty-state-text">No announcements yet</div></div>
                  : <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {announcements.map(a=>(
                        <div key={a.id} className="card" style={{ borderColor: annTypeColor[a.type]+'33' }}>
                          <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                            <div style={{ width:40, height:40, borderRadius:12, background: annTypeColor[a.type]+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                              {annTypeIcon[a.type]}
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                                <span style={{ fontWeight:700, fontSize:15 }}>{a.title}</span>
                                <span style={{ fontSize:11, fontWeight:700, color: annTypeColor[a.type], background: annTypeColor[a.type]+'15', padding:'2px 8px', borderRadius:99 }}>
                                  {a.type}
                                </span>
                                {!a.is_active && (
                                  <span style={{ fontSize:11, fontWeight:700, color:'var(--text3)', background:'var(--bg3)', padding:'2px 8px', borderRadius:99 }}>
                                    Inactive
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>{a.body}</div>
                              <div style={{ fontSize:11, color:'var(--text3)', marginTop:6 }}>{fmtDate(a.created_at)}</div>
                            </div>
                            <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                              <button className="btn btn-secondary btn-sm" onClick={()=>setAnnModal(a)}>Edit</button>
                              <button className="btn btn-danger btn-sm" onClick={()=>deleteAnnouncement(a.id)}>Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
              }
            </>
          )}
        </div>
      </div>

      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={()=>setSelectedUser(null)}
          onBlock={blockUser} onUnblock={unblockUser} />
      )}

      {annModal !== null && (
        <AnnouncementModal onClose={()=>setAnnModal(null)} onSave={saveAnnouncement} initial={annModal} />
      )}
    </div>
  );
}
