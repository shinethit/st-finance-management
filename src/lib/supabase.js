// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL     || '';
const SUPABASE_ANON_KEY= import.meta.env.VITE_SUPABASE_ANON_KEY|| '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[Shine Thit] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// ── Auth helpers ──────────────────────────────────────────────
export const auth = {
  signUp: (email, password, name) =>
    supabase.auth.signUp({ email, password, options: { data: { full_name: name } } }),

  signIn: (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),

  signOut: () => supabase.auth.signOut(),

  resetPassword: (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    }),

  updatePassword: (newPassword) =>
    supabase.auth.updateUser({ password: newPassword }),

  getUser:     () => supabase.auth.getUser(),
  onAuthChange:(cb) => supabase.auth.onAuthStateChange(cb),
};

// ── Generic DB helpers ────────────────────────────────────────
export const db = {
  getAll: (table, query = {}) => {
    let q = supabase.from(table).select(query.select || '*');
    if (query.eq)    Object.entries(query.eq).forEach(([k,v]) => { q = q.eq(k, v); });
    if (query.order) q = q.order(query.order, { ascending: query.asc ?? false });
    if (query.limit) q = q.limit(query.limit);
    return q;
  },
  insert: async (table, data) => {
    // Auto-inject user_id for RLS — get current session user
    const { data: { user } } = await supabase.auth.getUser();
    const payload = user && !data.user_id ? { ...data, user_id: user.id } : data;
    return supabase.from(table).insert(payload).select().single();
  },
  upsert:       (table, data)     => supabase.from(table).upsert(data).select().single(),
  update:       (table, id, data) => supabase.from(table).update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single(),
  delete:       (table, id)       => supabase.from(table).delete().eq('id', id),
  getCategories:()                => supabase.from('categories').select('*').order('name'),
};
