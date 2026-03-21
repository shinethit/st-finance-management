// src/pages/Vehicles.jsx — Supabase version (snake_case fields)
import { useLang } from '../lib/LangContext';
import { useState } from 'react';
import { useVehicles, useVehicleExpenses, useReminders } from '../hooks/useData';

const fmt = n => new Intl.NumberFormat('en-US').format(Math.abs(Number(n) || 0));
const today = () => new Date().toISOString().slice(0, 10);

const FUEL_TYPES     = ['Gasoline','Diesel','Electric','Hybrid','CNG'];
const VEHICLE_TYPES  = ['Car','Motorcycle','Truck','Van','Bus','Other'];
const EXP_TYPES      = [t('fuel'),'Service','Wash','Tyre','Insurance','Tax','Fine','Parking','Other'];
const REMINDER_TYPES = ['Oil Change','Tyre Rotation','Brake Check','Insurance','Road Tax','Registration','Service','Other'];
const TYPE_ICONS     = { Car:'🚗', Motorcycle:'🏍️', Truck:'🚛', Van:'🚐', Bus:'🚌', Other:'🚙' };
const EXP_ICONS      = { Fuel:'⛽', Service:'🔧', Wash:'💧', Tyre:'🔘', Insurance:'🛡️', Tax:'📋', Fine:'⚠️', Parking:'🅿️', Other:'📦' };

