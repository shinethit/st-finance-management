// src/hooks/useData.js — v3 (unified transactions)

import { useState, useEffect, useCallback } from 'react';
import { supabase, db } from '../lib/supabase';

function useTable(table, queryOptions = {}) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await db.getAll(table, queryOptions);
    setData(rows || []);
    setLoading(false);
  }, [table]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (item) => {
    const isNew = !item.id;
    const { data: row, error } = isNew
      ? await db.insert(table, item)
      : await db.update(table, item.id, item);
    if (error) throw error;
    setData(prev => isNew ? [row, ...prev] : prev.map(r => r.id === row.id ? row : r));
    return row;
  }, [table]);

  const del = useCallback(async (id) => {
    await db.delete(table, id);
    setData(prev => prev.filter(r => r.id !== id));
  }, [table]);

  return { data, loading, save, del, reload: load };
}

// ── Transactions ──────────────────────────────────────────────
export function useTransactions(filters = {}) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('transactions')
      .select('*, category:categories(name,icon,color), wallet:wallets(name), vehicle:vehicles(name,plate)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters.month)      q = q.gte('date', filters.month+'-01').lte('date', filters.month+'-31');
    if (filters.type)       q = q.eq('type', filters.type);
    if (filters.sub_type)   q = q.eq('sub_type', filters.sub_type);
    if (filters.vehicle_id) q = q.eq('vehicle_id', filters.vehicle_id);

    const { data: rows } = await q;
    setData(rows || []);
    setLoading(false);
  }, [filters.month, filters.type, filters.sub_type, filters.vehicle_id]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (item) => {
    const isNew = !item.id;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const FIELDS = ['id','user_id','wallet_id','category_id','vehicle_id','debt_id',
      'type','sub_type','amount','currency','note','date',
      'odometer','liters','price_per_liter','station','expense_type'];
    const payload = {};
    FIELDS.forEach(f => { if (item[f] !== undefined) payload[f] = item[f]; });
    if (isNew) payload.user_id = user.id;
    if (!isNew) payload.id = item.id;

    // ── Wallet balance update ─────────────────────────────
    if (item.wallet_id) {
      const sign = item.type === 'income' ? 1 : -1;
      const newAmt = Number(item.amount) || 0;

      if (!isNew) {
        // Get old transaction to reverse its effect
        const { data: old } = await supabase
          .from('transactions').select('amount,type,wallet_id').eq('id', item.id).single();
        if (old) {
          const oldSign = old.type === 'income' ? 1 : -1;
          const oldAmt  = Number(old.amount) || 0;
          // Reverse old on old wallet
          if (old.wallet_id) {
            const { data: oldW } = await supabase.from('wallets').select('balance').eq('id', old.wallet_id).single();
            if (oldW) await supabase.from('wallets').update({ balance: Number(oldW.balance) - oldSign * oldAmt }).eq('id', old.wallet_id);
          }
        }
      }
      // Apply new amount to new wallet
      const { data: w } = await supabase.from('wallets').select('balance').eq('id', item.wallet_id).single();
      if (w) await supabase.from('wallets').update({ balance: Number(w.balance) + sign * newAmt }).eq('id', item.wallet_id);
    }
    // ─────────────────────────────────────────────────────

    const { data: row, error } = isNew
      ? await db.insert('transactions', payload)
      : await db.update('transactions', item.id, payload);
    if (error) {
      console.error('Transaction save error:', error);
      throw error;
    }
    await load();
    return row;
  }, [load]);

  const del = useCallback(async (id) => {
    await db.delete('transactions', id);
    setData(prev => prev.filter(r => r.id !== id));
  }, []);

  return { data, loading, save, del, reload: load };
}

// ── Vehicle Expenses (sub_type='vehicle' transactions) ────────
export function useVehicleExpenses(vehicleId) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('transactions')
      .select('*, vehicle:vehicles(name,plate)')
      .eq('sub_type', 'vehicle')
      .order('date', { ascending: false });
    if (vehicleId) q = q.eq('vehicle_id', vehicleId);
    const { data: rows } = await q;
    setData(rows || []);
    setLoading(false);
  }, [vehicleId]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (item) => {
    const payload = { ...item, type: 'expense', sub_type: 'vehicle' };
    const isNew = !payload.id;
    const { data: row, error } = isNew
      ? await db.insert('transactions', payload)
      : await db.update('transactions', payload.id, payload);
    if (error) throw error;
    if (payload.vehicle_id && payload.odometer) {
      await supabase.from('vehicles')
        .update({ odometer: payload.odometer, updated_at: new Date().toISOString() })
        .eq('id', payload.vehicle_id);
    }
    await load();
    return row;
  }, [load]);

  const del = useCallback(async (id) => {
    await db.delete('transactions', id);
    setData(prev => prev.filter(r => r.id !== id));
  }, []);

  return { data, loading, save, del, reload: load };
}

