// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth helpers ──────────────────────────────────────────────
export const auth = {
  signUp: (email, password, name) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    }),

  signIn: (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),

  signInWithGoogle: () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    }),

  signOut: () => supabase.auth.signOut(),

  resetPassword: (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    }),

  updatePassword: (newPassword) =>
    supabase.auth.updateUser({ password: newPassword }),

  getUser: () => supabase.auth.getUser(),

  onAuthChange: (cb) => supabase.auth.onAuthStateChange(cb),
};

// ── Generic DB helpers ────────────────────────────────────────
export const db = {
  // Get all rows for current user
  getAll: (table, query = {}) => {
    let q = supabase.from(table).select(query.select || '*');
    if (query.eq)     Object.entries(query.eq).forEach(([k,v]) => { q = q.eq(k, v); });
    if (query.order)  q = q.order(query.order, { ascending: query.asc ?? false });
    if (query.limit)  q = q.limit(query.limit);
    return q;
  },

  // Insert row
  insert: (table, data) =>
    supabase.from(table).insert(data).select().single(),

  // Upsert row
  upsert: (table, data) =>
    supabase.from(table).upsert(data).select().single(),

  // Update row by id
  update: (table, id, data) =>
    supabase.from(table).update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id).select().single(),

  // Delete row by id
  delete: (table, id) =>
    supabase.from(table).delete().eq('id', id),

  // Get categories (global + user's custom)
  getCategories: () =>
    supabase.from('categories').select('*').order('name'),
};
