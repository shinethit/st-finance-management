// src/pages/Auth.jsx — Login + Register
import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode]         = useState('login'); // 'login' | 'register'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');
    setSuccess('');

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

return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '36px',
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>✦</div>
          <div style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.5px' }}>Shine Thit</div>
          <div style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '4px' }}>
            Personal Finance Management
          </div>
        </div>

        {/* Tab switcher */}
        <div className="type-toggle" style={{ marginBottom: '24px' }}>
          <button className={`type-btn expense ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
            Sign In
          </button>
          <button className={`type-btn income ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>
            Create Account
          </button>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          {error   && <div style={{ fontSize: 13, color: 'var(--red)',   background: 'rgba(239,68,68,0.1)',   padding: '10px 12px', borderRadius: 8 }}>{error}</div>}
          {success && <div style={{ fontSize: 13, color: 'var(--green)', background: 'rgba(34,197,94,0.1)',   padding: '10px 12px', borderRadius: 8 }}>{success}</div>}

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
            onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>


        </div>
      </div>
    </div>
  );
}
