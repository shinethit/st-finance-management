// src/pages/Auth.jsx — Login + Register + Forgot Password + Reset Password
import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';

export default function Auth() {
  const { signIn, signUp, resetPassword, updatePassword } = useAuth();

  const isResetPage = window.location.pathname === '/reset-password';

  const [mode, setMode]         = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [name, setName]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  // ── Reset Password Page ───────────────────────────────────────
  if (isResetPage) {
    const handleReset = async () => {
      if (!password || !confirm) return;
      if (password !== confirm) { setError('Passwords do not match.'); return; }
      if (password.length < 6)  { setError('Password must be at least 6 characters.'); return; }
      setLoading(true); setError('');
      const { error } = await updatePassword(password);
      if (error) { setError(error.message); }
      else {
        setSuccess('Password updated! Redirecting…');
        setTimeout(() => { window.location.href = '/'; }, 1500);
      }
      setLoading(false);
    };

    return (
      <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
        <div style={{ width:'100%', maxWidth:400, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:20, padding:36 }}>
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ fontSize:36, marginBottom:8 }}>🔑</div>
            <div style={{ fontSize:22, fontWeight:600, letterSpacing:'-0.5px' }}>Set New Password</div>
            <div style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}>Shine Thit</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleReset()} />
            </div>
            {error   && <div style={{ fontSize:13, color:'var(--red)',   background:'rgba(239,68,68,0.1)',  padding:'10px 12px', borderRadius:8 }}>{error}</div>}
            {success && <div style={{ fontSize:13, color:'var(--green)', background:'rgba(34,197,94,0.1)',  padding:'10px 12px', borderRadius:8 }}>{success}</div>}
            <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:11 }}
              onClick={handleReset} disabled={loading}>
              {loading ? 'Please wait…' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Auth Page ────────────────────────────────────────────
  const handleSubmit = async () => {
    if (mode === 'forgot') {
      if (!email) return;
      setLoading(true); setError(''); setSuccess('');
      const { error } = await resetPassword(email);
      if (error) setError(error.message);
      else setSuccess('Password reset email sent! Please check your inbox.');
      setLoading(false);
      return;
    }
    if (!email || !password) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password, name);
        if (error) throw error;
        setSuccess('Account created! Please check your email to confirm.');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => { setMode(m); setError(''); setSuccess(''); };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ width:'100%', maxWidth:400, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:20, padding:36 }}>

        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:36, marginBottom:8 }}>✦</div>
          <div style={{ fontSize:22, fontWeight:600, letterSpacing:'-0.5px' }}>Shine Thit</div>
          <div style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}>Personal Finance Management</div>
        </div>

        {mode !== 'forgot' && (
          <div className="type-toggle" style={{ marginBottom:24 }}>
            <button className={`type-btn expense ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}>Sign In</button>
            <button className={`type-btn income ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}>Create Account</button>
          </div>
        )}

        {mode === 'forgot' && (
          <div style={{ marginBottom:24 }}>
            <button onClick={() => switchMode('login')}
              style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:13, padding:0, display:'flex', alignItems:'center', gap:6 }}>
              ← Back to Sign In
            </button>
            <div style={{ fontSize:18, fontWeight:600, marginTop:12 }}>Forgot Password</div>
            <div style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}>Enter your email and we'll send a reset link.</div>
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" type="text" placeholder="Your name"
                value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          {mode !== 'forgot' && (
            <div className="form-group">
              <label className="form-label" style={{ display:'flex', justifyContent:'space-between' }}>
                <span>Password</span>
                {mode === 'login' && (
                  <button onClick={() => switchMode('forgot')}
                    style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontSize:12, padding:0 }}>
                    Forgot password?
                  </button>
                )}
              </label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
          )}

          {error   && <div style={{ fontSize:13, color:'var(--red)',   background:'rgba(239,68,68,0.1)',  padding:'10px 12px', borderRadius:8 }}>{error}</div>}
          {success && <div style={{ fontSize:13, color:'var(--green)', background:'rgba(34,197,94,0.1)',  padding:'10px 12px', borderRadius:8 }}>{success}</div>}

          <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:11 }}
            onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait…'
              : mode === 'login'    ? 'Sign In'
              : mode === 'register' ? 'Create Account'
              : 'Send Reset Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