// ── Categories ────────────────────────────────────────────────
export function useCategories() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await db.getCategories();
    setData(rows || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveCategory = useCallback(async (cat) => {
    const isNew = !cat.id;
    // Get current user_id for RLS
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const payload = { ...cat, is_custom: true };
    if (isNew) payload.user_id = user.id;

    const { data: row, error } = isNew
      ? await db.insert('categories', payload)
      : await db.update('categories', cat.id, payload);

    if (error) {
      console.error('saveCategory error:', error);
      throw error;
    }
    // Full reload so parent-child relationships refresh correctly
    await load();
    return row;
  }, [load]);

  const del = useCallback(async (id) => {
    await db.delete('categories', id);
    setData(prev => prev.filter(r => r.id !== id));
  }, []);

  return { data, loading, saveCategory, del, reload: load };
}

export function useWallets() {
  return useTable('wallets', { order: 'created_at', asc: true });
}

// ── Budgets (fixed amount OR % of income) ─────────────────────
export function useBudgets() {
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [monthIncome, setMonthIncome] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const now      = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

    const [budgetsRes, incomeRes] = await Promise.all([
      supabase.from('budgets').select('*, category:categories(name,icon,color)').order('created_at'),
      supabase.from('transactions').select('amount')
        .eq('type','income').gte('date', monthStr+'-01').lte('date', monthStr+'-31'),
    ]);

    const income = (incomeRes.data || []).reduce((s,t) => s + Number(t.amount), 0);
    setMonthIncome(income);

    setData((budgetsRes.data || []).map(b => ({
      ...b,
      effective_amount: b.budget_type === 'percent'
        ? income * (b.percent_of_income / 100)
        : Number(b.amount),
    })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (item) => {
    const isNew = !item.id;
    const { data: row, error } = isNew
      ? await db.insert('budgets', item)
      : await db.update('budgets', item.id, item);
    if (error) throw error;
    await load();
    return row;
  }, [load]);

  const del = useCallback(async (id) => {
    await db.delete('budgets', id);
    setData(prev => prev.filter(r => r.id !== id));
  }, []);

  return { data, loading, monthIncome, save, del, reload: load };
}

export function useSavings() {
  return useTable('savings', { order: 'created_at' });
}

export function useVehicles() {
  return useTable('vehicles', { order: 'created_at', asc: true });
}

// ── Reminders ─────────────────────────────────────────────────
export function useReminders(vehicleId) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('reminders').select('*').eq('is_done', false).order('due_date');
    if (vehicleId) q = q.eq('vehicle_id', vehicleId);
    const { data: rows } = await q;
    setData(rows || []);
    setLoading(false);
  }, [vehicleId]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (item) => {
    const isNew = !item.id;
    const { data: row, error } = isNew
      ? await db.insert('reminders', item)
      : await db.update('reminders', item.id, item);
    if (error) throw error;
    await load();
    return row;
  }, [load]);

  const del = useCallback(async (id) => {
    await db.delete('reminders', id);
    setData(prev => prev.filter(r => r.id !== id));
  }, []);

  const markDone = useCallback(async (id) => {
    await db.update('reminders', id, { is_done: true });
    setData(prev => prev.filter(r => r.id !== id));
  }, []);

  return { data, loading, save, del, markDone, reload: load };
}

// ── Debts (auto-creates linked transactions) ──────────────────
export function useDebts() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from('debts')
      .select('*, payments:debt_payments(*)')
      .order('created_at', { ascending: false });
    setData(rows || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (item) => {
    const isNew = !item.id;
    const { data: row, error } = isNew
      ? await db.insert('debts', item)
      : await db.update('debts', item.id, item);
    if (error) throw error;

    if (isNew) {
      await db.insert('transactions', {
        type:     item.direction === 'lend' ? 'expense' : 'income',
        sub_type: item.direction === 'lend' ? 'debt_out' : 'debt_in',
        amount:   item.total_amount,
        debt_id:  row.id,
        note:     `${item.direction === 'lend' ? 'Lent to' : 'Borrowed from'} ${item.contact_name}`,
        date:     new Date().toISOString().slice(0, 10),
      });
    }
    await load();
    return row;
  }, [load]);

  const del = useCallback(async (id) => {
    await db.delete('debts', id);
    setData(prev => prev.filter(r => r.id !== id));
  }, []);

  const addPayment = useCallback(async (debtId, amount, note = '') => {
    const debt = data.find(d => d.id === debtId);
    if (!debt) return;

    const { data: tx } = await db.insert('transactions', {
      type:     debt.direction === 'lend' ? 'income' : 'expense',
      sub_type: debt.direction === 'lend' ? 'debt_in' : 'debt_out',
      amount,
      debt_id:  debtId,
      note:     note || `Payment ${debt.direction === 'lend' ? 'from' : 'to'} ${debt.contact_name}`,
      date:     new Date().toISOString().slice(0, 10),
    });

    await db.insert('debt_payments', {
      debt_id:        debtId,
      transaction_id: tx?.id,
      amount,
      note,
      date: new Date().toISOString().slice(0, 10),
    });

    const newPaid = Number(debt.paid_amount) + Number(amount);
    await db.update('debts', debtId, {
      paid_amount: newPaid,
      status: newPaid >= Number(debt.total_amount) ? 'settled' : 'active',
    });

    await load();
  }, [data, load]);

  return { data, loading, save, del, addPayment, reload: load };
}