function VehicleModal({ onClose, onSave, initial }) {
  const { t } = useLang();
  const [form, setForm] = useState({
    name: '', brand: '', model: '', year: '',
    plate: '', type: 'Car', odometer: '',
    fuel_type: 'Gasoline', color: '#7c6aff',
    ...initial,
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{initial?.id ? t('edit') : 'Add'} Vehicle</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">{t('nickname')}</label>
            <input className="form-input" placeholder="e.g. My Honda" value={form.name}
              onChange={e => set('name', e.target.value)} autoFocus />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t('brand')}</label>
              <input className="form-input" placeholder="Honda" value={form.brand}
                onChange={e => set('brand', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('model')}</label>
              <input className="form-input" placeholder="Civic" value={form.model}
                onChange={e => set('model', e.target.value)} />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t('year')}</label>
              <input className="form-input" type="number" placeholder="2020" value={form.year}
                onChange={e => set('year', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('plate')}</label>
              <input className="form-input" placeholder="ABC-1234" value={form.plate}
                onChange={e => set('plate', e.target.value)} />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t('type')}</label>
              <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
                {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('fuel_type')}</label>
              <select className="form-select" value={form.fuel_type} onChange={e => set('fuel_type', e.target.value)}>
                {FUEL_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Current Odometer (km)</label>
            <input className="form-input" type="number" placeholder="0" value={form.odometer}
              onChange={e => set('odometer', e.target.value)} />
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { if (!form.name) return; onSave(form); onClose(); }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpenseModal({ vehicleId, onClose, onSave, initial }) {
  const { t } = useLang();
  const [form, setForm] = useState({
    vehicle_id: vehicleId, type: t('fuel'),
    amount: '', odometer: '', liters: '',
    price_per_liter: '', station: '', note: '', date: today(),
    ...initial,
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const isFuel = form.type === t('fuel');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{initial?.id ? t('edit') : 'Add'} Expense</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">{t('type')}</label>
            <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
              {EXP_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t('amount')}</label>
              <input className="form-input" type="number" placeholder="0" value={form.amount}
                onChange={e => set('amount', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Odometer (km)</label>
              <input className="form-input" type="number" placeholder="0" value={form.odometer}
                onChange={e => set('odometer', e.target.value)} />
            </div>
          </div>
          {isFuel && (
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{t('liters')}</label>
                <input className="form-input" type="number" step="0.01" placeholder="0.00"
                  value={form.liters} onChange={e => set('liters', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('price_per_liter')}</label>
                <input className="form-input" type="number" step="0.01" placeholder="0.00"
                  value={form.price_per_liter} onChange={e => set('price_per_liter', e.target.value)} />
              </div>
            </div>
          )}
          {isFuel && (
            <div className="form-group">
              <label className="form-label">{t('station')}</label>
              <input className="form-input" placeholder="e.g. Shell, Caltex" value={form.station}
                onChange={e => set('station', e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">{t('date')}</label>
            <input className="form-input" type="date" value={form.date}
              onChange={e => set('date', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('note')}</label>
            <input className="form-input" placeholder="Optional…" value={form.note}
              onChange={e => set('note', e.target.value)} />
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { if (!form.amount) return; onSave({ ...form, amount: Number(form.amount) }); onClose(); }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReminderModal({ vehicleId, onClose, onSave, initial }) {
  const { t } = useLang();
  const [form, setForm] = useState({
    vehicle_id: vehicleId, type: 'Oil Change',
    title: '', due_date: '', due_odometer: '',
    notes: '', is_done: false,
    ...initial,
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{initial?.id ? t('edit') : 'Add'} Reminder</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">{t('type')}</label>
            <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
              {REMINDER_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('title')}</label>
            <input className="form-input" placeholder="e.g. Change engine oil" value={form.title}
              onChange={e => set('title', e.target.value)} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" value={form.due_date}
                onChange={e => set('due_date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Due at (km)</label>
              <input className="form-input" type="number" placeholder="Optional"
                value={form.due_odometer} onChange={e => set('due_odometer', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('notes')}</label>
            <textarea className="form-textarea" placeholder="Optional…" value={form.notes}
              onChange={e => set('notes', e.target.value)} />
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { onSave(form); onClose(); }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VehicleDetail({ vehicle, onBack, onEdit }) {
  const { t } = useLang();
  const { data: expenses, save: saveExpense, del: delExpense } = useVehicleExpenses(vehicle.id);
  const { data: reminders, save: saveReminder, del: delReminder, markDone } = useReminders(vehicle.id);
  const [tab, setTab]         = useState('expenses');
  const [expModal, setExpModal]   = useState(null);
  const [remModal, setRemModal]   = useState(null);

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const fuelEntries   = expenses.filter(e => e.type === t('fuel'));
  const totalLiters   = fuelEntries.reduce((s, e) => s + Number(e.liters || 0), 0);
  const now           = new Date();
  const overdueCount  = reminders.filter(r => r.due_date && new Date(r.due_date) < now).length;

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-icon" onClick={onBack}>←</button>
          <div>
            <div className="page-title">{vehicle.name}</div>
            <div className="page-subtitle">
              {[vehicle.brand, vehicle.model].filter(Boolean).join(' ')}
              {vehicle.plate    ? ` · ${vehicle.plate}` : ''}
              {vehicle.odometer ? ` · ${fmt(vehicle.odometer)} km` : ''}
            </div>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={onEdit}>Edit</button>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">{t('total_expenses')}</div>
          <div className="stat-value negative">{fmt(totalExpenses)}</div>
          <div className="stat-sub">{expenses.length} records</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('total_fuel')}</div>
          <div className="stat-value accent">{totalLiters.toFixed(1)} L</div>
          <div className="stat-sub">{fuelEntries.length} fill-ups</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('reminders')}</div>
          <div className={`stat-value ${overdueCount > 0 ? 'negative' : 'positive'}`}>
            {overdueCount > 0 ? `${overdueCount} overdue` : `${reminders.length} pending`}
          </div>
          <div className="stat-sub">active</div>
        </div>
      </div>

      <div className="type-toggle" style={{ marginBottom: 20, maxWidth: 280 }}>
        <button className={`type-btn expense ${tab === 'expenses' ? 'active' : ''}`} onClick={() => setTab('expenses')}>{t('expenses')}</button>
        <button className={`type-btn income ${tab === 'reminders' ? 'active' : ''}`} onClick={() => setTab('reminders')}>{t('reminders')}</button>
      </div>

      {tab === 'expenses' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn btn-primary" onClick={() => setExpModal({})}>+ Add Expense</button>
          </div>
          {expenses.length === 0
            ? <div className="empty-state"><div className="empty-state-icon">⛽</div><div className="empty-state-text">{t('no_expenses')}</div></div>
            : <div className="tx-list">
                {expenses.map(e => (
                  <div key={e.id} className="tx-item">
                    <div className="tx-icon" style={{ background: 'rgba(245,158,11,0.12)', fontSize: 18 }}>
                      {EXP_ICONS[e.type] || '📦'}
                    </div>
                    <div className="tx-info">
                      <div className="tx-name">{e.type}{e.station ? ` · ${e.station}` : ''}</div>
                      <div className="tx-meta">
                        {e.date}
                        {e.odometer ? ` · ${fmt(e.odometer)} km` : ''}
                        {e.liters   ? ` · ${Number(e.liters).toFixed(1)} L` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="tx-amount expense">{fmt(e.amount)}</div>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--red)' }}
                        onClick={() => delExpense(e.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
          }
        </>
      )}

      {tab === 'reminders' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn btn-primary" onClick={() => setRemModal({})}>+ Add Reminder</button>
          </div>
          {reminders.length === 0
            ? <div className="empty-state"><div className="empty-state-icon">🔔</div><div className="empty-state-text">{t('no_reminders')}</div></div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reminders.map(r => {
                  const overdue = r.due_date && new Date(r.due_date) < now;
                  return (
                    <div key={r.id} className="card" style={{ borderColor: overdue ? 'rgba(239,68,68,0.3)' : 'var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 500 }}>{r.title || r.type}</span>
                            {overdue && <span className="badge badge-expense">{t('overdue')}</span>}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                            {r.due_date     && `Due: ${r.due_date}`}
                            {r.due_odometer && ` · At: ${fmt(r.due_odometer)} km`}
                          </div>
                          {r.notes && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{r.notes}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => markDone(r.id)}>✓ Done</button>
                          <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--red)' }}
                            onClick={() => delReminder(r.id)}>✕</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </>
      )}

      {expModal !== null && (
        <ExpenseModal vehicleId={vehicle.id} onClose={() => setExpModal(null)} onSave={saveExpense} initial={expModal} />
      )}
      {remModal !== null && (
        <ReminderModal vehicleId={vehicle.id} onClose={() => setRemModal(null)} onSave={saveReminder} initial={remModal} />
      )}
    </div>
  );
}

export default function Vehicles() {
  const { t } = useLang();
  const { data: vehicles, loading, save, del } = useVehicles();
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);

  if (selected) {
    const vehicle = vehicles.find(v => v.id === selected);
    if (vehicle) return (
      <VehicleDetail vehicle={vehicle} onBack={() => setSelected(null)} onEdit={() => setModal(vehicle)} />
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">{t('vehicles')}</div>
          <div className="page-subtitle">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>+ Add Vehicle</button>
      </div>

      {loading
        ? <div className="empty-state"><div className="empty-state-text">Loading…</div></div>
        : vehicles.length === 0
          ? <div className="empty-state">
              <div className="empty-state-icon">⬡</div>
              <div className="empty-state-text">{t('no_vehicles')}</div>
            </div>
          : <div className="grid-2">
              {vehicles.map(v => (
                <div key={v.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelected(v.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(124,106,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                      {TYPE_ICONS[v.type] || '🚙'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{v.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                        {[v.brand, v.model, v.year].filter(Boolean).join(' ')}
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--red)' }}
                      onClick={e => { e.stopPropagation(); del(v.id); }}>✕</button>
                  </div>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('plate')}</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 13, marginTop: 2 }}>{v.plate || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('odometer')}</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 13, marginTop: 2 }}>
                        {v.odometer ? fmt(v.odometer) + ' km' : '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('fuel')}</div>
                      <div style={{ fontSize: 13, marginTop: 2 }}>{v.fuel_type || '—'}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', color: 'var(--accent2)', fontSize: 13 }}>
                    View details →
                  </div>
                </div>
              ))}
            </div>
      }

      {modal !== null && (
        <VehicleModal onClose={() => setModal(null)} onSave={async v => { await save(v); setModal(null); }} initial={modal} />
      )}
    </div>
  );
}
