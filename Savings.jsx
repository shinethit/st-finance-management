import { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import './App.css';
import App from './App.jsx';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{
        minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
        background:'#0f0f11', color:'#fbbf24', fontFamily:'monospace', padding:32, flexDirection:'column', gap:16,
      }}>
        <div style={{ fontSize:40 }}>✦</div>
        <div style={{ fontSize:18, fontWeight:700 }}>Shine Thit — Startup Error</div>
        <div style={{ fontSize:13, color:'#f87171', background:'rgba(248,113,113,0.1)', padding:'12px 20px', borderRadius:10, maxWidth:500, wordBreak:'break-all' }}>
          {this.state.error?.message || 'Unknown error'}
        </div>
        <div style={{ fontSize:12, color:'#6b7280' }}>
          Check: Vercel → Settings → Environment Variables → VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
        </div>
        <button onClick={() => window.location.reload()}
          style={{ padding:'10px 24px', borderRadius:8, background:'#d97706', color:'#fff', border:'none', cursor:'pointer', fontWeight:700 }}>
          Retry
        </button>
      </div>
    );
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