// ── Dashboard ─────────────────────────────────────────────────
export function useDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const now      = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

    const [txRes, budgetRes, savingsRes, vehicleRes, reminderRes, debtRes] = await Promise.all([
      supabase.from('transactions')
        .select('type,sub_type,amount,note,date,category:categories(name,icon)')
        .gte('date', monthStr+'-01').lte('date', monthStr+'-31'),
      supabase.from('budgets').select('*'),
      supabase.from('savings').select('current_amount'),
      supabase.from('vehicles').select('id'),
      supabase.from('reminders').select('id,due_date').eq('is_done', false),
      supabase.from('debts').select('direction,total_amount,paid_amount,status'),
    ]);

    const txs     = txRes.data || [];
    const income  = txs.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0);
    const debts   = debtRes.data || [];

    const budgets = (budgetRes.data || []).map(b => ({
      ...b,
      effective_amount: b.budget_type === 'percent'
        ? income * (b.percent_of_income / 100)
        : Number(b.amount),
    }));

    setSummary({
      monthIncome:       income,
      monthExpense:      expense,
      monthBalance:      income - expense,
      totalSavings:      (savingsRes.data || []).reduce((s,g) => s + Number(g.current_amount), 0),
      vehicleCount:      (vehicleRes.data || []).length,
      overdueReminders:  (reminderRes.data || []).filter(r => r.due_date && new Date(r.due_date) < now).length,
      totalLent:         debts.filter(d => d.direction==='lend'   && d.status!=='settled').reduce((s,d) => s+Number(d.total_amount)-Number(d.paid_amount), 0),
      totalBorrowed:     debts.filter(d => d.direction==='borrow' && d.status!=='settled').reduce((s,d) => s+Number(d.total_amount)-Number(d.paid_amount), 0),
      recentTransactions: txs.slice(0, 5),
      budgets,
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  return { summary, loading, reload: load };
}

// ── Custom Trackers ────────────────────────────────────────────
export function useCustomTrackers() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from('custom_trackers')
      .select('*')
      .order('created_at', { ascending: false });
    setData(rows || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (item) => {
    const isNew = !item.id;
    const payload = { ...item, updated_at: new Date().toISOString() };
    const { data: row } = isNew
      ? await supabase.from('custom_trackers').insert(payload).select().single()
      : await supabase.from('custom_trackers').update(payload).eq('id', item.id).select().single();
    setData(prev => isNew ? [row, ...prev] : prev.map(r => r.id === row.id ? row : r));
    return row;
  }, []);

  const del = useCallback(async (id) => {
    await supabase.from('custom_trackers').delete().eq('id', id);
    setData(prev => prev.filter(r => r.id !== id));
  }, []);

  // Get monthly totals for a tracker (last 6 months)
  const getTrackerData = useCallback(async (tracker) => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      months.push(d.toISOString().slice(0, 7));
    }

    const results = await Promise.all(months.map(async (m) => {
      let q = supabase
        .from('transactions')
        .select('amount, note, category_id, category:categories(parent_id)')
        .eq('type', 'expense')
        .gte('date', m + '-01')
        .lte('date', m + '-31');

      if (tracker.filter_type === 'note_contains') {
        q = q.ilike('note', `%${tracker.filter_value}%`);
      } else if (tracker.filter_type === 'category') {
        q = q.eq('category_id', tracker.filter_value);
      } else if (tracker.filter_type === 'subcategory') {
        q = q.eq('category_id', tracker.filter_value);
      }

      const { data: rows } = await q;
      const total = (rows || []).reduce((s, r) => s + Number(r.amount), 0);
      return { month: m, total };
    }));

    return results;
  }, []);

  return { data, loading, save, del, reload: load, getTrackerData };
}

// ── Wallet CRUD (explicit, with balance update) ───────────────
export function useWalletManager() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from('wallets').select('*').order('created_at', { ascending: true });
    setData(rows || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (item) => {
    const isNew = !item.id;
    const payload = { ...item, updated_at: new Date().toISOString() };
    const { data: row } = isNew
      ? await supabase.from('wallets').insert(payload).select().single()
      : await supabase.from('wallets').update(payload).eq('id', item.id).select().single();
    setData(prev => isNew ? [...prev, row] : prev.map(r => r.id === row.id ? row : r));
    return row;
  }, []);

  const del = useCallback(async (id) => {
    await supabase.from('wallets').delete().eq('id', id);
    setData(prev => prev.filter(r => r.id !== id));
  }, []);

  return { data, loading, save, del, reload: load };
}
